// Faceless line-art figures built from the ink library's open double-stroke limbs.
// Each figure lives in figure space (~95 units tall, feet on y = 120, facing +x, centred on x = 40).
import { el, pen, shape, blot, limb, solid, joint, shoe, place, PEN } from '../lib/ink.ts';
import { rgb, toRGB, mix } from '../lib/daynight.ts';

const RAD = Math.PI / 180;
const SKIN = '#f1dcc3';
const SHORT = 'M36 44 Q34 52 35 62 L36 84 L46.6 84 L47.4 62 Q47 51 45 44 Q40.5 41 36 44Z';
const LONG = 'M36 44 Q34 52 35 70 L33.4 101 L48.6 101 L47.4 70 Q47 52 45 44 Q40.5 41 36 44Z';
const HAIR = {
  bun: 'M36.4 31 Q35.4 23.6 41 22.6 Q46.4 22.4 46 28.6 Q43.2 25.6 39.8 27 Q37.8 28.4 36.4 31Z M34.2 28.4 a3 3 0 1 0 6 0 a3 3 0 1 0 -6 0Z',
  short: 'M35.4 33 Q34 23 41 21.6 Q48.4 21.6 47.6 29 Q43.6 25.2 40 26.8 Q37.4 28.4 36.8 34Z',
  bob: 'M35.2 36 Q33.6 23.4 41 21.8 Q48.6 22 47.6 29.4 Q43.4 25 39.6 27 Q37.2 29 37.4 36.6Z',
};

/** Convert a window-local point into the figure's own space (inverse of place()). */
export const toFig = (px, py, X, Y, dir, s) => [40 + (px - X) / (dir * s), 120 + (py - Y) / s];

const reachTo = (s, t, max) => {
  const dx = t[0] - s[0], dy = t[1] - s[1], d = Math.hypot(dx, dy) || 1;
  const k = Math.min(1, (max - 0.05) / d);
  return [s[0] + dx * k, s[1] + dy * k];
};

/**
 * o: { coat, hair: 'bun'|'short'|'bob', long, legs, child, trouser }
 * draw({ lean, tilt, hF, hB, point }) — hF/hB are hand targets in figure space (clamped to arm length).
 */
export function makeFigure(parent, o) {
  const g = el('g', {}, parent);
  const L1 = 20.5, L2 = 20.5;
  const coat = o.coat;
  let legs = null;
  if (o.legs) {
    legs = [0, 1].map(() => ({ l: solid(limb(g, 4.2), o.trouser || '#444a58'), shoe: blot(g) }));
  }
  const armB = solid(limb(g, 3.6), coat);
  const handB = el('ellipse', { rx: 1.8, ry: 1.5, fill: SKIN, stroke: 'currentColor', 'stroke-width': PEN * 0.7 }, g);
  const upper = el('g', {}, g);
  const torso = el('path', { d: o.long ? LONG : SHORT, fill: coat, stroke: 'currentColor', 'stroke-width': PEN, 'stroke-linejoin': 'round' }, upper);
  const neck = limb(upper, 3.2); neck.draw([[40.6, 44], [40.8, 37]], [0.2, 0.2]);
  const head = el('g', {}, upper);
  el('ellipse', { cx: 41, cy: o.child ? 33 : 32, rx: o.child ? 5.5 : 4.2, ry: o.child ? 6.3 : 5.1, fill: SKIN, stroke: 'currentColor', 'stroke-width': PEN }, head);
  blot(head).setAttribute('d', HAIR[o.hair || 'short']);
  const armF = solid(limb(g, 3.6), coat);
  const handF = el('ellipse', { rx: 1.8, ry: 1.5, fill: SKIN, stroke: 'currentColor', 'stroke-width': PEN * 0.7 }, g);
  const finger = pen(g, PEN * 0.8);
  const clothes = [torso, armB.g.querySelector('path'), armF.g.querySelector('path')];

  return {
    g, place: (X, Y, dir = 1, s = 0.5) => { place(g, X, Y, dir, s); },
    tint(c) { torso.setAttribute('fill', c); clothes[1].setAttribute('fill', c); clothes[2].setAttribute('fill', c); },
    draw({ lean = 0, tilt = 0, hF = null, hB = null, point = false }) {
      const a = lean * RAD, ca = Math.cos(a), sa = Math.sin(a);
      const rot = (p) => { const dx = p[0] - 40, dy = p[1] - 72; return [40 + dx * ca - dy * sa, 72 + dx * sa + dy * ca]; };
      upper.setAttribute('transform', `rotate(${lean.toFixed(2)} 40 72)`);
      head.setAttribute('transform', `rotate(${tilt.toFixed(2)} 40.7 40)`);
      const sF = rot([42.2, 47.5]), sB = rot([38.4, 47.5]);
      const rest = (s, dx) => [s[0] + dx, s[1] + 35];
      const tF = reachTo(sF, hF || rest(sF, 2.4), L1 + L2), tB = reachTo(sB, hB || rest(sB, -1.2), L1 + L2);
      const eF = joint(sF, tF, L1, L2, -1), eB = joint(sB, tB, L1, L2, -1);
      armF.draw([sF, eF, tF], [0.5, 1.2]); armB.draw([sB, eB, tB], [0.5, 1.2]);
      handF.setAttribute('cx', tF[0]); handF.setAttribute('cy', tF[1]); handB.setAttribute('cx', tB[0]); handB.setAttribute('cy', tB[1]);
      if (point) { const dx = tF[0] - eF[0], dy = tF[1] - eF[1], l = Math.hypot(dx, dy) || 1; finger.setAttribute('d', `M${tF[0]} ${tF[1]} l${(dx / l * 3.6).toFixed(2)} ${(dy / l * 3.6).toFixed(2)}`); }
      else finger.setAttribute('d', '');
      if (legs) {
        const hip = [40, 72];
        [[37.5, 118.4], [43.5, 118.4]].forEach((ank, i) => {
          legs[i].l.draw([hip, joint(hip, ank, 23, 23, 1), ank], [0.4, 0.4]);
          shoe(legs[i].shoe, ank, 0);
        });
      }
      return { sF, tF };
    },
  };
}
