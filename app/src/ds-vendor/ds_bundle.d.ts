// The DS bundle is a side-effect-only precompiled script. Declare it so TS lets
// us `import './ds_bundle.js'` purely for its side effects.
declare module './ds_bundle.js';
