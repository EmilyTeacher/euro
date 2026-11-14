// 고래영어학원의 하루 — one fixed street elevation; only light, shadow and the small lessons change.
import { el, f, inkDefs, pen } from '../lib/ink.ts';
import { palette, applyPalette, rgb, mix, toRGB, nightTint } from '../lib/daynight.ts';
import { SP, P as Pn, S as Sh, B as Bl, rect, oval, lerp, clamp, smooth, ease, roof, koshi, mushiko, shoji, whale, text, tints, colored, signboard, awning, books } from './arch.js';
import { buildWalkers } from './walkers.js';
import { buildPhonics, buildNews, buildReading } from './lessons.js';

const $ = (id) => document.getElementById(id);
const W = 960, H = 540, BASE = 430;
const svg = $('s');
const ink = inkDefs(svg, 'ink');
const defs = ink.defs;

// ---------------------------------------------------------------- gradients
const sky = el('linearGradient', { id: 'skyg', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
const stTop = el('stop', { offset: 0 }, sky), stBot = el('stop', { offset: 1 }, sky);
const wg = el('radialGradient', { id: 'wg' }, defs);
el('stop', { offset: 0, 'stop-color': '#ffcf7e', 'stop-opacity': 0.9 }, wg);
el('stop', { offset: 0.5, 'stop-color': '#f3a54d', 'stop-opacity': 0.28 }, wg);
el('stop', { offset: 1, 'stop-color': '#f3a54d', 'stop-opacity': 0 }, wg);

// ---------------------------------------------------------------- layers
const skyL = el('g', {}, svg);
const scene = el('g', { filter: ink.filter }, svg);
const glowL = el('g', { style: 'mix-blend-mode:screen;pointer-events:none' }, svg);
const hitL = el('g', {}, svg);

// ---------------------------------------------------------------- sky
el('rect', { width: W, height: H, fill: 'url(#skyg)' }, skyL);
const starsG = el('g', {}, skyL);
for (let i = 0; i < 40; i++) el('circle', { cx: (i * 173) % 940 + 10, cy: (i * 61) % 200 + 12, r: 0.7 + (i % 3) * 0.35, fill: '#efe6cf' }, starsG);
const sunG = el('g', { transform: 'translate(838 92)' }, skyL);
const sunDisc = el('circle', { r: 15, 'stroke-width': SP, stroke: 'currentColor' }, sunG);
const moon = el('path', { d: 'M4 -15 A15 15 0 1 0 14 6 A12 12 0 1 1 4 -15Z', fill: '#efe6cf', stroke: 'none', opacity: 0 }, sunG);
const clouds = el('g', { fill: 'none', stroke: 'currentColor', 'stroke-width': 0.7, opacity: 0.4, 'stroke-linecap': 'round' }, skyL);
Pn(clouds, 'M130 96 h86 q12 0 14 -6 M150 103 h50 M520 70 h96 q12 0 12 -5 M542 77 h48 M330 150 h70 M352 157 h34 M700 140 h80', 0.7);
Array.from(clouds.children).forEach((c) => { c.setAttribute('fill', 'none'); });

// ---------------------------------------------------------------- side buildings (quieter than the academy)
const sides = el('g', { opacity: 0.6 }, scene);
function house(g, { x0, x1, eave, ridge, inset, win, tile = 5.8, roofC }) {
  Sh(g, rect(x0 + 4, eave + 2, x1 - 4, BASE), SP);
  roof(g, { x0: x0 - 10, x1: x1 + 10, eave, ridge, inset, tile, fill: roofC });
  Sh(g, rect(x0 + 2, eave + 6, x1 - 2, eave + 12), SP * 0.8);
  win.forEach(([a, b, c, d, kind]) => (kind === 's' ? shoji(g, a, b, c, d, 3, 2) : mushiko(g, a, b, c, d)));
}
function shopFront(g, x0, x1, sign, ac, fill) {
  signboard(g, x0 + 6, 358, x1 - 6, 376, sign, 11);
  awning(g, x0 + 2, x1 - 2, 380, 11, ac[0], ac[1], 9);
  Sh(g, rect(x0 + 10, 396, x1 - 10, BASE - 3), SP);
  fill(g, x0 + 10, x1 - 10);
}
const bookShelf = (g, a, b) => { books(g, a + 4, 410, b - a - 8, ['#a5483c', '#3f6a73', '#c79a3b', '#5d5a86', '#7a4a3a']); books(g, a + 4, 426, b - a - 8, ['#5d5a86', '#c79a3b', '#a5483c', '#3f6a73']); };
const fruitStall = (g, a, b) => { for (let x = a + 8; x < b - 6; x += 12) { colored(Sh(g, oval(x, 420, 5, 5), SP * 0.5), (x / 12 | 0) % 2 ? '#d96a3c' : '#b3412d'); colored(Sh(g, oval(x + 4, 414, 4, 4), SP * 0.5), '#8aa24a'); } Pn(g, `M${a + 2} 426 H${b - 2}`, SP * 0.6); };
house(sides, { x0: 56, x1: 252, eave: 300, ridge: 248, inset: 40, win: [[74, 316, 118, 352], [140, 316, 184, 352]], roofC: '#8a5a47' });
shopFront(sides, 56, 252, '책방 · BOOKS', ['#c79a3b', '#fbf6ea'], bookShelf);
house(sides, { x0: -70, x1: 40, eave: 314, ridge: 268, inset: 22, win: [[-30, 332, 8, 366]], roofC: '#5c6670' });
house(sides, { x0: 708, x1: 904, eave: 296, ridge: 240, inset: 42, win: [[728, 314, 774, 350, 's'], [796, 314, 842, 350, 's'], [856, 330, 890, 360]], roofC: '#3f6a73' });
shopFront(sides, 708, 904, '과일 · FRUIT', ['#4f7a55', '#fbf6ea'], fruitStall);
house(sides, { x0: 920, x1: 1040, eave: 310, ridge: 262, inset: 24, win: [[940, 328, 980, 362]], roofC: '#7a4a3a' });

// ---------------------------------------------------------------- the academy
const A = el('g', {}, scene);
Sh(A, rect(270, 198, 690, BASE), SP);
roof(A, { x0: 246, x1: 714, eave: 198, ridge: 122, inset: 84, tile: 6.6, sori: 4, depth: 3.2, fill: '#4f7a7e' });
// signboard + whale emblem
Pn(A, 'M384 201 V207 M576 201 V207', SP);
Sh(A, rect(372, 207, 588, 243), SP * 1.1);
Pn(A, rect(376, 211, 584, 239), SP * 0.5);
text(A, 482, 226, '고래영어학원', 23, { weight: 800, spacing: 3 });
const emb = el('g', {}, A);
Sh(emb, oval(336, 225, 22, 22), SP);
Pn(emb, oval(336, 225, 18.5, 18.5), SP * 0.45);
whale(emb, 331, 228, 0.72, SP);
// classroom windows
const WX = [296, 425, 554], WY = 252, WWID = 110, WHT = 116;
const lessons = [buildPhonics, buildNews, buildReading];
const rooms = WX.map((x, i) => {
  Sh(A, rect(x - 5, WY - 5, x + WWID + 5, WY + WHT + 5), SP);
  const clip = el('clipPath', { id: `cw${i}` }, defs); el('rect', { x, y: WY, width: WWID, height: WHT }, clip);
  const outer = el('g', { 'clip-path': `url(#cw${i})` }, A);
  const inner = el('g', { transform: `translate(${x} ${WY})` }, outer);
  const L = lessons[i](inner);
  // roller blind at the top
  Sh(A, rect(x, WY, x + WWID, WY + 9), SP * 0.8);
  Pn(A, `M${x} ${WY + 4.5} H${x + WWID}`, SP * 0.4);
  Sh(A, rect(x - 8, WY + WHT + 5, x + WWID + 8, WY + WHT + 10), SP);
  return L;
});
// lower shed roof, lattice and the entrance
roof(A, { x0: 256, x1: 704, eave: 394, ridge: 378, inset: 10, tile: 6, sori: 1.6, depth: 2, oni: false, fill: '#8a5a47' });
awning(A, 446, 514, 398, 7, '#4f7a7e', '#fbf6ea', 6);
koshi(A, 270, 432, 398, BASE); koshi(A, 528, 690, 398, BASE);
Sh(A, rect(444, 398, 516, BASE), SP);
const doorPane = el('path', { d: rect(449, 403, 511, 428), stroke: 'currentColor', 'stroke-width': SP * 0.7 }, A);
Pn(A, 'M480 403 V428 M449 415.5 H511 M464.5 403 V428 M495.5 403 V428', SP * 0.45);
[438, 522].forEach((x) => {
  Sh(A, `M${x - 7} 414 h14 l-2 16 h-10Z`, SP * 0.8);
  Pn(A, `M${x} 414 q-8 -8 -11 -16 M${x} 414 q0 -12 0 -20 M${x} 414 q8 -8 11 -16 M${x} 414 q-4 -10 -5 -15 M${x} 414 q4 -10 5 -15`, SP * 0.55);
});

// ---------------------------------------------------------------- street (shallow sidewalk, curb, road)
const street = el('g', {}, scene);
Sh(street, rect(-10, BASE, W + 10, 478), SP);
{ const d = []; [442, 454, 466].forEach((y, r) => { d.push(`M0 ${y} H${W}`); for (let x = (r % 2) * 26; x < W; x += 52) d.push(`M${x} ${y} v12`); }); Pn(street, d.join(' '), SP * 0.4).setAttribute('opacity', 0.45); }
Sh(street, rect(-10, 478, W + 10, 552), SP);
Pn(street, `M0 482 H${W}`, SP * 0.6);
{ const d = []; for (let x = 20; x < W; x += 90) d.push(`M${x} 512 h44`); Pn(street, d.join(' '), SP * 0.5).setAttribute('opacity', 0.6); }
const shadow = el('path', { fill: 'currentColor', stroke: 'none' }, street);
const lampX = [232, 728];
const lampShadow = lampX.map(() => el('path', { fill: 'none', stroke: 'currentColor', 'stroke-width': 2.4, 'stroke-linecap': 'round' }, street));
// street lamps
const lampRefs = lampX.map((x) => {
  const g = el('g', {}, scene);
  Pn(g, `M${x} 462 V318 q0 -10 -8 -10`, SP * 1.5);
  Sh(g, rect(x - 6, 456, x + 6, 462), SP);
  const body = Sh(g, `M${x - 20} 296 h16 l-2 16 h-12Z`, SP);
  Sh(g, `M${x - 22} 296 h20 l-3 -6 h-14Z`, SP * 0.8);
  Pn(g, `M${x - 16} 300 v10 M${x - 8} 300 v10`, SP * 0.4);
  return { cx: x - 12, cy: 304, body };
});


// ---------------------------------------------------------------- people on the sidewalk, and the academy shuttle on the road
const walkers = buildWalkers(scene);
const bus = el('g', {}, scene);
colored(Sh(bus, 'M-56 -36 Q-56 -45 -47 -45 H40 Q50 -45 54 -37 L61 -21 V-8 H-56Z', SP), '#e0b030');
[-48, -35, -22, -9, 4].forEach((x) => Sh(bus, rect(x, -40, x + 10, -27), SP * 0.6));
Sh(bus, 'M20 -40 H36 L42 -28 H20Z', SP * 0.6);
Pn(bus, 'M-56 -20 H61', SP * 0.5);
const busWhale = whale(bus, -18, -12, 0.55, SP); 
[-34, 36].forEach((x) => { Bl(bus, oval(x, -7, 8, 8)); Sh(bus, oval(x, -7, 3.2, 3.2), SP * 0.5); });
const busGlow = el('ellipse', { rx: 46, ry: 16, fill: 'url(#wg)', opacity: 0 }, glowL);

// ---------------------------------------------------------------- light layer
const glowWin = WX.map((x) => el('ellipse', { cx: x + WWID / 2, cy: WY + WHT / 2, rx: 92, ry: 88, fill: 'url(#wg)', opacity: 0 }, glowL));
const glowDoor = el('ellipse', { cx: 480, cy: 420, rx: 70, ry: 32, fill: 'url(#wg)', opacity: 0 }, glowL);
const glowLamp = lampRefs.map((l) => el('circle', { cx: l.cx, cy: l.cy, r: 40, fill: 'url(#wg)', opacity: 0 }, glowL));
const pool = el('ellipse', { cx: 609, cy: 452, rx: 74, ry: 9, fill: 'url(#wg)', opacity: 0 }, glowL);

// ---------------------------------------------------------------- windows are the click targets
const NAMES = ['왼쪽 교실 창, 파닉스', '가운데 교실 창, 영자신문', '오른쪽 교실 창, 중·고등 독해'];
const winEls = WX.map((x, i) => {
  const g = el('g', { class: 'win', tabindex: 0, role: 'button', 'aria-label': `${NAMES[i]} — 누르면 이 수업으로 이동` }, hitL);
  el('rect', { class: 'ring', x: x - 9, y: WY - 9, width: WWID + 18, height: WHT + 18, rx: 4, fill: 'none', stroke: '#b8704a', 'stroke-width': 2 }, g);
  el('rect', { class: 'hit', x: x - 10, y: WY - 14, width: WWID + 20, height: WHT + 30, fill: 'transparent' }, g);
  g.addEventListener('click', () => selectWin(i));
  g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectWin(i); } });
  return g;
});

// ================================================================= time
const TOTAL = 22;
const TAU = { A: 0.585, S: 0.728, E: 0.8 };
function tauAt(T) {
  if (T <= 5.5) return TAU.A;
  if (T < 6.5) return lerp(TAU.A, TAU.S, ease(T - 5.5));
  if (T <= 12.5) return TAU.S;
  if (T < 13.5) return lerp(TAU.S, TAU.E, ease(T - 12.5));
  return TAU.E;
}
const STABLE = [[0, 5.4], [6.5, 12.4], [13.5, 20]], JUMP = [0, 6.5, 13.5], START = [0, 6.5, 13.5];
const LAB = ['오후 2:15 · 파닉스', '오후 5:10 · 영자신문', '오후 7:30 · 중·고등 독해'];
const SUB = ['소리를 하나씩 모아, 단어로.', '오늘의 뉴스, 내 목소리로.', '답을 고르고, 근거까지.'];
const DESC = ['글자 소리를 하나씩 익히고 이어 읽어요.', '영자신문을 읽고 한 문장을 내 목소리로 말해요.', '지문에서 답의 근거를 찾아 설명해요.'];
const WARM = [255, 207, 126], DARKINK = [40, 33, 46], ROOM = [222, 210, 188];

let T = 0, playing = true, holdSeg = null, ended = false;
const stage = $('stage');

function render() {
  const Tp = holdSeg !== null ? clamp(T, STABLE[holdSeg][0], STABLE[holdSeg][1]) : T;
  const tau = tauAt(Tp), P = palette(tau);
  applyPalette(svg, P);
  stTop.setAttribute('stop-color', rgb(P.top)); stBot.setAttribute('stop-color', rgb(P.bottom));
  const st = stage.style;
  st.setProperty('--ink', rgb(P.ink)); st.setProperty('--paper', rgb(P.paper));
  st.setProperty('--cap', `rgba(${P.paper.map(Math.round).join(',')},.84)`); st.setProperty('--ink', rgb(P.ink));
  // sun / moon / stars
  sunDisc.setAttribute('fill', rgb(mix(toRGB('#fffdf8'), toRGB('#f4b78a'), P.sunset))); sunDisc.setAttribute('opacity', 1 - clamp(P.night * 1.6, 0, 1));
  moon.setAttribute('opacity', clamp(P.night * 1.6 - 0.3, 0, 1));
  starsG.setAttribute('opacity', P.night * 0.9);
  // light: the right-hand classroom is the one still lit at 7:30
  const lamp = P.lamp, lampOn = smooth(0.3, 0.9, lamp);
  const lit = [0.34 * lamp, Math.max(0.5 * lamp, 0.26 * smooth(0.69, 0.73, tau)), lamp];
  const base = mix(P.paper, ROOM, 0.5 * (1 - P.night));
  rooms.forEach((R, i) => {
    R.wall.setAttribute('fill', rgb(mix(base, WARM, lit[i] * 0.95)));
    R.root.style.color = rgb(mix(P.ink, DARKINK, clamp(lit[i] * 1.5, 0, 1)));
    glowWin[i].setAttribute('opacity', lit[i] * 0.5);
  });
  doorPane.setAttribute('fill', rgb(mix(P.paper, WARM, lampOn * 0.9)));
  glowDoor.setAttribute('opacity', lampOn * 0.35); pool.setAttribute('opacity', lit[2] * 0.4);
  glowLamp.forEach((g) => g.setAttribute('opacity', lampOn * 0.5));
  lampRefs.forEach((l) => l.body.setAttribute('fill', rgb(mix(P.paper, WARM, lampOn))));
  // shadows on the pavement: short at 2:15, long and soft at 5:10, gone at night
  const k = lerp(0.25, 1, smooth(0.585, 0.728, tau)) * (1 - smooth(0.735, 0.79, tau));
  const Lb = 120 * k, Wd = 44 * k;
  shadow.setAttribute('d', `M-10 ${BASE} L${W + 10 + Lb} ${BASE} L${W + 10} ${BASE + Wd} L${-10 - Lb} ${BASE + Wd}Z`); shadow.setAttribute('opacity', 0.1 * (k > 0 ? 1 : 0));
  lampX.forEach((x, i) => { lampShadow[i].setAttribute('d', `M${x} 460 l${(-150 * k).toFixed(1)} ${(14 * k).toFixed(1)}`); lampShadow[i].setAttribute('opacity', 0.09); });
  tints.forEach(([n, c]) => n.setAttribute('fill', nightTint(c, P, 0.6)));
  walkers.update(T);
  const bx = ((-160 + 52 * T) % 1280 + 1280) % 1280 - 100;
  bus.setAttribute('transform', `translate(${bx.toFixed(1)} 503) scale(0.8)`); busGlow.setAttribute('cx', bx + 56); busGlow.setAttribute('cy', 492); busGlow.setAttribute('opacity', lampOn * 0.6);
  // lessons (pure functions of time)
  rooms[0].update(T, T); rooms[1].update(T - START[1], T); rooms[2].update(T - START[2], T);
  // overlays
  const idx = T < 6 ? 0 : T < 13 ? 1 : 2, fin = clamp((T - 20.2) / 0.7, 0, 1);
  $('tagT').textContent = LAB[holdSeg !== null ? holdSeg : idx]; $('tag').style.opacity = 1 - fin;
  const cap = $('cap');
  if (holdSeg !== null) { cap.textContent = DESC[holdSeg]; cap.style.opacity = 1; }
  else {
    cap.textContent = SUB[idx];
    const s = [0.6, 7.0, 14.0][idx], e = [5.5, 12.5, 19.6][idx];
    cap.style.opacity = T >= 20 ? 0 : clamp((T - s) / 0.4, 0, 1) * (1 - clamp((T - e) / 0.4, 0, 1));
  }
  $('scrim').style.opacity = fin; $('fin').style.opacity = fin;
  $('rng').value = T; $('tm').textContent = `0:${String(Math.floor(T)).padStart(2, '0')} / 0:22`;
  $('pp').textContent = ended ? '↻' : playing ? '⏸' : '▶';
  winEls.forEach((w, i) => w.classList.toggle('sel', holdSeg === i));
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000); last = now;
  if (playing || holdSeg !== null) {
    T += dt;
    if (holdSeg !== null) { if (T > STABLE[holdSeg][1]) T = JUMP[holdSeg]; }
    else if (T >= TOTAL) { T = TOTAL; playing = false; ended = true; }
  }
  render(); requestAnimationFrame(frame);
}
function selectWin(i) { holdSeg = i; playing = false; ended = false; T = JUMP[i]; render(); }
$('pp').addEventListener('click', () => {
  if (ended || T >= TOTAL) { T = 0; ended = false; playing = true; holdSeg = null; }
  else if (playing) { playing = false; holdSeg = null; }
  else { playing = true; holdSeg = null; }
  render();
});
$('rng').addEventListener('input', (e) => { T = parseFloat(e.target.value); holdSeg = null; ended = false; if (T >= TOTAL) { ended = true; playing = false; } render(); });
document.addEventListener('keydown', (e) => { if (e.key === 'h' || e.key === 'H') document.body.classList.toggle('clean'); if (e.key === ' ' && e.target === document.body) { e.preventDefault(); $('pp').click(); } });
$('hide').addEventListener('click', () => document.body.classList.add('clean'));
$('uihit').addEventListener('click', () => document.body.classList.remove('clean'));
if (/clean/.test(location.search + location.hash)) document.body.classList.add('clean');
window.setT = (t) => { T = t; holdSeg = null; playing = false; ended = false; render(); };
render(); requestAnimationFrame(frame);
