// Rent Tracker — thin orchestration shell.
import { useEffect, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { Avatar, NavItem } from '../../ds-vendor/components';
import {
  Hamburger,
  ResponsiveShell,
  ThemeToggle,
  ToastHost,
  Icon,
  di,
  useDrawer,
  useTheme,
  useToast,
} from '../../components/ui';
import { useAuth } from '../../lib/auth';
import { rememberApp } from '../../lib/nav';
import { PeriodPicker, Popover } from './charts';
import {
  MONTH_NAMES,
  NAV,
  useHouses,
  useReceipts,
  type Room,
  type RoomStatus,
} from './data';
import { firebaseConfigured } from '../../lib/firebase';
import { addHouse as addHouseFS, saveRoom, addReceipt, addRentEntry, saveExpenseEntry, linkExpenseReceipt, subscribeExpenseEntries } from '../../lib/rentService';
import { AddHouseDrawer, EditRoomDrawer, AddRentDrawer, type AddRentCtx } from './forms';
import {
  EntryWizard,
  UploadReceiptDrawer,
  ReceiptPickerDialog,
  ReceiptViewerDialog,
  type EntryCtx,
  type EntrySubmit,
  type PickerCtx,
  type UploadedReceipt,
  type ViewerCtx,
} from './entries';
import { Dashboard } from './Dashboard';
import { YearGrid } from './YearGrid';
import { Houses } from './Houses';
import { Expenses } from './Expenses';
import { Receipts } from './Receipts';

const chipBtn: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 7,
  padding: '7px 12px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--border-default)',
  background: 'var(--surface-card)',
  cursor: 'pointer',
  fontSize: 'var(--text-sm)',
  color: 'var(--text-body)',
};
const menuItem = (on: boolean): CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  width: '100%',
  padding: '10px 14px',
  border: 'none',
  cursor: 'pointer',
  textAlign: 'left',
  background: on ? 'var(--surface-active-nav)' : 'transparent',
  color: on ? 'var(--brand-on-tint)' : 'var(--text-body)',
  fontSize: 'var(--text-sm)',
  fontWeight: on ? 600 : 500,
});

/* ---------------- Sidebar nav row ---------------- */
function RentNav({ n, active, onClick }: { n: { id: string; label: string; icon: string }; active: boolean; onClick: (id: string) => void }) {
  const { close } = useDrawer();
  return (
    <NavItem
      icon={di(n.icon)}
      label={n.label}
      active={active}
      onClick={() => { onClick(n.id); close(); }}
      style={{ margin: '0px', padding: '16px 12px' }}
    />
  );
}

/* ---------------- App inner (has toast context) ---------------- */
function RentInner() {
  const { user } = useAuth();
  const [view, setView] = useState('home');
  const [houseId, setHouseId] = useState('maple');
  const [month, setMonth] = useState(5);
  const [year, setYear] = useState(2026);
  const [theme, toggleTheme] = useTheme('rent');
  const [houseOpen, setHouseOpen] = useState(false);
  const [periodOpen, setPeriodOpen] = useState(false);
  const toast = useToast();

  const { houses, setHouses, loading: housesLoading, error: housesError, retry: retryHouses } = useHouses();
  const { receipts, setReceipts, loading: receiptsLoading, error: receiptsError, retry: retryReceipts } = useReceipts();
  const [links, setLinks] = useState<Record<string, string>>({});
  const [vals, setVals] = useState<Record<string, number>>({});
  const [expLoading, setExpLoading] = useState(false);
  const [expError, setExpError] = useState<Error | null>(null);
  const [expRetryCount, setExpRetryCount] = useState(0);

  // dialog controllers
  const [addHouse, setAddHouse] = useState(false);
  const [editRoom, setEditRoom] = useState<Room | null>(null);
  const [addRent, setAddRent] = useState<AddRentCtx | null>(null);
  const [entry, setEntry] = useState<EntryCtx | null>(null);
  const [upload, setUpload] = useState(false);
  const [picker, setPicker] = useState<PickerCtx | null>(null);
  const [viewer, setViewer] = useState<ViewerCtx | null>(null);

  useEffect(() => {
    if (!housesLoading && houses.length === 0) setAddHouse(true);
  }, [housesLoading]);

  useEffect(() => {
    if (houses.length > 0 && !houses.find((h) => h.id === houseId)) {
      setHouseId(houses[0].id);
    }
  }, [houses, houseId]);

  useEffect(() => {
    if (!firebaseConfigured || !user || !houseId) return;
    setExpLoading(true);
    setExpError(null);
    return subscribeExpenseEntries(user.uid, houseId, year, (entries) => {
      const v: Record<string, number> = {};
      const l: Record<string, string> = {};
      for (const e of entries) {
        v[e.category + '-' + e.month] = e.amount;
        if (e.receiptId) l[e.category + '-' + e.month] = e.receiptId;
      }
      setVals(v);
      setLinks(l);
      setExpLoading(false);
    }, (err) => {
      setExpError(err);
      setExpLoading(false);
    });
  }, [user?.uid, houseId, year, expRetryCount]);

  const house = houses.find((h) => h.id === houseId) ?? houses[0];
  const roomCount = houses.reduce((s, h) => s + h.rooms.length, 0);
  const period = MONTH_NAMES[month] + ' ' + year;
  const linkedIds = Object.values(links);
  const unlinked = receipts.filter((r) => !linkedIds.includes(r.id));

  const updateRoom = async (room: Room) => {
    const targetHouse = houses.find((h) => h.id === houseId);
    if (!targetHouse) return;
    const updatedRooms = targetHouse.rooms.map((r) => (r.id === room.id ? room : r));
    if (firebaseConfigured && user) {
      await saveRoom(user.uid, houseId, updatedRooms);
    } else {
      setHouses((hs) =>
        hs.map((h) => (h.id !== houseId ? h : { ...h, rooms: updatedRooms })),
      );
    }
  };

  const sidebar = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '18px 16px 14px' }}>
        <Link to="/" title="Back to launcher" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <img src="/assets/logo-mark.svg" width={30} height={30} alt="" />
          <span style={{ fontSize: 'var(--text-md)', fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--text-heading)' }}>
            Rent Tracker
          </span>
        </Link>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 12px' }}>
        {NAV.map((n) => <RentNav key={n.id} n={n} active={view === n.id} onClick={setView} />)}
      </div>
      <div style={{ padding: '6px 12px 4px', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="eyebrow" style={{ padding: '10px 8px 8px' }}>Suite</div>
        {[
          { label: 'Houses', icon: 'building-2', to: '/houses' },
          { label: 'Maintenance Scheduler', icon: 'calendar-check-2', to: '/maintenance' },
          { label: 'Tenant Bridge', icon: 'messages-square', to: '/tenant-bridge' },
        ].map((l) => (
          <Link key={l.to} to={l.to} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '9px 12px',
            borderRadius: 'var(--radius-md)', textDecoration: 'none', color: 'var(--text-body)',
            fontSize: 'var(--text-base)', fontWeight: 500 }}>
            <Icon name={l.icon} size={18} style={{ color: 'var(--text-muted)' }} />
            <span style={{ flex: 1 }}>{l.label}</span>
            <Icon name="arrow-up-right" size={14} style={{ color: 'var(--text-faint)' }} />
          </Link>
        ))}
      </div>
      <div style={{ padding: '14px 18px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600 }}>
          {houses.length} houses · {roomCount} rooms
        </span>
        <ThemeToggle theme={theme} onToggle={toggleTheme} size="sm" />
      </div>
    </div>
  );

  const topBar = (
    <div className="ps-topbar" style={{ gap: 10 }}>
      <Hamburger />
      <div style={{ position: 'relative' }}>
        <button onClick={() => setHouseOpen((o) => !o)} style={chipBtn}>
          <Icon name="house" size={16} style={{ color: 'var(--text-muted)' }} />
          <span style={{ fontWeight: 600 }}>{house?.name}</span>
          <Icon name="chevron-down" size={15} style={{ color: 'var(--text-faint)' }} />
        </button>
        <Popover open={houseOpen} onClose={() => setHouseOpen(false)}>
          {houses.map((h) => (
            <button key={h.id} onClick={() => { setHouseId(h.id); setHouseOpen(false); }} style={menuItem(h.id === houseId)}>
              <Icon name="building-2" size={16} style={{ color: 'var(--text-muted)' }} />{h.name}
            </button>
          ))}
        </Popover>
      </div>
      <div style={{ position: 'relative', margin: '0 auto' }}>
        <button onClick={() => setPeriodOpen((o) => !o)} style={{ ...chipBtn, background: 'var(--surface-sunken)' }}>
          <Icon name="calendar" size={15} style={{ color: 'var(--text-muted)' }} />
          <span style={{ fontWeight: 600 }}>{MONTH_NAMES[month]} {year}</span>
        </button>
        <Popover open={periodOpen} onClose={() => setPeriodOpen(false)} align="left" style={{ left: '50%', transform: 'translateX(-50%)' }}>
          <PeriodPicker month={month} year={year} onPick={(m, y) => { setMonth(m); setYear(y); }} onClose={() => setPeriodOpen(false)} />
        </Popover>
      </div>
      <Link
        to="/profile"
        title="Profile"
        aria-label="Profile"
        onClick={() => rememberApp('/rent', 'Rent Tracker')}
        style={{ display: 'flex', background: 'none', border: 'none', padding: 0, cursor: 'pointer', borderRadius: '50%', textDecoration: 'none' }}
      >
        <Avatar name={user!.name} size="md" />
      </Link>
    </div>
  );

  return (
    <ResponsiveShell sidebar={sidebar} topBar={topBar}>
      {view === 'home' && house && <Dashboard house={house} />}
      {view === 'grid' && house && <YearGrid key={house.id} house={house} year={year} toast={toast} uid={user?.uid ?? null} />}
      {view === 'houses' && (
        <Houses
          house={house}
          isLoading={housesLoading}
          error={housesError?.message ?? null}
          onRetry={retryHouses}
          onAddHouse={() => setAddHouse(true)}
          onEditRoom={setEditRoom}
          onAddRent={(room) => setAddRent({ room, houseId, houseName: house?.name ?? '', period, month, year })}
        />
      )}
      {view === 'expenses' && (
        <Expenses
          houseId={houseId}
          year={year}
          links={links}
          receipts={receipts}
          vals={vals}
          isLoading={expLoading}
          error={expError?.message ?? null}
          onRetry={() => setExpRetryCount((c) => c + 1)}
          onAddEntry={(category) => setEntry({ mode: 'add', category, houseId })}
          onEditEntry={(init) => setEntry(init)}
          onAttach={(entryId, label) => setPicker({ entryId, label })}
          onView={(receipt, entryId) => setViewer({ receipt, entryId })}
        />
      )}
      {view === 'receipts' && (
        <Receipts
          receipts={receipts}
          isLoading={receiptsLoading}
          error={receiptsError?.message ?? null}
          onRetry={retryReceipts}
          onUpload={() => setUpload(true)}
          onView={(receipt) => setViewer({ receipt })}
        />
      )}

      {/* 1 · Add house */}
      <AddHouseDrawer
        open={addHouse}
        onClose={() => setAddHouse(false)}
        _saveHouse={async (p) => {
          const tempId = 'h' + Math.random().toString(36).slice(2, 6);
          const rooms: Room[] = Array.from({ length: p.rooms }, (_, k) => ({
            id: tempId + 'r' + k,
            unit: 'Room ' + (k + 1),
            tenant: null,
            rent: p.rent,
            paid: 0,
            status: 'Vacant' as RoomStatus,
            beds: 1,
          }));
          const newHouse = { name: p.address.split(',')[0], address: p.address, rooms };
          if (firebaseConfigured && user) {
            const id = await addHouseFS(user.uid, newHouse);
            setHouseId(id);
          } else {
            setHouses((hs) => [...hs, { ...newHouse, id: tempId }]);
            setHouseId(tempId);
          }
          toast('House added · ' + p.rooms + ' rooms');
        }}
      />

      {/* 2 · Edit room */}
      <EditRoomDrawer
        room={editRoom}
        houseName={house?.name ?? ''}
        onClose={() => setEditRoom(null)}
        _saveRoom={async (room) => { await updateRoom(room); toast('Room saved'); }}
      />

      {/* 3 · Add rent */}
      <AddRentDrawer
        ctx={addRent}
        onClose={() => setAddRent(null)}
        _saveRentEntry={async (room) => {
          await updateRoom(room);
          if (user && addRent && firebaseConfigured) {
            await addRentEntry(user.uid, {
              houseId: addRent.houseId,
              roomId: room.id,
              houseName: addRent.houseName,
              roomName: room.unit,
              tenant: room.tenant ?? '',
              month: addRent.month,
              year: addRent.year,
              amountDue: room.rent,
              amountPaid: room.paid,
              status: room.status,
            });
          }
          toast('Rent recorded');
        }}
      />

      {/* 4 · Add / edit entry */}
      <EntryWizard
        ctx={entry}
        houses={houses}
        year={year}
        onClose={() => setEntry(null)}
        onSubmit={async (p: EntrySubmit) => {
          if (p.category && p.month != null) {
            if (firebaseConfigured && user) {
              await saveExpenseEntry(user.uid, {
                houseId: p.houseId, year: p.year, month: p.month, category: p.category,
                amount: p.value, notes: p.notes, description: p.description,
                contractor: p.contractor, roomId: p.roomId,
              });
            } else {
              setVals((v) => ({ ...v, [p.category + '-' + p.month]: p.value }));
            }
          }
          setEntry(null);
          toast(p.mode === 'edit' ? 'Entry updated' : 'Entry added');
        }}
      />

      {/* 5 · Upload receipt */}
      <UploadReceiptDrawer
        open={upload}
        houses={houses}
        onClose={() => setUpload(false)}
        onUpload={async (rc: UploadedReceipt) => {
          if (firebaseConfigured && user) {
            await addReceipt(user.uid, rc);
          } else {
            setReceipts((rs) => [{ ...rc }, ...rs]);
          }
          setUpload(false);
          toast('Receipt uploaded');
        }}
      />

      {/* 6 · Receipt picker */}
      <ReceiptPickerDialog
        ctx={picker}
        receipts={unlinked}
        onClose={() => setPicker(null)}
        onPick={async (rc) => {
          const entryId = picker!.entryId;
          const [cat, monthStr] = entryId.split('-');
          if (firebaseConfigured && user) {
            await linkExpenseReceipt(user.uid, houseId, year, parseInt(monthStr), cat, rc.id);
          } else {
            setLinks((l) => ({ ...l, [entryId]: rc.id }));
          }
          setPicker(null);
          toast('Receipt attached');
        }}
        onUpload={() => { setPicker(null); setUpload(true); }}
      />

      {/* 7 · Receipt viewer */}
      <ReceiptViewerDialog
        ctx={viewer}
        onClose={() => setViewer(null)}
        onUnlink={async (c) => {
          if (c.entryId) {
            const [cat, monthStr] = c.entryId.split('-');
            if (firebaseConfigured && user) {
              await linkExpenseReceipt(user.uid, houseId, year, parseInt(monthStr), cat, null);
            } else {
              setLinks((l) => { const n = { ...l }; delete n[c.entryId!]; return n; });
            }
          }
          setViewer(null);
          toast('Receipt unlinked');
        }}
      />
    </ResponsiveShell>
  );
}

export function RentApp() {
  return (
    <ToastHost>
      <RentInner />
    </ToastHost>
  );
}
