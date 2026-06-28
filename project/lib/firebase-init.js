/* Firebase bootstrap (plain JS, no Babel).
   Loaded AFTER the firebase compat SDKs and BEFORE lib/ps-common.js + apps/store.js.
   Initializes the app once and exposes auth + firestore handles on window.PS_FB. */
(function () {
  var firebaseConfig = {
    apiKey: 'AIzaSyCX6EQTgf9Ls-G1qKhr5iLlR_xzB4bP7dg',
    authDomain: 'rental-manager-bc6ba.firebaseapp.com',
    projectId: 'rental-manager-bc6ba',
    storageBucket: 'rental-manager-bc6ba.firebasestorage.app',
    messagingSenderId: '447954650885',
    appId: '1:447954650885:web:487c2af34467fb2650d96c',
    measurementId: 'G-607V78T9GK',
  };

  if (!window.firebase || !firebase.initializeApp) {
    console.error('[PS] Firebase SDK did not load — check the compat <script> tags.');
    window.PS_FB = null;
    return;
  }

  try {
    if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
    window.PS_FB = {
      app: firebase.app(),
      auth: firebase.auth(),
      db: firebase.firestore(),
    };
    // Keep the session alive across page navigations (default, made explicit).
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(function () {});
  } catch (e) {
    console.error('[PS] Firebase init failed', e);
    window.PS_FB = null;
  }
})();
