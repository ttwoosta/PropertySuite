/* Rent Tracker — app shell + orchestrator.
   Owns all page-level state (auth, current view, selected house/period, domain data, dialog
   controllers) and wires the props down to the view components and drawers/dialogs.

   Views (Dashboard, YearGrid, Houses, Expenses, Receipts) live in rent-views.jsx.
   Drawers/dialogs live in rent-forms.jsx + rent-entries.jsx.
   The shared React/DS aliases (useS, useE, useR, useM, RD, RBtn…RSel, RR, STATUS_BADGE) are
   declared in rent-views.jsx, which loads BEFORE this file — they resolve here via shared scope. */

const RKIND = { r1: 'pdf', r2: 'img', r3: 'img', r4: 'pdf', r5: 'pdf', r6: 'img' };

/* ---------------- App ---------------- */
function RentApp() {
  const [auth, setAuth] = useS('resolving');
  const [user, setUser] = useS(null);
  const [view, setView] = useS('home');
  const [houseId, setHouseId] = useS('maple');
  const [month, setMonth] = useS(5);
  const [year, setYear] = useS(2026);
  const [theme, toggleTheme] = useTheme('rent');
  const [houseOpen, setHouseOpen] = useS(false);
  const [periodOpen, setPeriodOpen] = useS(false);

  // lifted domain state
  const [houses, setHouses] = useS(() => RR.HOUSES.map((h) => ({ ...h, rooms: h.rooms.map((r) => ({ ...r })) })));
  const [receipts, setReceipts] = useS(() => RR.RECEIPTS.map((r) => ({ ...r, kind: RKIND[r.id] || 'img' })));
  const [links, setLinks] = useS({ 'gas-5': 'r1', 'water-5': 'r2', 'maint-4': 'r3' });
  const [vals, setVals] = useS({});

  // dialog controllers
  const [addHouse, setAddHouse] = useS(false);
  const [editRoom, setEditRoom] = useS(null);
  const [addRent, setAddRent] = useS(null);
  const [entry, setEntry] = useS(null);
  const [upload, setUpload] = useS(false);
  const [picker, setPicker] = useS(null);
  const [viewer, setViewer] = useS(null);
  const toast = useToast();

  useE(() => {
    const t = setTimeout(() => {
      const u = window.PS.Auth.get();
      if (!u) {window.location.href = 'Property Suite.html';return;}
      setUser(u);setAuth('in');
    }, 360);
    return () => clearTimeout(t);
  }, []);
  useE(() => {window.PS.icons();});
  // auto-open Add House when the portfolio is empty
  useE(() => { if (auth === 'in' && houses.length === 0) setAddHouse(true); }, [auth, houses.length]);

  if (auth === 'resolving') return <Spinner label="Loading Rent Tracker…" />;
  const house = houses.find((h) => h.id === houseId) || houses[0];
  const roomCount = houses.reduce((s, h) => s + h.rooms.length, 0);
  const period = MONTH_NAMES[month] + ' ' + year;
  const linkedIds = Object.values(links);
  const unlinked = receipts.filter((r) => !linkedIds.includes(r.id));

  const updateRoom = (room) => setHouses((hs) => hs.map((h) => h.id !== houseId ? h : { ...h, rooms: h.rooms.map((r) => r.id === room.id ? room : r) }));

  const sidebar =
  <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '18px 16px 14px' }}>
        <a href="Property Suite.html" title="Back to launcher" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <img src="assets/logo-mark.svg" width="30" height="30" alt="" />
          <span style={{ fontSize: 'var(--text-md)', fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--text-heading)' }}>Rent Tracker</span>
        </a>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 12px' }}>
        {NAV.map((n) => <RentNav key={n.id} n={n} active={view === n.id} onClick={setView} />)}
      </div>
      <div style={{ padding: '14px 18px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600 }}>{houses.length} houses · {roomCount} rooms</span>
        <ThemeToggle theme={theme} onToggle={toggleTheme} size="sm" />
      </div>
    </div>;


  const topBar =
  <div className="ps-topbar" style={{ gap: 10 }}>
      <Hamburger />
      <div style={{ position: 'relative' }}>
        <button onClick={() => setHouseOpen((o) => !o)} style={chipBtn}>
          <Icon name="house" size={16} style={{ color: 'var(--text-muted)' }} />
          <span style={{ fontWeight: 600 }}>{house.name}</span>
          <Icon name="chevron-down" size={15} style={{ color: 'var(--text-faint)' }} />
        </button>
        <Popover open={houseOpen} onClose={() => setHouseOpen(false)}>
          {houses.map((h) =>
        <button key={h.id} onClick={() => {setHouseId(h.id);setHouseOpen(false);}} style={menuItem(h.id === houseId)}>
              <Icon name="building-2" size={16} style={{ color: 'var(--text-muted)' }} />{h.name}</button>
        )}
        </Popover>
      </div>
      <div style={{ position: 'relative', margin: '0 auto' }}>
        <button onClick={() => setPeriodOpen((o) => !o)} style={{ ...chipBtn, background: 'var(--surface-sunken)' }}>
          <Icon name="calendar" size={15} style={{ color: 'var(--text-muted)' }} />
          <span style={{ fontWeight: 600 }}>{MONTH_NAMES[month]} {year}</span>
        </button>
        <Popover open={periodOpen} onClose={() => setPeriodOpen(false)} align="left" style={{ left: '50%', transform: 'translateX(-50%)' }}>
          <PeriodPicker month={month} year={year} onPick={(m, y) => {setMonth(m);setYear(y);}} onClose={() => setPeriodOpen(false)} />
        </Popover>
      </div>
      <a href="Profile.html" title="Profile" aria-label="Profile" onClick={() => window.PS.rememberApp()}
    style={{ display: 'flex', background: 'none', border: 'none', padding: 0, cursor: 'pointer', borderRadius: '50%', textDecoration: 'none' }}>
        <RAv name={user.name} size="md" />
      </a>
    </div>;


  return (
    <ResponsiveShell sidebar={sidebar} topBar={topBar}>
      {view === 'home' && <Dashboard />}
      {view === 'grid' && <YearGrid house={house} year={year} toast={toast} />}
      {view === 'houses' && <Houses house={house} onAddHouse={() => setAddHouse(true)}
        onEditRoom={setEditRoom} onAddRent={(room) => setAddRent({ room, houseName: house.name, period })} />}
      {view === 'expenses' && <Expenses houseId={houseId} links={links} receipts={receipts} vals={vals}
        onAddEntry={(category) => setEntry({ mode: 'add', category, houseId })}
        onEditEntry={(init) => setEntry(init)}
        onAttach={(entryId, label) => setPicker({ entryId, label })}
        onView={(receipt, entryId) => setViewer({ receipt, entryId })} />}
      {view === 'receipts' && <Receipts receipts={receipts} onUpload={() => setUpload(true)} onView={(receipt) => setViewer({ receipt })} />}

      {/* 1 · Add house */}
      <AddHouseDrawer open={addHouse} onClose={() => setAddHouse(false)}
        onSave={(p) => {
          const id = 'h' + Math.random().toString(36).slice(2, 6);
          const rooms = Array.from({ length: p.rooms }, (_, k) => ({ id: id + 'r' + k, unit: 'Room ' + (k + 1), tenant: null, rent: p.rent, paid: 0, status: 'Vacant' }));
          setHouses((hs) => [...hs, { id, name: p.address.split(',')[0], address: p.address, rooms }]);
          setHouseId(id); setAddHouse(false); toast('House added · ' + p.rooms + ' rooms');
        }} />
      {/* 2 · Edit room */}
      <EditRoomDrawer room={editRoom} houseName={house.name} onClose={() => setEditRoom(null)}
        onSave={(room) => { updateRoom(room); setEditRoom(null); toast('Room saved'); }} />
      {/* 3 · Add rent */}
      <AddRentDrawer ctx={addRent} onClose={() => setAddRent(null)}
        onSave={(room) => { updateRoom(room); setAddRent(null); toast('Rent recorded'); }} />
      {/* 4 · Add / edit entry */}
      <EntryWizard ctx={entry} houses={houses} year={year} onClose={() => setEntry(null)}
        onSubmit={(p) => {
          if (p.category && p.month != null) setVals((v) => ({ ...v, [p.category + '-' + p.month]: p.value }));
          setEntry(null); toast(p.mode === 'edit' ? 'Entry updated' : 'Entry added');
        }} />
      {/* 5 · Upload receipt */}
      <UploadReceiptDrawer open={upload} houses={houses} onClose={() => setUpload(false)}
        onUpload={(rc) => { setReceipts((rs) => [{ ...rc }, ...rs]); setUpload(false); toast('Receipt uploaded'); }} />
      {/* 6 · Receipt picker */}
      <ReceiptPickerDialog ctx={picker} receipts={unlinked} onClose={() => setPicker(null)}
        onPick={(rc) => { setLinks((l) => ({ ...l, [picker.entryId]: rc.id })); setPicker(null); toast('Receipt attached'); }}
        onUpload={() => { setPicker(null); setUpload(true); }} />
      {/* 7 · Receipt viewer */}
      <ReceiptViewerDialog ctx={viewer} onClose={() => setViewer(null)}
        onUnlink={(c) => { setLinks((l) => { const n = { ...l }; delete n[c.entryId]; return n; }); setViewer(null); toast('Receipt unlinked'); }} />
    </ResponsiveShell>);

}

function RentNav({ n, active, onClick }) {
  const { close } = useDrawer();
  return <RD.NavItem icon={di(n.icon)} label={n.label} active={active} onClick={() => {onClick(n.id);close();}} style={{ margin: "0px", padding: "16px 12px" }} />;
}

const chipBtn = { display: 'flex', alignItems: 'center', gap: 7, padding: '7px 12px', borderRadius: 'var(--radius-md)',
  border: '1px solid var(--border-default)', background: 'var(--surface-card)', cursor: 'pointer',
  fontSize: 'var(--text-sm)', color: 'var(--text-body)' };
const menuItem = (on) => ({ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 14px', border: 'none',
  cursor: 'pointer', textAlign: 'left', background: on ? 'var(--surface-active-nav)' : 'transparent',
  color: on ? 'var(--brand-on-tint)' : 'var(--text-body)', fontSize: 'var(--text-sm)', fontWeight: on ? 600 : 500 });

ReactDOM.createRoot(document.getElementById('root')).render(<ToastHost><RentApp /></ToastHost>);
