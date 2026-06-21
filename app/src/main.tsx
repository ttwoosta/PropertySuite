// Entry point. The design system must load first: ./ds-vendor/ds publishes our
// React instance globally and then runs the DS bundle IIFE, so DS components are
// registered before anything renders.
import './ds-vendor/ds';
import './ds-vendor/styles.css';
import './styles/ps-app.css';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
