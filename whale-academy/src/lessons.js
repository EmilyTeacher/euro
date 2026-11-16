// The three classroom windows. Each is a pure function of lesson time u (seconds), so the
// slider can scrub anywhere. Window-local space: 110 × 118, floor at y = 100, desk top near y = 78.
import { el, pen, blot, PEN } from '../lib/ink.ts';
import { makeFigure, toFig } from './people.js';
import { P as Pn, S as Sh, B as Bl, rect, oval, lerp, clamp, ease, text } from './arch.js';

const ACC = '#b8704a', PAPERY = '#fbf6ea', WOOD = '#dcc7a5';
const seg = (u, a, b) => clamp((u - a) / (b - a), 0, 1);
const lp = (p, q, k) => [lerp(p[0], q[0], k), lerp(p[1], q[1], k)];
const flat = (g, d, fill, w = 0.7) => el('path', { d, fill, stroke: 'currentColor', 'stroke-width': w, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, g);

function room(g) {
  const wall = el('rect', { x: 0, y: 0, width: 110, height: 118 }, g);
  const floor = el('rect', { x: 0, y: 100, width: 110, height: 18, fill: 'currentColor', opacity: 0.1 }, g);
  Pn(g, 'M0 100 H110 M0 107 H110 M0 113.5 H110', 0.5);
  return wall;
}
function desk(g, x0, x1, top) {
  flat(g, `M${x0} ${top} L${x1} ${top} L${x1} ${top + 4} L${x0} ${top + 4}Z`, WOOD, 0.8);
  flat(g, `M${x0 + 4} ${top + 4} L${x1 - 4} ${top + 4} L${x1 - 4} ${top + 10} L${x0 + 4} ${top + 10}Z`, WOOD, 0.6);
  Pn(g, `M${x0 + 6} ${top + 10} V100 M${x1 - 6} ${top + 10} V100`, 0.8);
}

/* ---------------------------------------------------------------- 2:15  phonics */
export function buildPhonics(parent) {
  const g = el('g', {}, parent);
  const wall = room(g);
  // wall poster: a cat (the word the cards spell)
  flat(g, rect(10, 14, 40, 46), PAPERY, 0.7);
  Pn(g, 'M18 40 Q25 34 32 40', 0.6);
  Pn(g, 'M18.5 29 q-1.5 -9 3 -7.5 l3 3 M31.5 29 q1.5 -9 -3 -7.5 l-3 3 M17.5 30 Q17 38 25 38 Q33 38 32.5 30 Q32 25 25 25 Q18 25 17.5 30Z', 0.7);
  Bl(g, oval(22, 31, 0.9, 1.2)); Bl(g, oval(28, 31, 0.9, 1.2));
  Pn(g, 'M24 34 l1 1 l1 -1 M17 33 l-4 -1 M17 35 l-4 1.5 M33 33 l4 -1 M33 35 l4 1.5', 0.45);
  const teacher = makeFigure(g, { coat: '#4f7a7e', hair: 'bun', long: true, legs: true, trouser: '#3b4250' });
  const child = makeFigure(g, { coat: '#d1ab55', hair: 'short', child: true });
  const TX = 28, TY = 100, TS = 0.68, CX = 92, CY = 78 + 0.5 * 48, CS = 0.5;
  teacher.place(TX, TY, 1, TS); child.place(CX, CY, -1, CS);
  desk(g, 44, 106, 78);
  // cards stand on the desk
  const SX = [52, 63, 74], LET = ['c', 'a', 't'], COL = ['#b8704a', '#3f6a73', '#b08a34'];
  const cards = LET.map((ch, k) => {
    const c = el('g', {}, g);
    const bg = flat(c, rect(-5.4, -14, 5.4, 0), PAPERY, 0.8);
    const t = text(c, 0, -6.2, ch, 11.5, { family: 'Georgia,"Times New Roman",serif', weight: 800 }); t.setAttribute('fill', COL[k]);
    return { c, bg };
  });
  const arc = Pn(g, 'M47.5 62 Q63 50.5 78.5 62', 0.9); arc.setAttribute('stroke', ACC);
  const tk = [0.8, 1.7, 2.6], pk = [3.0, 3.7, 4.4];
  const HR = [44, 72], RC = [88, 73];
  return {
    root: g, wall,
    update(u) {
      // teacher: carries each card from her hand to its slot, then comes back
      let hand = HR, carry = -1;
      for (let k = 0; k < 3; k++) {
        const tgt = [SX[k] - 3.6, 66];
        if (u >= tk[k] - 0.6 && u < tk[k]) { const s = ease(seg(u, tk[k] - 0.6, tk[k])); hand = lp(HR, tgt, s); hand[1] -= 5 * Math.sin(Math.PI * s); carry = k; }
        else if (u >= tk[k] && u < tk[k] + 0.45) hand = lp(tgt, HR, ease(seg(u, tk[k], tk[k] + 0.45)));
      }
      const far = clamp((hand[0] - 44) / 26, 0, 1);
      teacher.draw({ lean: 5 + 13 * far, tilt: 8, hF: toFig(hand[0], hand[1], TX, TY, 1, TS) });
      // child: points at c, a, t in turn
      let fing = RC, pointing = false, which = -1;
      for (let k = 0; k < 3; k++) if (u >= pk[k] && u < pk[k] + 0.7) { which = k; pointing = true; fing = lp(k ? [SX[k - 1], 58] : RC, [SX[k], 58], ease(seg(u, pk[k], pk[k] + 0.22))); }
      if (u >= pk[2] + 0.7) { pointing = true; fing = [SX[2], 58]; }
      child.draw({ lean: pointing ? 9 : 2, tilt: 6, hF: toFig(fing[0], fing[1], CX, CY, -1, CS), point: pointing });
      cards.forEach((cd, k) => {
        let x = SX[k], y = 78, op = 1;
        if (u < tk[k] - 0.6) op = 0;
        else if (u < tk[k]) { x = hand[0] + 3.6; y = hand[1] + 7; }
        const hl = which === k ? 1 : 0;
        const lift = ease(seg(u, 4.9, 5.3)) * 1.2;
        cd.c.setAttribute('transform', `translate(${x.toFixed(2)} ${(y - lift).toFixed(2)})`); cd.c.setAttribute('opacity', op);
        cd.bg.setAttribute('stroke-width', hl ? 1.5 : 0.8); cd.bg.setAttribute('stroke', hl ? ACC : 'currentColor');
      });
      arc.setAttribute('opacity', seg(u, 4.8, 5.3));
    },
  };
}

/* ---------------------------------------------------------------- 5:10  English newspaper */
export function buildNews(parent) {
  const g = el('g', {}, parent);
  const wall = room(g);
  // framed picture (a whale, of course)
  flat(g, rect(8, 12, 32, 38), PAPERY, 0.7);
  Pn(g, 'M12 28 Q14 20 22 21 Q28 22 29 26 Q31 24 30 22 M13 30 Q20 33 28 29', 0.6);
  // the newspaper, standing on the desk
  const sheet = flat(g, rect(64, 46, 92, 80), PAPERY, 0.8);
  flat(g, rect(67, 49, 89, 55.5), 'currentColor', 0.4);
  const lines = []; for (let i = 0; i < 5; i++) lines.push(`M67 ${59.5 + i * 4.3} H89`);
  Pn(g, lines.join(' '), 0.5);
  const under = Pn(g, 'M67 70.2 H67', 1.3); under.setAttribute('stroke', ACC);
  const child = makeFigure(g, { coat: '#c98a7c', hair: 'bob', child: false });
  const CX = 50, CS = 0.5, CY = 80 + CS * 48;
  child.place(CX, CY, 1, CS);
  desk(g, 4, 108, 78);
  // the sentence, spoken
  const bub = el('g', {}, g);
  flat(bub, 'M32 8 H70 Q76 8 76 14 V26 Q76 32 70 32 H44 L38 40 L38 32 H32 Q26 32 26 26 V14 Q26 8 32 8Z', PAPERY, 0.8);
  const sq = Pn(bub, 'M32 20 q3 -5 6 0 t6 0 t6 0 t6 0 t6 0', 0.8); sq.setAttribute('stroke', ACC);
  return {
    root: g, wall,
    update(u, T) {
      const REST = [46, 76];
      const k1 = ease(seg(u, 1.0, 3.4));
      let fing = lp(REST, [67, 67.5], ease(seg(u, 0.4, 1.0)));
      if (u >= 1.0) fing = [lerp(67, 78, k1), 67.5];
      if (u >= 3.5) fing = lp([78, 67.5], REST, ease(seg(u, 3.5, 4.0)));
      const reading = u < 3.6 && u > .2;
      const lift = ease(seg(u, 3.7, 4.3));
      child.draw({ lean: reading ? 8 : lerp(8, 1, lift), tilt: lerp(reading ? 14 : 14, -4, lift) + Math.sin(T * 1.7) * 0.5, hF: toFig(fing[0], fing[1], CX, CY, 1, CS), point: reading });
      under.setAttribute('d', `M67 70.2 H${(67 + (fing[0] - 67) * (u < 3.6 ? 1 : 0)).toFixed(2)}`);
      if (u >= 3.5) under.setAttribute('d', 'M67 70.2 H78');
      bub.setAttribute('opacity', seg(u, 4.4, 4.9));
      bub.setAttribute('transform', `translate(8 ${8 + (1 - ease(seg(u, 4.4, 4.9))) * 3})`);
    },
  };
}

/* ---------------------------------------------------------------- 7:30  middle/high school reading */
export function buildReading(parent) {
  const g = el('g', {}, parent);
  const wall = room(g);
  // wall chart
  flat(g, rect(8, 14, 32, 40), PAPERY, 0.7); Pn(g, 'M12 20 H28 M12 25 H28 M12 30 H24 M12 35 H26', 0.45);
  // passage + answer row, standing on the desk
  flat(g, rect(46, 38, 72, 80), PAPERY, 0.8);
  const ls = []; for (let i = 0; i < 7; i++) ls.push(`M49.5 ${44.5 + i * 3.9} H${i === 6 ? 62 : 68.5}`);
  const hl = el('rect', { x: 49.5, y: 54.2, width: 0, height: 3.8, fill: '#efd070', opacity: 0.9 }, g);
  Pn(g, ls.join(' '), 0.5);
  const dots = [52, 58, 64, 70].map((x, i) => { const c = el('circle', { cx: x - 1, cy: 77, r: 1.7, fill: PAPERY, stroke: 'currentColor', 'stroke-width': 0.6 }, g); return c; });
  const pick = el('circle', { cx: 57, cy: 77, r: 1.1, fill: 'currentColor', opacity: 0 }, g);
  const check = Pn(g, 'M39 48 l2.6 2.8 l5 -6.4', 1.3); check.setAttribute('stroke', ACC);
  const student = makeFigure(g, { coat: '#7b86a8', hair: 'short', child: false });
  const teacher = makeFigure(g, { coat: '#4f7a7e', hair: 'bun', long: true, legs: true, trouser: '#3b4250' });
  const SX = 40, SS = 0.5, SY = 80 + SS * 48, TX = 94, TY = 100, TS = 0.68;
  student.place(SX, SY, 1, SS); teacher.place(TX, TY, -1, TS);
  desk(g, 4, 84, 78);
  return {
    root: g, wall,
    update(u, T) {
      const REST = [44, 76], ANS = [57, 76.5], HS = [50, 56], HE = [63, 56];
      let pen_ = REST;
      if (u < 1.3) pen_ = lp(REST, ANS, ease(seg(u, 0.4, 0.85)));
      else if (u < 1.9) pen_ = lp(ANS, HS, ease(seg(u, 1.3, 1.8)));
      else if (u < 3.3) pen_ = lp(HS, HE, ease(seg(u, 1.9, 3.3)));
      else pen_ = lp(HE, REST, ease(seg(u, 3.4, 3.9)));
      const writing = u > 0.3 && u < 3.4;
      student.draw({ lean: writing ? 9 : 2, tilt: writing ? 14 : 4 + Math.sin(T * 1.5) * 0.6, hF: toFig(pen_[0], pen_[1], SX, SY, 1, SS), point: false });
      pick.setAttribute('opacity', seg(u, 0.85, 1.15));
      const k = ease(seg(u, 1.9, 3.3));
      hl.setAttribute('width', (14 * k).toFixed(2));
      const tp = ease(seg(u, 3.7, 4.4));
      const tgt = lp([TX - 8, 76], [66, 58.5], tp);
      teacher.draw({ lean: lerp(2, 8, tp), tilt: lerp(4, 8, tp), hF: toFig(tgt[0], tgt[1], TX, TY, -1, TS), point: tp > 0.3 });
      check.setAttribute('opacity', seg(u, 4.7, 5.1));
    },
  };
}
