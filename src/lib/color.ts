/**
 * Build a 10-step brand palette (50→900) from a single hex colour. Returns
 * CSS variable fragments like `--brand-500: 255 45 45;` so they can be
 * injected into the root via a style block.
 *
 * Algorithm: convert to HSL, walk lightness up for tints (50..400) and down
 * for shades (600..900). Saturation is also nudged so 50/100 stay soft.
 */
function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.trim().replace('#', '');
  const v = m.length === 3 ? m.split('').map(c => c + c).join('') : m;
  if (!/^[0-9a-fA-F]{6}$/.test(v)) return null;
  return [
    parseInt(v.slice(0, 2), 16),
    parseInt(v.slice(2, 4), 16),
    parseInt(v.slice(4, 6), 16)
  ];
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h * 360, s * 100, l * 100];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h = ((h % 360) + 360) % 360 / 360;
  s = Math.min(100, Math.max(0, s)) / 100;
  l = Math.min(100, Math.max(0, l)) / 100;
  let r: number, g: number, b: number;
  if (s === 0) { r = g = b = l; }
  else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/**
 * Step table — lightness targets for each Tailwind shade.
 * Saturation is left as-is for shades; tints get a slight desaturate pass.
 */
const STEPS: Record<number, number> = {
  50: 96,
  100: 92,
  200: 84,
  300: 72,
  400: 58,
  500: 46,
  600: 38,
  700: 30,
  800: 22,
  900: 16
};

export interface PaletteVars {
  cssText: string;
  isValid: boolean;
}

export function paletteFromHex(hex: string): PaletteVars {
  const rgb = hexToRgb(hex || '');
  if (!rgb) return { cssText: '', isValid: false };
  const [h, s] = rgbToHsl(rgb[0], rgb[1], rgb[2]);
  const lines: string[] = [];
  for (const [step, l] of Object.entries(STEPS)) {
    const sat = parseInt(step) <= 400 ? Math.max(s * 0.6, 30) : s;
    const [r, g, b] = hslToRgb(h, sat, l);
    lines.push(`--brand-${step}: ${r} ${g} ${b};`);
  }
  return { cssText: lines.join(' '), isValid: true };
}