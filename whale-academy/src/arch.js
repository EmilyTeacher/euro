// Street-elevation drawing helpers: tiled roofs, lattice, plaster windows, signboards, the whale emblem.
// roof() / koshi() / mushiko() are adapted from the line-art-animation village example (MIT, see lib/LICENSE-line-art-animation).
import { el, pen, shape, blot, f, PAPER } from '../lib/ink.ts';

export const SP = 0.8; // scene pen
export const lerp = (a, b, t) => a + (b - a) * t;
export const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
export const smooth = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };
export const ease = (t) => smooth(0, 1, t);

export const P = (g, d, w = SP) => { const n = pen(g, w); n.setAttribute('d', d); return n; };
export const S = (g, d, w = SP) => { const n = shape(g, w); n.setAttribute('d', d); return n; };
export const B = (g, d) => { const n = blot(g); n.setAttribute('d', d); return n; };
export const rect = (x0, y0, x1, y1) => `M${x0} ${y0} L${x1} ${y0} L${x1} ${y1} L${x0} ${y1}Z`;
export const oval = (cx, cy, rx, ry) => `M${(cx - rx).toFixed(2)} ${cy.toFixed(2)} a${rx} ${ry} 0 1 0 ${2 * rx} 0 a${rx} ${ry} 0 1 0 ${-2 * rx} 0Z`;

/** Flat-colour fills (roofs, awnings, clothes). Re-tinted toward night each frame by main.js. */
export const tints = [];
export function colored(node, colour) { node.classList.remove('pp'); node.setAttribute('fill', colour); tints.push([node, colour]); return node; }

export function signboard(g, x0, y0, x1, y1, label, size) {
  S(g, rect(x0, y0, x1, y1), SP * 0.9); P(g, rect(x0 + 2, y0 + 2, x1 - 2, y1 - 2), SP * 0.4);
  text(g, (x0 + x1) / 2, (y0 + y1) / 2 + 0.5, label, size, { weight: 800, spacing: 1.2 });
}
export function awning(g, x0, x1, y, h, c1, c2, n = 8) {
  const w = (x1 - x0) / n;
  for (let i = 0; i < n; i++) { const a = x0 + i * w, b = a + w; colored(S(g, `M${a} ${y} L${b} ${y} L${b + 1.2} ${y + h} Q${(a + b) / 2 + 0.6} ${y + h + 3} ${a + 1.2} ${y + h}Z`, SP * 0.7), i % 2 ? c2 : c1); }
}
export function books(g, x, y, w, cols) {
  let cx = x;
  for (let i = 0; cx < x + w - 3; i++) { const bw = 3 + (i * 5) % 3, bh = 8 + (i * 7) % 6; colored(S(g, rect(cx, y - bh, cx + bw, y), SP * 0.5), cols[i % cols.length]); cx += bw + 0.5; }
  P(g, `M${x - 1} ${y} h${w + 2}`, SP * 0.6);
}

const SERIF = '"Noto Serif KR","Nanum Myeongjo","Apple SD Gothic Neo","Malgun Gothic",serif';
export function text(g, x, y, s, size, { weight = 700, anchor = 'middle', family = SERIF, spacing = 0 } = {}) {
  const n = el('text', { x, y, 'font-size': size, 'font-family': family, 'font-weight': weight, fill: 'currentColor', 'text-anchor': anchor, 'dominant-baseline': 'central', 'letter-spacing': spacing }, g);
  n.textContent = s;
  return n;
}

/** Tiled roof: sweeping eave, round tile ends, tile channels up to the ridge, rafters, stacked ridge with end tiles. */
export function roof(g, { x0, x1, eave, ridge, inset, tile = 5.6, sori = 2.8, depth = 2.6, oni = true, rafters = true, fill = null }) {
  const cx = (x0 + x1) / 2;
  const eaveY = (x) => eave - sori * Math.pow(Math.abs(x - cx) / ((x1 - x0) / 2), 2.2);
  const body = S(g, `M${x0} ${eaveY(x0)} Q${cx} ${eave + sori * 0.6} ${x1} ${eaveY(x1)} L${x1 - inset} ${ridge} L${x0 + inset} ${ridge}Z`);
  if (fill) colored(body, fill);
  const ch = [], ends = [];
  for (let x = x0 + tile * 0.8; x < x1 - tile * 0.4; x += tile) {
    const t = (x - x0) / (x1 - x0), ey = eaveY(x) - 0.4;
    const top = lerp(x0 + inset, x1 - inset, t);
    ch.push(`M${f(x)} ${f(ey - 1.6)} Q${f(lerp(x, top, 0.5) + (t - 0.5) * 2)} ${f(lerp(ey, ridge, 0.55))} ${f(top)} ${ridge + 1}`);
    ends.push(oval(x, ey, 1.35, 1.35));
  }
  P(g, ch.join(' '), SP * 0.5);
  el('path', { d: ends.join(' '), fill: PAPER, stroke: 'currentColor', 'stroke-width': SP * 0.55 }, g).classList.add('pp');
  P(g, `M${x0 + 1} ${eaveY(x0) + depth} Q${cx} ${eave + sori * 0.6 + depth} ${x1 - 1} ${eaveY(x1) + depth}`, SP * 0.7);
  if (rafters) {
    const r = [];
    for (let x = x0 + 5; x < x1 - 3; x += 4.2) r.push(`M${f(x)} ${f(eaveY(x) + depth + 0.6)} l0 1.8`);
    P(g, r.join(' '), SP * 0.6);
  }
  const rx0 = x0 + inset - 4, rx1 = x1 - inset + 4;
  S(g, rect(rx0, ridge - 5.5, rx1, ridge + 0.5), SP * 0.9);
  P(g, `M${rx0} ${ridge - 2.6} L${rx1} ${ridge - 2.6}`, SP * 0.5);
  if (oni) [rx0, rx1].forEach((x, i) => {
    const s = i ? 1 : -1;
    S(g, `M${x} ${ridge + 0.5} L${x} ${ridge - 6} Q${x + s * 0.5} ${ridge - 11} ${x + s * 4.5} ${ridge - 12} Q${x + s * 6.5} ${ridge - 9} ${x + s * 5} ${ridge - 6} L${x + s * 5} ${ridge + 0.5}Z`, SP * 0.85);
  });
}

/** Fine vertical slats with a rhythm, rails top and bottom. */
export function koshi(g, x0, x1, y0, y1, { gap = 2.3 } = {}) {
  const top = y0 + (y1 - y0) * 0.16;
  S(g, rect(x0, y0, x1, y1), SP * 0.9);
  const d = [`M${x0} ${f(top)} L${x1} ${f(top)}`, `M${x0} ${y1 - 3} L${x1} ${y1 - 3}`];
  let k = 0;
  for (let x = x0 + gap; x < x1 - 0.5; x += gap, k++) {
    if (k % 4 === 3) d.push(`M${f(x)} ${y0} L${f(x)} ${y1}`);
    else d.push(`M${f(x)} ${f(top)} L${f(x)} ${y1 - 3}`);
  }
  P(g, d.join(' '), SP * 0.55);
}

/** Plaster window with fat vertical bars. */
export function mushiko(g, x0, y0, x1, y1) {
  S(g, `M${x0 + 3} ${y0} L${x1 - 3} ${y0} Q${x1} ${y0} ${x1} ${y0 + 3} L${x1} ${y1 - 3} Q${x1} ${y1} ${x1 - 3} ${y1} L${x0 + 3} ${y1} Q${x0} ${y1} ${x0} ${y1 - 3} L${x0} ${y0 + 3} Q${x0} ${y0} ${x0 + 3} ${y0}Z`, SP);
  const d = [];
  for (let x = x0 + 4; x < x1 - 3; x += 5) d.push(`M${x} ${y0 + 2.5} Q${x - 0.6} ${(y0 + y1) / 2} ${x} ${y1 - 2.5} M${x + 2.4} ${y0 + 2.5} Q${x + 1.8} ${(y0 + y1) / 2} ${x + 2.4} ${y1 - 2.5}`);
  P(g, d.join(' '), SP * 0.55);
}

/** Shoji-style window: paper pane with a fine grid. */
export function shoji(g, x0, y0, x1, y1, cols = 4, rows = 3) {
  S(g, rect(x0, y0, x1, y1), SP);
  const d = [];
  for (let i = 1; i < cols; i++) d.push(`M${f(lerp(x0, x1, i / cols))} ${y0} L${f(lerp(x0, x1, i / cols))} ${y1}`);
  for (let j = 1; j < rows; j++) d.push(`M${x0} ${f(lerp(y0, y1, j / rows))} L${x1} ${f(lerp(y0, y1, j / rows))}`);
  P(g, d.join(' '), SP * 0.5);
}

/** The academy's emblem: a small whale, drawn with the same open pen. */
export function whale(g, cx, cy, s = 1, w = SP) {
  const q = el('g', { transform: `translate(${cx} ${cy}) scale(${s})` }, g);
  S(q, 'M-15 2 C-15 -9 -4 -13 6 -10.5 C12 -9 16 -4 17.5 0.5 C20.5 -3.5 24.5 -5.5 29 -4.5 C28 0 26 3.5 22 5.5 C25 7.5 27 10.5 28 14 C23 12 19.5 9.5 17.5 7 C12 13 -3 14.5 -10 11.5 C-13.5 9.5 -15 5.5 -15 2Z', w / s);
  P(q, 'M-11.5 6.5 Q0 11.5 13 7.2 M-8 9.6 Q0 12.4 8 10.2', w * 0.5 / s);
  P(q, 'M-1 -11.2 L-1 -17 M-1 -17 q-1.5 -3 -6 -3.6 M-1 -17 q1.5 -3 6 -3.6', w * 0.8 / s);
  B(q, oval(-8, -1.5, 1.2, 1.2));
  return q;
}
