// Icon helper. The prototype rendered icons as `<i data-lucide="name">` and swapped
// them to SVGs with the vanilla lucide runtime. Here we render real lucide-react
// SVGs synchronously (no DOM mutation that would fight React's reconciler), keyed by
// the same kebab-case names the prototype used.
import * as Lucide from 'lucide-react';
import type { CSSProperties } from 'react';
import type { LucideProps } from 'lucide-react';

function toPascal(name: string): string {
  return name
    .split(/[-_]/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join('');
}

const registry = Lucide as unknown as Record<
  string,
  React.ComponentType<LucideProps>
>;

export function LucideIcon({ name, style, ...rest }: { name: string } & LucideProps) {
  const Cmp = registry[toPascal(name)] ?? registry.Square;
  // Fill the (sized) wrapper. This replaces the prototype's global
  // `svg.lucide { width:100%; height:100% }` CSS rule with a React-owned style,
  // so icon sizing doesn't depend on that stylesheet rule existing.
  return (
    <Cmp {...rest} style={{ width: '100%', height: '100%', display: 'block', ...style }} />
  );
}

/** Drop-in for the prototype's `di('icon-name')` — returns an icon node that fills its wrapper. */
export function di(name: string) {
  return <LucideIcon name={name} />;
}

/** Sized icon box (port of the prototype's shared `Icon` helper). */
export function Icon({
  name,
  size = 18,
  color,
  style,
}: {
  name: string;
  size?: number;
  color?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      style={{
        display: 'inline-flex',
        width: size,
        height: size,
        color,
        flex: 'none',
        ...style,
      }}
    >
      <LucideIcon name={name} />
    </span>
  );
}
