// Loads the Maintenance Scheduler design system.
//
// Order matters: `./expose-react` publishes our React instance onto the global
// object, and only then do we execute the bundle IIFE, which reads that global
// and registers every component on `window.MaintenanceSchedulerDesignSystem_02479c`.
import './expose-react';
import './ds_bundle.js';

const NS = '__MaintenanceSchedulerDesignSystem_02479c__';

export interface DsNamespace {
  Avatar: unknown;
  Badge: unknown;
  Button: unknown;
  Card: unknown;
  CardHeader: unknown;
  IconButton: unknown;
  StatCard: unknown;
  TaskCard: unknown;
  Checkbox: unknown;
  Input: unknown;
  Select: unknown;
  NavItem: unknown;
  __errors?: Array<{ path: string; error: string }>;
}

export const ds: DsNamespace = (
  window as unknown as Record<string, DsNamespace>
)['MaintenanceSchedulerDesignSystem_02479c'];

if (!ds) {
  throw new Error(
    `Design system failed to load (${NS}). Check src/ds-vendor/ds_bundle.js.`,
  );
}
