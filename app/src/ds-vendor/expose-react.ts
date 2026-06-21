// The design-system bundle is a precompiled IIFE that references a *bare global*
// `React` (it calls `React.createElement`, `React.useState`, `React.useId`).
// We must publish our single npm React instance onto the global object BEFORE
// that bundle executes, so the DS components and our app share one React — hooks
// and context work across the boundary.
//
// This lives in its own module so ESM evaluation order guarantees it runs before
// `./ds_bundle.js` is imported (see ./ds.ts).
import * as ReactNS from 'react';
import * as ReactDOMNS from 'react-dom';

const R = (ReactNS as unknown as { default?: unknown }).default ?? ReactNS;
const RD = (ReactDOMNS as unknown as { default?: unknown }).default ?? ReactDOMNS;

(globalThis as unknown as { React: unknown }).React = R;
(globalThis as unknown as { ReactDOM: unknown }).ReactDOM = RD;

export {};
