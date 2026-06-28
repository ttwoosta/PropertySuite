/** Tinted icon-tile colors for an app card. */
export interface AppTile {
  /** Tile background (CSS color or var()). */
  bg: string;
  /** Tile icon/foreground color (CSS color or var()). */
  fg: string;
}

/** A single tool surfaced on the launcher grid. */
export interface AppItem {
  /** Stable key for trackBy. */
  key: string;
  /** App display name. */
  name: string;
  /** Destination URL (kept as the original multi-page hrefs). */
  href: string;
  /** Lucide icon name. */
  icon: string;
  /** Tinted icon-tile colors. */
  tile: AppTile;
  /** Short uppercase eyebrow tag. */
  tag: string;
  /** One-sentence description. */
  desc: string;
  /** Whether the card spans the full grid width. */
  span?: boolean;
  /** Internal router path for ported apps (takes precedence over `href`). */
  routePath?: string;
}
