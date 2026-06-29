/* Houses — property & room management.
   Derives its view from the central store (apps/store.js). Tenant is exposed
   as a plain name string (Houses doesn't surface comms / payment status).

   The store is Firestore-backed and async, so the view is built via fromStore()
   AFTER PS_STORE.ready() rather than at module load. */
(function () {
  function fromStore(storeHouses) {
    return (storeHouses || []).map(function (h) {
      return {
        id: h.id, name: h.name, address: h.address,
        rooms: (h.rooms || []).map(function (r) {
          return {
            id: r.id, unit: r.unit, rent: r.rent,
            tenant: r.tenant ? r.tenant.name : null,
            status: r.tenant ? 'Occupied' : 'Vacant',
            paid: 0,
          };
        }),
      };
    });
  }

  window.HOUSES_DATA = {
    HOUSES: [],
    fromStore: fromStore,
    // Rebuild from the (already-ready) store; returns the fresh view array.
    init: function () {
      this.HOUSES = fromStore(window.PS_STORE.getHouses());
      return this.HOUSES;
    },
  };
})();
