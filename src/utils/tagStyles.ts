/**
 * StyleX tag badge styling derived from a tag's `hexColor`.
 * Original Tailwind: `bg-<c>-500/15 text-<c>-700 dark:text-<c>-400 border-<c>-500/30`.
 * We derive the three shades from the single 500-level hex: text-700 darkens it,
 * text-400 lightens it for dark mode; background/border use alpha.
 */
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function shade(hex: string, amount: number): string {
  // amount negative -> darken, positive -> lighten (0..1)
  const [r, g, b] = hexToRgb(hex);
  const mix = amount < 0 ? (c: number) => Math.round(c * (1 + amount)) : (c: number) => Math.round(c + (255 - c) * amount);
  const toHex = (n: number) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, '0');
  return `#${[mix(r), mix(g), mix(b)].map(toHex).join('')}`;
}

/** Dark-mode text level (Tailwind -400) is lighter than the base => +0.18. */
function hexToRgba(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Returns a StyleX style for a tag badge given its 500-level hex color. */
export function tagStyles(hexColor: string): { [key: string]: string | { [key: string]: string } } {
  return {
    backgroundColor: hexToRgba(hexColor, 0.15),
    borderColor: hexToRgba(hexColor, 0.3),
    color: shade(hexColor, -0.2), // ~700
    // dark mode: lighter text (~400)
    ':is(.dark *)': {
      color: shade(hexColor, 0.3),
    },
  };
}
