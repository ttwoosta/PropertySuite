// Houses — standalone property & room management app.
// Two screens: (1) list of all houses, (2) room manager for a selected house.
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar, Badge, Button, Card, IconButton } from '../../ds-vendor/components';
import {
  EmptyState,
  Hamburger,
  Icon,
  Modal,
  ResponsiveShell,
  RightDrawer,
  SectionTitle,
  Spinner,
  ThemeToggle,
  ToastHost,
  di,
  useDrawer,
  useTheme,
  useToast,
} from '../../components/ui';
import { Input } from '../../ds-vendor/components';
import { useAuth } from '../../lib/auth';
import { rememberApp } from '../../lib/nav';
import { useHouses } from '../rent/data';
import type { House, Room } from '../rent/data';
import { formatCurrency } from '../../lib/currency';
import {
  addHouse as svcAddHouse,
  deleteHouse as svcDeleteHouse,
  saveRoom as svcSaveRoom,
  updateHouse as svcUpdateHouse,
} from '../../lib/rentService';
import { AddHouseDrawer, EditRoomDrawer } from '../rent/forms';
import { OnboardingPopup } from '../../components/OnboardingPopup';

const occCount = (h: House) => h.rooms.filter((r) => r.tenant).length;
const monthlyIncome = (h: House) => h.rooms.reduce((s, r) => s + (r.tenant ? r.rent : 0), 0);

// ── Edit House drawer (name + address) ─────────────────────────────────────────

function EditHouseDrawer({ house, onClose, onSave }: {
  house: House | null;
  onClose: () => void;
  onSave: (patch: { name: string; address: string }) => Promise<void>;
}) {
  const open = !!house;
  const [name, setName] = useState('');
  const [addr, setAddr] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Reset when the drawer opens with a new house
  const prevOpen = !!house;
  if (prevOpen && name === '' && house) {
    setName(house.name);
    setAddr(house.address);
  }

  const submit = async () => {
    if (!name.trim()) { setErr('Enter a house name before saving.'); return; }
    setErr(null);
    setBusy(true);
    try {
      await onSave({ name: name.trim(), address: addr.trim() });
      onClose();
    } finally { setBusy(false); }
  };

  return (
    <RightDrawer
      open={open}
      onClose={onClose}
      icon="building-2"
      title="Edit house"
      subtitle={house?.name ?? ''}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" disabled={busy} onClick={() => void submit()}>
            {busy ? 'Saving…' : 'Save house'}
          </Button>
        </>
      }
    >
      {house && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input label="House name" value={name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            placeholder="e.g. Maple Court" leadingIcon={di('home')} />
          <Input label="Address" value={addr} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddr(e.target.value)}
            placeholder="e.g. 14 Maple Court, Leeds LS6 2AB" leadingIcon={di('map-pin')} />
          {err && <span style={{ fontSize: 'var(--text-sm)', color: 'var(--danger-fg)' }}>{err}</span>}
        </div>
      )}
    </RightDrawer>
  );
}

// ── Confirm-delete modal ────────────────────────────────────────────────────────

interface DelCtx { title: string; subtitle: string; body: string; cta: string }

function ConfirmDelete({ ctx, onClose, onConfirm }: {
  ctx: DelCtx | null; onClose: () => void; onConfirm: () => void;
}) {
  return (
    <Modal open={!!ctx} onClose={onClose} title={ctx?.title ?? ''} subtitle={ctx?.subtitle ?? ''} width={420}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="danger" leadingIcon={di('trash-2')} onClick={onConfirm}>{ctx?.cta ?? 'Delete'}</Button>
        </>
      }>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '4px 0 2px' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38,
          flex: 'none', borderRadius: 'var(--radius-md)', background: 'var(--danger-bg)', color: 'var(--danger-fg)' }}>
          <span style={{ display: 'inline-flex', width: 19, height: 19 }}><Icon name="alert-triangle" size={19} /></span>
        </span>
        <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-body)', lineHeight: 1.55 }}>{ctx?.body ?? ''}</p>
      </div>
    </Modal>
  );
}

// ── Screen 1 — House list ───────────────────────────────────────────────────────

function HouseList({ houses, loading, onOpenRooms, onAddHouse, onChatAdd, onEditHouse, onDeleteHouse }: {
  houses: House[]; loading: boolean;
  onOpenRooms: (id: string) => void;
  onAddHouse: () => void;
  onChatAdd: () => void;
  onEditHouse: (h: House) => void;
  onDeleteHouse: (h: House) => void;
}) {
  const totalRooms = houses.reduce((s, h) => s + h.rooms.length, 0);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner /></div>;
  }

  return (
    <div className="ps-fade">
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 22 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ margin: 0, fontSize: 'var(--text-2xl)', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-heading)' }}>Houses</h1>
          <p style={{ margin: '4px 0 0', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
            {houses.length} {houses.length === 1 ? 'property' : 'properties'} · {totalRooms} rooms across your portfolio
          </p>
        </div>
        <Button variant="secondary" leadingIcon={di('plus')} onClick={onAddHouse}>Add house</Button>
      </div>

      {houses.length === 0 ? (
        <Card>
          <EmptyState icon="building-2" title="No houses yet"
            body="Add your first property to start managing its rooms and tenants."
            action={<Button variant="primary" leadingIcon={di('plus')} onClick={onAddHouse}>Add house</Button>} />
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {houses.map((h) => {
            const occ = occCount(h);
            const full = occ === h.rooms.length && h.rooms.length > 0;
            return (
              <Card key={h.id} padding="0" style={{ overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px var(--card-pad)' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, flex: 'none',
                    borderRadius: 'var(--radius-md)', background: 'var(--brand-tint)', color: 'var(--brand-on-tint)' }}>
                    <span style={{ display: 'inline-flex', width: 22, height: 22 }}>{di('home')}</span>
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--text-heading)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.name}</div>
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {h.address || 'No address'}
                    </div>
                  </div>
                  <Badge tone={full ? 'success' : 'warning'}>{occ}/{h.rooms.length} occupied</Badge>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', padding: '12px var(--card-pad)',
                  borderTop: '1px solid var(--border-subtle)', background: 'var(--surface-sunken)' }}>
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                    {h.rooms.length} {h.rooms.length === 1 ? 'room' : 'rooms'} ·{' '}
                    <span className="ps-mono" style={{ fontWeight: 600, color: 'var(--text-body)' }}>{formatCurrency(monthlyIncome(h))}</span>/mo
                  </span>
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Button size="sm" variant="secondary" leadingIcon={di('door-open')} onClick={() => onOpenRooms(h.id)}>Edit rooms</Button>
                    <IconButton label="Edit house" variant="ghost" size="sm" onClick={() => onEditHouse(h)}>{di('pencil')}</IconButton>
                    <IconButton label="Remove house" variant="ghost" size="sm" onClick={() => onDeleteHouse(h)}>{di('trash-2')}</IconButton>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <button onClick={onChatAdd}
        style={{ display: 'flex', alignItems: 'center', gap: 13, width: '100%', textAlign: 'left', marginTop: 16,
          padding: '16px var(--card-pad)', cursor: 'pointer', background: 'var(--surface-card)',
          border: '1px dashed var(--border-strong)', borderRadius: 'var(--radius-lg)', fontFamily: 'inherit' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40,
          flex: 'none', borderRadius: 'var(--radius-md)', background: 'var(--brand-tint)', color: 'var(--brand)' }}>
          <span style={{ display: 'inline-flex', width: 20, height: 20 }}>{di('sparkles')}</span>
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'block', fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-heading)' }}>Add a property with chat</span>
          <span style={{ display: 'block', fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginTop: 2 }}>Answer two quick questions and we'll set it up for you.</span>
        </span>
        <span style={{ display: 'inline-flex', width: 18, height: 18, flex: 'none', color: 'var(--text-faint)' }}>{di('arrow-right')}</span>
      </button>
    </div>
  );
}

// ── Screen 2 — Rooms manager ────────────────────────────────────────────────────

function RoomsScreen({ house, onBack, onEditRoom, onAddRoom, onDeleteRoom }: {
  house: House;
  onBack: () => void;
  onEditRoom: (r: Room) => void;
  onAddRoom: () => void;
  onDeleteRoom: (r: Room) => void;
}) {
  const occ = occCount(house);
  return (
    <div className="ps-fade">
      <button onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginBottom: 14,
        background: 'none', border: 'none', padding: '2px 0', cursor: 'pointer', color: 'var(--text-muted)',
        fontSize: 'var(--text-sm)', fontWeight: 600, fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
        <span style={{ display: 'inline-flex', width: 16, height: 16 }}>{di('arrow-left')}</span>All houses
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 18 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, letterSpacing: '-0.015em', color: 'var(--text-heading)' }}>{house.name}</div>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{house.address || 'No address'}</div>
        </div>
        <Badge tone={occ === house.rooms.length && house.rooms.length > 0 ? 'success' : 'warning'}>{occ}/{house.rooms.length} occupied</Badge>
        <Button variant="primary" leadingIcon={di('plus')} onClick={onAddRoom}>Add room</Button>
      </div>

      {house.rooms.length === 0 ? (
        <Card>
          <EmptyState icon="door-open" title="No rooms yet"
            body="Add a room to assign a tenant and base rent."
            action={<Button variant="primary" leadingIcon={di('plus')} onClick={onAddRoom}>Add room</Button>} />
        </Card>
      ) : (
        <Card padding="0" style={{ overflow: 'hidden' }}>
          {house.rooms.map((r, i) => (
            <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px var(--card-pad)',
              borderTop: i ? '1px solid var(--border-subtle)' : 'none' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, color: 'var(--text-heading)' }}>{r.unit}</div>
                <div style={{ fontSize: 'var(--text-sm)', color: r.tenant ? 'var(--text-body)' : 'var(--text-faint)' }}>
                  {r.tenant || 'Vacant'}
                </div>
              </div>
              <span className="ps-mono" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{formatCurrency(r.rent)}</span>
              <Badge tone={r.tenant ? 'success' : 'neutral'} size="sm">{r.tenant ? 'Occupied' : 'Vacant'}</Badge>
              <div style={{ display: 'flex', gap: 4 }}>
                <IconButton label="Edit room" variant="ghost" size="sm" onClick={() => onEditRoom(r)}>{di('pencil')}</IconButton>
                <IconButton label="Remove room" variant="ghost" size="sm" onClick={() => onDeleteRoom(r)}>{di('trash-2')}</IconButton>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

// ── Sidebar nav ─────────────────────────────────────────────────────────────────

function HousesNav({ active, onClick }: { active: boolean; onClick: () => void }) {
  const { close } = useDrawer();
  return (
    <div onClick={() => { onClick(); close(); }}
      style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '9px 12px',
        borderRadius: 'var(--radius-md)', cursor: 'pointer',
        background: active ? 'var(--surface-hover)' : 'transparent',
        fontWeight: active ? 700 : 500, color: 'var(--text-body)', fontSize: 'var(--text-base)' }}>
      <Icon name="building-2" size={18} style={{ color: active ? 'var(--brand)' : 'var(--text-muted)' }} />
      All houses
    </div>
  );
}

const SUITE_LINKS = [
  { label: 'Rent Tracker', icon: 'wallet', to: '/rent' },
  { label: 'Maintenance Scheduler', icon: 'calendar-check-2', to: '/maintenance' },
  { label: 'Tenant Bridge', icon: 'messages-square', to: '/tenant-bridge' },
];

// ── App shell ───────────────────────────────────────────────────────────────────

function HousesAppInner() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [theme, toggleTheme] = useTheme('houses');
  const [screen, setScreen] = useState<'list' | 'rooms'>('list');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [addHouseOpen, setAddHouseOpen] = useState(false);
  const [editHouse, setEditHouse] = useState<House | null>(null);
  const [editRoom, setEditRoom] = useState<Room | null>(null);
  const [delCtx, setDelCtx] = useState<(DelCtx & { kind: 'house' | 'room'; id: string }) | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const toast = useToast();

  const { houses, setHouses, loading } = useHouses();

  if (!user) return <Spinner label="Loading…" />;

  const house = houses.find((h) => h.id === activeId) ?? null;
  const totalRooms = houses.reduce((s, h) => s + h.rooms.length, 0);

  const openRooms = (id: string) => { setActiveId(id); setScreen('rooms'); };
  const backToList = () => { setScreen('list'); setActiveId(null); };

  const updateRooms = async (updatedRooms: Room[]) => {
    if (!activeId) return;
    setHouses((hs) => hs.map((h) => h.id !== activeId ? h : { ...h, rooms: updatedRooms }));
    await svcSaveRoom(user.uid, activeId, updatedRooms);
  };

  const addRoom = () => {
    if (!house) return;
    const id = activeId + 'r' + Math.random().toString(36).slice(2, 6);
    const room: Room = { id, unit: 'Room ' + (house.rooms.length + 1), tenant: null, rent: 600, status: 'Vacant', paid: 0, beds: 1 };
    setHouses((hs) => hs.map((x) => x.id !== activeId ? x : { ...x, rooms: [...x.rooms, room] }));
    void svcSaveRoom(user.uid, activeId!, [...house.rooms, room]);
    setEditRoom(room);
  };

  const confirmDelete = () => {
    if (!delCtx) return;
    if (delCtx.kind === 'house') {
      setHouses((hs) => hs.filter((h) => h.id !== delCtx.id));
      if (activeId === delCtx.id) backToList();
      void svcDeleteHouse(user.uid, delCtx.id);
      toast('House removed');
    } else {
      const updated = (house?.rooms ?? []).filter((r) => r.id !== delCtx.id);
      setHouses((hs) => hs.map((h) => h.id !== activeId ? h : { ...h, rooms: updated }));
      void svcSaveRoom(user.uid, activeId!, updated);
      toast('Room removed');
    }
    setDelCtx(null);
  };

  const sidebar = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '18px 16px 14px' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <img src="/assets/logo-mark.svg" width={30} height={30} alt="" />
          <span style={{ fontSize: 'var(--text-md)', fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--text-heading)' }}>Houses</span>
        </Link>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 12px' }}>
        <HousesNav active onClick={backToList} />
      </div>
      <div style={{ padding: '6px 12px 4px', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="eyebrow" style={{ padding: '10px 8px 8px' }}>Suite</div>
        {SUITE_LINKS.map((l) => (
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
          {houses.length} houses · {totalRooms} rooms
        </span>
        <ThemeToggle theme={theme} onToggle={toggleTheme} size="sm" />
      </div>
    </div>
  );

  const topBar = (
    <div className="ps-topbar" style={{ gap: 10 }}>
      <Hamburger />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
        <Icon name="building-2" size={17} style={{ color: 'var(--text-muted)' }} />
        <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-body)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {screen === 'rooms' && house ? house.name : 'All houses'}
        </span>
      </div>
      <Link to="/profile" title="Profile" aria-label="Profile"
        onClick={() => rememberApp('/houses', 'Houses')}
        style={{ display: 'flex', marginLeft: 'auto', background: 'none', border: 'none', padding: 0, cursor: 'pointer', borderRadius: '50%', textDecoration: 'none' }}>
        <Avatar name={user.name} size="md" />
      </Link>
    </div>
  );

  return (
    <ResponsiveShell sidebar={sidebar} topBar={topBar}>
      {screen === 'list' ? (
        <HouseList
          houses={houses}
          loading={loading}
          onOpenRooms={openRooms}
          onAddHouse={() => setAddHouseOpen(true)}
          onChatAdd={() => setChatOpen(true)}
          onEditHouse={setEditHouse}
          onDeleteHouse={(h) => setDelCtx({ kind: 'house', id: h.id,
            title: `Remove ${h.name}?`, subtitle: h.address, cta: 'Remove house',
            body: `${h.name} and all ${h.rooms.length} of its rooms will be removed from your portfolio. This cannot be undone.` })}
        />
      ) : house ? (
        <RoomsScreen
          house={house}
          onBack={backToList}
          onEditRoom={setEditRoom}
          onAddRoom={addRoom}
          onDeleteRoom={(r) => setDelCtx({ kind: 'room', id: r.id,
            title: `Remove ${r.unit}?`, subtitle: house.name, cta: 'Remove room',
            body: `This room${r.tenant ? ` and its tenant assignment (${r.tenant})` : ''} will be removed from ${house.name}.` })}
        />
      ) : null}

      {/* Add house */}
      <AddHouseDrawer
        open={addHouseOpen}
        onClose={() => setAddHouseOpen(false)}
        _saveHouse={async (p) => {
          const id = await svcAddHouse(user.uid, {
            name: p.address.split(',')[0].trim() || 'New house',
            address: p.address,
            rooms: Array.from({ length: p.rooms }, (_, k) => ({
              id: 'r' + Math.random().toString(36).slice(2, 8),
              unit: `Room ${k + 1}`, tenant: null, rent: p.rent, paid: 0, status: 'Vacant' as const, beds: 1,
            })),
          });
          toast('House added · ' + p.rooms + ' rooms');
          setAddHouseOpen(false);
        }}
      />

      {/* Edit house meta */}
      <EditHouseDrawer
        house={editHouse}
        onClose={() => setEditHouse(null)}
        onSave={async (patch) => {
          setHouses((hs) => hs.map((h) => h.id !== editHouse?.id ? h : { ...h, ...patch }));
          await svcUpdateHouse(user.uid, editHouse!.id, patch);
          toast('House saved');
        }}
      />

      {/* Edit room — tenant name + base rent */}
      <EditRoomDrawer
        room={editRoom}
        houseName={house?.name ?? ''}
        onClose={() => setEditRoom(null)}
        _saveRoom={async (r) => {
          const saved = { ...r, status: (r.tenant ? 'Occupied' : 'Vacant') as Room['status'] };
          const updated = (house?.rooms ?? []).map((x) => x.id === saved.id ? saved : x);
          setHouses((hs) => hs.map((h) => h.id !== activeId ? h : { ...h, rooms: updated }));
          await svcSaveRoom(user.uid, activeId!, updated);
          toast('Room saved');
        }}
      />

      {/* Confirm delete */}
      <ConfirmDelete ctx={delCtx} onClose={() => setDelCtx(null)} onConfirm={confirmDelete} />

      {/* Chat-driven property add */}
      {chatOpen && (
        <OnboardingPopup
          onClose={() => setChatOpen(false)}
          onComplete={async ({ name, rooms, rent }) => {
            const newRooms: Room[] = Array.from({ length: rooms }, (_, k) => ({
              id: 'r' + Math.random().toString(36).slice(2, 8),
              unit: `Room ${k + 1}`, tenant: null, rent, paid: 0, status: 'Vacant' as const, beds: 1,
            }));
            await svcAddHouse(user.uid, { name, address: '', rooms: newRooms });
            setChatOpen(false);
            toast(`Property added · ${rooms} ${rooms === 1 ? 'room' : 'rooms'}`);
          }}
        />
      )}
    </ResponsiveShell>
  );
}

export function HousesApp() {
  return (
    <ToastHost>
      <HousesAppInner />
    </ToastHost>
  );
}
