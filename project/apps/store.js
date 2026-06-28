/* Property Suite — CENTRAL DATA STORE (plain JS, no Babel).
   FIRESTORE-BACKED, per-user. Single source of truth for houses, rooms, and
   tenants shared by all four apps (Houses, Rent Tracker, Maintenance Scheduler,
   TenantBridge).

   Persistence: each signed-in user owns one Firestore document at
   `users/{uid}` with a `houses` array field. The store attaches a real-time
   onSnapshot listener so edits made on one app/device propagate live to every
   open page. A brand-new user's document is seeded with the demo portfolio on
   first load. There is NO localStorage fallback — Firestore is the only store.

   The Houses app is the canonical editor: it commits structural / tenant edits
   back here (commitFromHouses), preserving rent- and communication-specific
   fields it doesn't manage. Each app builds its own view shape from this
   canonical record in its *-data.js file via fromStore().

   API (all read methods are sync against an in-memory cache that is hydrated
   asynchronously — callers MUST `await PS_STORE.ready()` first):
     ready()                 -> Promise (resolves after auth + first snapshot)
     getHouses()             -> deep clone of canonical houses
     tenants()               -> flat tenant list with house/room context
     subscribe(cb)           -> register for REMOTE changes; returns unsubscribe
     commitFromHouses(proj)  -> merge a Houses projection + write to Firestore
     addHouse(house)         -> append a canonical house + write (onboarding)
     reset()                 -> restore the seed for this user */
(function () {
  var fb = window.PS_FB;
  var db = fb ? fb.db : null;

  // ---- canonical seed -------------------------------------------------
  // A house has: id, name, short, address, color, rooms[].
  // A room has: id, unit, beds, rent, paid, payStatus, tenant (object|null).
  // A tenant has: id, name + communication profile (used by TenantBridge).
  var SEED = [
    {
      id: 'maple', name: 'Maple Court', short: 'Maple Court',
      address: '14 Maple Court, Leeds LS6 2AB', color: 'var(--green-500)',
      rooms: [
        { id: 'm1', unit: 'Room 1', beds: 1, rent: 620, paid: 620, payStatus: 'Paid',
          tenant: { id: 'marcus', name: 'Marcus Bell', score: 5, lastContact: 2,
            style: 'Direct, brief replies', payment: 'On time, monthly', preferTime: 'Evenings after 6pm' } },
        { id: 'm2', unit: 'Room 2', beds: 1, rent: 640, paid: 320, payStatus: 'Partial',
          tenant: { id: 'priya', name: 'Priya Shah', score: 5, lastContact: 7,
            style: 'Friendly, prefers texts', payment: 'Pays in two halves', preferTime: 'Lunch hours' } },
        { id: 'm3', unit: 'Room 3', beds: 1, rent: 600, paid: 0, payStatus: 'Pending',
          tenant: { id: 'tom', name: 'Tom Reilly', score: 3, lastContact: 21,
            style: 'Formal email tone', payment: 'Often 1\u20132 days late', preferTime: 'Weekday mornings' } },
        { id: 'm4', unit: 'Room 4', beds: 1, rent: 600, paid: 0, payStatus: 'Vacant', tenant: null },
      ],
    },
    {
      id: 'birch', name: 'Birchwood House', short: 'Birchwood',
      address: '8 Birchwood Rd, Leeds LS4 1QP', color: 'var(--amber-400)',
      rooms: [
        { id: 'b1', unit: 'Room 1', beds: 2, rent: 700, paid: 700, payStatus: 'Paid',
          tenant: { id: 'dana', name: 'Dana Okafor', score: 5, lastContact: 4,
            style: 'Warm, conversational', payment: 'Standing order, on time', preferTime: 'Anytime' } },
        { id: 'b2', unit: 'Room 2', beds: 1, rent: 580, paid: 580, payStatus: 'Paid',
          tenant: { id: 'sam', name: 'Sam Lin', score: 4, lastContact: 12,
            style: 'Short bullet points', payment: 'Reliable', preferTime: 'After 5pm' } },
        { id: 'b3', unit: 'Room 3', beds: 1, rent: 590, paid: 295, payStatus: 'Partial',
          tenant: { id: 'ava', name: 'Ava Moreno', score: 4, lastContact: 6,
            style: 'Likes detail and context', payment: 'Reliable', preferTime: 'Lunch' } },
      ],
    },
    {
      id: 'oak', name: 'Oakfield Lodge', short: 'Oakfield',
      address: '22 Oakfield Ave, Leeds LS8 3RT', color: 'var(--blue-400)',
      rooms: [
        { id: 'o1', unit: 'Room 1', beds: 1, rent: 660, paid: 660, payStatus: 'Paid',
          tenant: { id: 'hannah', name: 'Hannah Cole', score: 5, lastContact: 9,
            style: 'Polite, occasional calls', payment: 'On time, monthly', preferTime: 'Weekday afternoons' } },
        { id: 'o2', unit: 'Room 2', beds: 1, rent: 640, paid: 0, payStatus: 'Vacant', tenant: null },
        { id: 'o3', unit: 'Room 3', beds: 1, rent: 650, paid: 0, payStatus: 'Pending',
          tenant: { id: 'leo', name: 'Leo Park', score: 4, lastContact: 15,
            style: 'Brief texts', payment: 'Reliable', preferTime: 'Evenings' } },
        { id: 'o4', unit: 'Studio', beds: 1, rent: 780, paid: 0, payStatus: 'Vacant', tenant: null },
      ],
    },
  ];

  var PALETTE = ['var(--green-500)', 'var(--amber-400)', 'var(--blue-400)', 'var(--red-500)', 'var(--gray-500)'];
  var clone = function (x) { return JSON.parse(JSON.stringify(x)); };

  // ---- live cache + Firestore wiring ----------------------------------
  var HOUSES = [];            // canonical cache (hydrated from Firestore)
  var uid = null;
  var docRef = null;
  var unsubDoc = null;
  var subscribers = [];
  var lastWriteJSON = null;   // JSON of our most recent write — used to ignore our own echo
  var firstLoaded = false;
  var started = false;
  var resolveReady;
  var readyP = new Promise(function (r) { resolveReady = r; });

  function notify() {
    subscribers.slice().forEach(function (cb) {
      try { cb(clone(HOUSES)); } catch (e) { console.error('[PS_STORE] subscriber error', e); }
    });
  }

  function start() {
    if (started) return readyP;
    started = true;

    if (!db || !window.PS || !window.PS.Auth) {
      console.error('[PS_STORE] Firebase/Auth unavailable — cannot reach Firestore.');
      firstLoaded = true; resolveReady([]);
      return readyP;
    }

    window.PS.Auth.ready().then(function (user) {
      if (!user) { firstLoaded = true; resolveReady([]); return; } // signed out — app will redirect
      uid = user.uid;
      docRef = db.collection('users').doc(uid);
      unsubDoc = docRef.onSnapshot(function (snap) {
        if (!snap.exists) {
          // First time we've seen this user — create an EMPTY portfolio. We no
          // longer seed the demo houses; a brand-new landlord is taken through
          // the onboarding chat (launcher) which adds their first property.
          var fresh = [];
          lastWriteJSON = JSON.stringify(fresh);
          docRef.set({ houses: fresh, createdAt: Date.now() })
            .catch(function (e) { console.error('[PS_STORE] init write failed', e); });
          return; // the write re-fires this snapshot with data
        }
        var data = snap.data() || {};
        var houses = Array.isArray(data.houses) ? data.houses : [];
        var json = JSON.stringify(houses);
        HOUSES = houses;
        if (!firstLoaded) { firstLoaded = true; resolveReady(clone(HOUSES)); }
        // Only notify consumers for changes that did NOT originate from this client.
        if (json !== lastWriteJSON) notify();
      }, function (err) {
        console.error('[PS_STORE] snapshot error', err);
        if (!firstLoaded) { firstLoaded = true; resolveReady([]); }
      });
    });

    return readyP;
  }

  function persist(houses) {
    if (!docRef) return Promise.resolve();
    lastWriteJSON = JSON.stringify(houses);
    return docRef.set({ houses: houses, updatedAt: Date.now() }, { merge: true })
      .catch(function (e) { console.error('[PS_STORE] write failed', e); });
  }

  // Begin hydrating immediately (auth resolves asynchronously inside).
  start();

  // ---- tenant helpers (for commit merge) ------------------------------
  function slug(name) {
    var base = String(name || '').trim().split(/\s+/)[0].toLowerCase().replace(/[^a-z0-9]/g, '') || 'tenant';
    var taken = {};
    HOUSES.forEach(function (h) { (h.rooms || []).forEach(function (r) { if (r.tenant) taken[r.tenant.id] = 1; }); });
    if (!taken[base]) return base;
    var i = 2; while (taken[base + i]) i++; return base + i;
  }
  function findTenantByName(name) {
    for (var i = 0; i < HOUSES.length; i++) {
      var rooms = HOUSES[i].rooms || [];
      for (var j = 0; j < rooms.length; j++) {
        if (rooms[j].tenant && rooms[j].tenant.name === name) return rooms[j].tenant;
      }
    }
    return null;
  }
  var DEFAULT_PROFILE = { score: 5, lastContact: 0,
    style: 'No notes yet', payment: 'No history yet', preferTime: 'Anytime' };

  // Merge a Houses-app projection back into the canonical store. The Houses
  // app manages: house name/address, room set, unit label, base rent, and
  // tenant *name*. Everything else (rent paid/payStatus/beds, tenant comms,
  // house short/color) is preserved from the existing record.
  function commitFromHouses(projection) {
    if (!Array.isArray(projection)) return Promise.resolve();
    var prevById = {};
    HOUSES.forEach(function (h) { prevById[h.id] = h; });
    var next = projection.map(function (ph, hi) {
      var prev = prevById[ph.id] || {};
      var prevRoomById = {};
      (prev.rooms || []).forEach(function (r) { prevRoomById[r.id] = r; });
      var rooms = (ph.rooms || []).map(function (pr) {
        var pRoom = prevRoomById[pr.id] || {};
        var tenant = pRoom.tenant || null;
        var name = pr.tenant || null;        // Houses exposes tenant as a name string
        if (!name) {
          tenant = null;
        } else if (!tenant || tenant.name !== name) {
          var existing = findTenantByName(name);
          tenant = existing ? clone(existing)
            : Object.assign({ id: slug(name), name: name }, DEFAULT_PROFILE);
        }
        return {
          id: pr.id,
          unit: pr.unit != null ? pr.unit : (pRoom.unit || 'Room'),
          beds: pRoom.beds != null ? pRoom.beds : 1,
          rent: pr.rent != null ? pr.rent : (pRoom.rent || 0),
          paid: pRoom.paid != null ? pRoom.paid : 0,
          payStatus: pRoom.payStatus || (name ? 'Pending' : 'Vacant'),
          tenant: tenant,
        };
      });
      return {
        id: ph.id,
        name: ph.name || prev.name || 'House',
        short: prev.short || (ph.name || 'House'),
        address: ph.address != null ? ph.address : (prev.address || ''),
        color: prev.color || PALETTE[hi % PALETTE.length],
        rooms: rooms,
      };
    });
    HOUSES = next;
    return persist(HOUSES);
  }

  function addHouse(house) {
    if (!house) return Promise.resolve();
    HOUSES = HOUSES.concat([clone(house)]);
    return persist(HOUSES);
  }

  window.PS_STORE = {
    ready: function () { return start(); },
    // Fresh deep clone of the canonical houses (callers own/mutate their copy).
    getHouses: function () { return clone(HOUSES); },
    // Flat list of every tenant with its house + room context.
    tenants: function () {
      var out = [];
      HOUSES.forEach(function (h) {
        (h.rooms || []).forEach(function (r) {
          if (r.tenant) out.push(Object.assign({}, r.tenant, { houseId: h.id, houseName: h.name, unit: r.unit }));
        });
      });
      return out;
    },
    // Register for REMOTE changes (edits from another app/device). Returns an
    // unsubscribe fn. The callback receives a fresh clone of the houses.
    subscribe: function (cb) {
      subscribers.push(cb);
      return function () { subscribers = subscribers.filter(function (x) { return x !== cb; }); };
    },
    commitFromHouses: commitFromHouses,
    // Patch a single tenant's fields (e.g. phone number) by id, in place, and
    // persist. Used by TenantBridge to update contact details.
    updateTenant: function (id, patch) {
      var found = false;
      HOUSES.forEach(function (h) {
        (h.rooms || []).forEach(function (r) {
          if (r.tenant && r.tenant.id === id) { Object.assign(r.tenant, patch); found = true; }
        });
      });
      if (!found) return Promise.resolve();
      return persist(HOUSES);
    },
    addHouse: addHouse,
    reset: function () { HOUSES = clone(SEED); return persist(HOUSES); },
  };
})();
