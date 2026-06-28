/* Houses — property & room management app.
   Two screens within one app:
     1. List   — all houses; add / edit / remove a house.
     2. Rooms  — manage one house's rooms; edit tenant name + base rent (no rent-entry).
   Reuses RightDrawer + form primitives (ps-ui.jsx) and AddHouseDrawer / EditRoomDrawer
   (rent-forms.jsx), which are loaded BEFORE this file. */
const { useState: hS, useEffect: hE } = React;
const HDS = window.MaintenanceSchedulerDesignSystem_02479c;
const { Button: HBtn, IconButton: HIcon, Badge: HBadge, Card: HCard, Input: HInput, Avatar: HAv } = HDS;

const occCount = (h) => h.rooms.filter((r) => r.tenant).length;
const monthlyIncome = (h) => h.rooms.reduce((s, r) => s + (r.tenant ? r.rent : 0), 0);

/* ============ Edit House (name + address) ============ */
function EditHouseDrawer({ house, onClose, onSave }) {
  const open = !!house;
  const [name, setName] = hS('');
  const [addr, setAddr] = hS('');
  const [err, setErr] = hS(null);
  const [busy, save] = useSaver();
  useOpenReset(open, () => { setName(house ? house.name : ''); setAddr(house ? house.address : ''); setErr(null); });
  hE(() => { window.PS.icons(); });

  const submit = () => {
    if (!name.trim()) { setErr('Enter a house name before saving.'); return; }
    setErr(null);
    save(() => onSave({ ...house, name: name.trim(), address: addr.trim() }));
  };

  return (
    <RightDrawer open={open} onClose={onClose} icon="building-2" title="Edit house" subtitle={house ? house.name : ''}
      footer={<><HBtn variant="ghost" onClick={onClose}>Cancel</HBtn>
        <SaveCta busy={busy} busyLabel="Saving…" icon="check" onClick={submit}>Save house</SaveCta></>}>
      {house && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <HInput label={fieldLabel('House name', { tone: 'req', label: 'required' })} value={name}
            onChange={(e) => setName(e.target.value)} placeholder="e.g. Maple Court"
            leadingIcon={<i data-lucide="home"></i>} />
          <HInput label="Address" value={addr} onChange={(e) => setAddr(e.target.value)}
            placeholder="e.g. 14 Maple Court, Leeds LS6 2AB" leadingIcon={<i data-lucide="map-pin"></i>} />
          <FormError>{err}</FormError>
        </div>
      )}
    </RightDrawer>
  );
}

/* ============ Confirm delete ============ */
function ConfirmDelete({ ctx, onClose, onConfirm }) {
  hE(() => { window.PS.icons(); });
  return (
    <Modal open={!!ctx} onClose={onClose} title={ctx ? ctx.title : ''} subtitle={ctx ? ctx.subtitle : ''} width={420}
      footer={<><HBtn variant="ghost" onClick={onClose}>Cancel</HBtn>
        <HBtn variant="danger" leadingIcon={di('trash-2')} onClick={onConfirm}>{ctx ? ctx.cta : 'Delete'}</HBtn></>}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '4px 0 2px' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, flex: 'none',
          borderRadius: 'var(--radius-md)', background: 'var(--danger-bg)', color: 'var(--danger-fg)' }}>
          <span style={{ display: 'inline-flex', width: 19, height: 19 }}><i data-lucide="alert-triangle"></i></span>
        </span>
        <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-body)', lineHeight: 1.55 }}>{ctx ? ctx.body : ''}</p>
      </div>
    </Modal>
  );
}

/* ============ Screen 1 — Houses list ============ */
function HouseList({ houses, onOpenRooms, onAddHouse, onChatAdd, onEditHouse, onDeleteHouse }) {
  const totalRooms = houses.reduce((s, h) => s + h.rooms.length, 0);
  return (
    <div className="ps-fade">
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 22 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ margin: 0, fontSize: 'var(--text-2xl)', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-heading)' }}>Houses</h1>
          <p style={{ margin: '4px 0 0', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
            {houses.length} {houses.length === 1 ? 'property' : 'properties'} · {totalRooms} rooms across your portfolio
          </p>
        </div>
        <HBtn variant="secondary" leadingIcon={di('plus')} onClick={onAddHouse}>Add house</HBtn>
      </div>

      {houses.length === 0 ? (
        <HCard><EmptyState icon="building-2" title="No houses yet"
          body="Add your first property to start managing its rooms and tenants."
          action={<HBtn variant="primary" leadingIcon={di('plus')} onClick={onAddHouse}>Add house</HBtn>} /></HCard>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {houses.map((h) => {
            const occ = occCount(h);
            const full = occ === h.rooms.length && h.rooms.length > 0;
            return (
              <HCard key={h.id} padding="0" style={{ overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px var(--card-pad)' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, flex: 'none',
                    borderRadius: 'var(--radius-md)', background: 'var(--brand-tint)', color: 'var(--brand-on-tint)' }}>
                    <span style={{ display: 'inline-flex', width: 22, height: 22 }}><i data-lucide="home"></i></span>
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--text-heading)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.name}</div>
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.address || 'No address'}</div>
                  </div>
                  <HBadge tone={full ? 'success' : 'warning'}>{occ}/{h.rooms.length} occupied</HBadge>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', padding: '12px var(--card-pad)',
                  borderTop: '1px solid var(--border-subtle)', background: 'var(--surface-sunken)' }}>
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                    {h.rooms.length} {h.rooms.length === 1 ? 'room' : 'rooms'} ·
                    <span className="ps-mono" style={{ fontWeight: 600, color: 'var(--text-body)' }}> {money(monthlyIncome(h))}</span>/mo
                  </span>
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <HBtn size="sm" variant="secondary" leadingIcon={di('door-open')} onClick={() => onOpenRooms(h.id)}>Edit rooms</HBtn>
                    <HIcon label="Edit house" variant="ghost" size="sm" onClick={() => onEditHouse(h)}>{di('pencil')}</HIcon>
                    <HIcon label="Remove house" variant="ghost" size="sm" onClick={() => onDeleteHouse(h)}>{di('trash-2')}</HIcon>
                  </div>
                </div>
              </HCard>
            );
          })}
        </div>
      )}

      <button onClick={onChatAdd} className="hs-chat-add"
        style={{ display: 'flex', alignItems: 'center', gap: 13, width: '100%', textAlign: 'left', marginTop: 16,
          padding: '16px var(--card-pad)', cursor: 'pointer', background: 'var(--surface-card)',
          border: '1px dashed var(--border-strong)', borderRadius: 'var(--radius-lg)', fontFamily: 'inherit' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, flex: 'none',
          borderRadius: 'var(--radius-md)', background: 'var(--brand-tint)', color: 'var(--brand)' }}>
          <span style={{ display: 'inline-flex', width: 20, height: 20 }}><i data-lucide="sparkles"></i></span>
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'block', fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-heading)' }}>Add a property with chat</span>
          <span style={{ display: 'block', fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginTop: 2 }}>Answer two quick questions and we’ll set it up for you.</span>
        </span>
        <span style={{ display: 'inline-flex', width: 18, height: 18, flex: 'none', color: 'var(--text-faint)' }}><i data-lucide="arrow-right"></i></span>
      </button>
    </div>
  );
}

/* ============ Screen 2 — Rooms manager ============ */
function RoomsScreen({ house, onBack, onEditRoom, onAddRoom, onDeleteRoom }) {
  if (!house) return null;
  const occ = occCount(house);
  return (
    <div className="ps-fade">
      <button onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginBottom: 14,
        background: 'none', border: 'none', padding: '2px 0', cursor: 'pointer', color: 'var(--text-muted)',
        fontSize: 'var(--text-sm)', fontWeight: 600, fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
        <span style={{ display: 'inline-flex', width: 16, height: 16 }}><i data-lucide="arrow-left"></i></span>All houses
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 18 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, letterSpacing: '-0.015em', color: 'var(--text-heading)' }}>{house.name}</div>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{house.address || 'No address'}</div>
        </div>
        <HBadge tone={occ === house.rooms.length && house.rooms.length > 0 ? 'success' : 'warning'}>{occ}/{house.rooms.length} occupied</HBadge>
        <HBtn variant="primary" leadingIcon={di('plus')} onClick={onAddRoom}>Add room</HBtn>
      </div>

      {house.rooms.length === 0 ? (
        <HCard><EmptyState icon="door-open" title="No rooms yet"
          body="Add a room to assign a tenant and base rent."
          action={<HBtn variant="primary" leadingIcon={di('plus')} onClick={onAddRoom}>Add room</HBtn>} /></HCard>
      ) : (
        <HCard padding="0" style={{ overflow: 'hidden' }}>
          {house.rooms.map((r, i) => (
            <div key={r.id} className="rt-room-row" style={{ borderTop: i ? '1px solid var(--border-subtle)' : 'none' }}>
              <div className="rt-id">
                <div className="rt-unit">{r.unit}</div>
                <div className="rt-tenant" style={r.tenant ? undefined : { color: 'var(--text-faint)' }}>{r.tenant || 'Vacant'}</div>
              </div>
              <div className="rt-rent ps-mono">{money(r.rent)}</div>
              <div className="rt-status"><HBadge tone={r.tenant ? 'success' : 'neutral'} size="sm">{r.tenant ? 'Occupied' : 'Vacant'}</HBadge></div>
              <div className="rt-actions">
                <HIcon label="Edit room" variant="ghost" size="sm" onClick={() => onEditRoom(r)}>{di('pencil')}</HIcon>
                <HIcon label="Remove room" variant="ghost" size="sm" onClick={() => onDeleteRoom(r)}>{di('trash-2')}</HIcon>
              </div>
            </div>
          ))}
        </HCard>
      )}
    </div>
  );
}

/* ============ App shell ============ */
function HousesApp() {
  const [auth, setAuth] = hS('resolving');
  const [user, setUser] = hS(null);
  const [theme, toggleTheme] = useTheme('houses');
  const [screen, setScreen] = hS('list');      // list | rooms
  const [activeId, setActiveId] = hS(null);
  const [houses, setHouses] = hS([]);

  // dialog controllers
  const [addHouse, setAddHouse] = hS(false);
  const [editHouse, setEditHouse] = hS(null);
  const [editRoom, setEditRoom] = hS(null);
  const [del, setDel] = hS(null);              // { kind:'house'|'room', ... , title, subtitle, body, cta }
  const [chat, setChat] = hS(false);           // chat-onboarding popup open
  const [confirmAdd, setConfirmAdd] = hS(false); // confirm before opening the add-house form
  const toast = useToast();

  hE(() => {
    let unsub = null, alive = true;
    (async () => {
      const u = await window.PS.Auth.ready();
      if (!alive) return;
      if (!u) { window.location.href = 'Property Suite.html'; return; }
      await window.PS_STORE.ready();
      if (!alive) return;
      setHouses(window.HOUSES_DATA.fromStore(window.PS_STORE.getHouses()));
      setUser(u); setAuth('in');
      // Live updates from another app/device (Houses is the only writer, so its
      // own commits are de-duped by the store and won't echo back here).
      unsub = window.PS_STORE.subscribe((remote) => {
        setHouses(window.HOUSES_DATA.fromStore(remote));
      });
    })();
    return () => { alive = false; if (unsub) unsub(); };
  }, []);
  hE(() => { window.PS.icons(); });

  // Houses is the canonical editor — propagate structural / tenant edits back
  // to the central store (Firestore) so the other apps stay in sync (preserves
  // rent + tenant-comms fields they own). Gated on 'in' so the initial empty
  // state never overwrites the loaded portfolio.
  hE(() => { if (auth === 'in') window.PS_STORE.commitFromHouses(houses); }, [houses, auth]);

  if (auth === 'resolving') return <Spinner label="Loading Houses…" />;

  const house = houses.find((h) => h.id === activeId) || null;
  const totalRooms = houses.reduce((s, h) => s + h.rooms.length, 0);
  const ChatOnboarding = window.OnboardingPopup;

  const openRooms = (id) => { setActiveId(id); setScreen('rooms'); };
  const backToList = () => { setScreen('list'); setActiveId(null); };

  const updateRoom = (room) => setHouses((hs) => hs.map((h) => h.id !== activeId ? h
    : { ...h, rooms: h.rooms.map((r) => r.id === room.id ? room : r) }));

  const addRoom = () => {
    const h = houses.find((x) => x.id === activeId);
    if (!h) return;
    const id = activeId + 'r' + Math.random().toString(36).slice(2, 6);
    const room = { id, unit: 'Room ' + (h.rooms.length + 1), tenant: null, rent: 600, status: 'Vacant', paid: 0 };
    setHouses((hs) => hs.map((x) => x.id !== activeId ? x : { ...x, rooms: [...x.rooms, room] }));
    setEditRoom(room);
  };

  const removeRoom = (room) => setDel({
    kind: 'room', room,
    title: 'Remove ' + room.unit + '?', subtitle: house ? house.name : '', cta: 'Remove room',
    body: 'This room' + (room.tenant ? ' and its tenant assignment (' + room.tenant + ')' : '') + ' will be removed from ' + (house ? house.name : 'this house') + '.',
  });

  const removeHouse = (h) => setDel({
    kind: 'house', house: h,
    title: 'Remove ' + h.name + '?', subtitle: h.address, cta: 'Remove house',
    body: h.name + ' and all ' + h.rooms.length + ' of its rooms will be removed from your portfolio. This cannot be undone.',
  });

  const confirmDelete = () => {
    if (!del) return;
    if (del.kind === 'house') {
      setHouses((hs) => hs.filter((h) => h.id !== del.house.id));
      if (activeId === del.house.id) backToList();
      toast('House removed', 'danger');
    } else {
      setHouses((hs) => hs.map((h) => h.id !== activeId ? h : { ...h, rooms: h.rooms.filter((r) => r.id !== del.room.id) }));
      toast('Room removed', 'danger');
    }
    setDel(null);
  };

  const sidebar = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '18px 16px 14px' }}>
        <a href="Property Suite.html" title="Back to launcher" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <img src="assets/logo-mark.svg" width="30" height="30" alt="" />
          <span style={{ fontSize: 'var(--text-md)', fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--text-heading)' }}>Houses</span>
        </a>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 12px' }}>
        <HousesNav active onClick={backToList} />
      </div>
      <AppShortcuts />
      <div style={{ padding: '14px 18px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600 }}>{houses.length} houses · {totalRooms} rooms</span>
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
      <a href="Profile.html" title="Profile" aria-label="Profile" onClick={() => window.PS.rememberApp()}
        style={{ display: 'flex', marginLeft: 'auto', background: 'none', border: 'none', padding: 0, cursor: 'pointer', borderRadius: '50%', textDecoration: 'none' }}>
        <HAv name={user.name} size="md" />
      </a>
    </div>
  );

  return (
    <ResponsiveShell sidebar={sidebar} topBar={topBar}>
      {screen === 'list'
        ? <HouseList houses={houses} onOpenRooms={openRooms} onAddHouse={() => setConfirmAdd(true)}
            onChatAdd={() => setChat(true)}
            onEditHouse={setEditHouse} onDeleteHouse={removeHouse} />
        : <RoomsScreen house={house} onBack={backToList} onEditRoom={setEditRoom} onAddRoom={addRoom} onDeleteRoom={removeRoom} />}

      {/* Confirm before opening the add-house form */}
      <Modal open={confirmAdd} onClose={() => setConfirmAdd(false)} title="Add a new house?"
        subtitle="This opens the new-house form" width={420}
        footer={<><HBtn variant="ghost" onClick={() => setConfirmAdd(false)}>Cancel</HBtn>
          <HBtn variant="primary" leadingIcon={di('plus')} onClick={() => { setConfirmAdd(false); setAddHouse(true); }}>Continue</HBtn></>}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '4px 0 2px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, flex: 'none',
            borderRadius: 'var(--radius-md)', background: 'var(--brand-tint)', color: 'var(--brand-on-tint)' }}>
            <span style={{ display: 'inline-flex', width: 19, height: 19 }}><i data-lucide="home"></i></span>
          </span>
          <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-body)', lineHeight: 1.55 }}>
            You're about to add a new property to your portfolio. Continue to set up its name, address, and rooms.
          </p>
        </div>
      </Modal>

      {/* Add house (reused from rent-forms) */}
      <AddHouseDrawer open={addHouse} onClose={() => setAddHouse(false)}
        onSave={(p) => {
          const id = 'h' + Math.random().toString(36).slice(2, 6);
          const rooms = Array.from({ length: p.rooms }, (_, k) => ({ id: id + 'r' + k, unit: 'Room ' + (k + 1), tenant: null, rent: p.rent, status: 'Vacant', paid: 0 }));
          setHouses((hs) => [...hs, { id, name: p.address.split(',')[0], address: p.address, rooms }]);
          setAddHouse(false); toast('House added · ' + p.rooms + ' rooms');
        }} />

      {/* Edit house meta */}
      <EditHouseDrawer house={editHouse} onClose={() => setEditHouse(null)}
        onSave={(h) => { setHouses((hs) => hs.map((x) => x.id === h.id ? { ...x, name: h.name, address: h.address } : x)); setEditHouse(null); toast('House saved'); }} />

      {/* Edit room — tenant name + base rent (no rent-entry), reused from rent-forms */}
      <EditRoomDrawer room={editRoom} houseName={house ? house.name : ''} onClose={() => setEditRoom(null)}
        onSave={(saved) => { updateRoom({ ...saved, status: saved.tenant ? 'Occupied' : 'Vacant' }); setEditRoom(null); toast('Room saved'); }} />

      {/* Confirm delete (house or room) */}
      <ConfirmDelete ctx={del} onClose={() => setDel(null)} onConfirm={confirmDelete} />

      {/* Add a property via the conversational onboarding popup */}
      {chat && ChatOnboarding ? (
        <ChatOnboarding user={user} onClose={() => setChat(false)}
          onComplete={({ name, rooms, rent }) => {
            // Persist through the SAME single-source-of-truth write the first-run
            // flow uses: build a canonical house and addHouse() it (it de-dupes its
            // own Firestore echo), then refresh the local view from the store.
            // Appending to local React state alone races with the live subscription
            // and gets clobbered, so we never do that here.
            const hid = 'h' + Date.now().toString(36);
            const rms = Array.from({ length: rooms }, (_, k) => ({
              id: hid + 'r' + (k + 1), unit: 'Room ' + (k + 1), beds: 1,
              rent: Math.max(0, Number(rent) || 0), paid: 0, payStatus: 'Vacant', tenant: null,
            }));
            const house = { id: hid, name, short: name, address: '', color: 'var(--green-500)', rooms: rms };
            (async () => {
              try {
                await window.PS_STORE.ready();
                await window.PS_STORE.addHouse(house);
                setHouses(window.HOUSES_DATA.fromStore(window.PS_STORE.getHouses()));
              } catch (e) { console.error('[houses] chat add failed', e); }
              setScreen('list');
              setChat(false);
              toast('Property added · ' + rooms + (rooms === 1 ? ' room' : ' rooms'));
            })();
          }} />
      ) : null}
    </ResponsiveShell>
  );
}

function HousesNav({ active, onClick }) {
  const { close } = useDrawer();
  return <HDS.NavItem icon={di('building-2')} label="All houses" active={active}
    onClick={() => { onClick(); close(); }} style={{ margin: 0, padding: '16px 12px' }} />;
}

/* Quick links to the other Property Suite apps, pinned at the bottom of the menu. */
const OTHER_APPS = [
  { name: 'Rent Tracker', href: 'Rent Tracker.html', icon: 'wallet' },
  { name: 'Maintenance Scheduler', href: 'Maintenance Scheduler.html', icon: 'calendar-check-2' },
  { name: 'Tenant Bridge', href: 'Tenant Bridge.html', icon: 'messages-square' },
];
function AppShortcuts() {
  return (
    <div style={{ padding: '6px 12px 4px', borderTop: '1px solid var(--border-subtle)' }}>
      <div className="eyebrow" style={{ padding: '10px 8px 8px' }}>Suite</div>
      {OTHER_APPS.map((a) => (
        <a key={a.href} href={a.href} onClick={() => window.PS.rememberApp()}
          style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '9px 12px',
            borderRadius: 'var(--radius-md)', textDecoration: 'none', color: 'var(--text-body)',
            fontSize: 'var(--text-base)', fontWeight: 500 }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
          <Icon name={a.icon} size={18} style={{ color: 'var(--text-muted)' }} />
          <span style={{ flex: 1 }}>{a.name}</span>
          <Icon name="arrow-up-right" size={14} style={{ color: 'var(--text-faint)' }} />
        </a>
      ))}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<ToastHost><HousesApp /></ToastHost>);
