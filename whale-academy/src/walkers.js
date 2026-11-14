// Pedestrians on the shallow sidewalk. Position and gait are pure functions of T, so scrubbing the slider is exact.
// Walking uses the library's gait(): planted feet stay planted, no sine bobbing.
import { gait } from '../lib/gait.ts';
import { makeFigure } from './people.js';
import { colored } from './arch.js';

const walk = gait({ kind: 'walk' }), shuffle = gait({ kind: 'shuffle' });
const DEFS = [
  { coat: '#2f4a7a', trouser: '#3b4250', hair: 'bun', long: true, s: 0.54, dir: 1, x0: 120, y: 450, g: walk },
  { coat: '#8a5a3c', trouser: '#2f3340', hair: 'short', s: 0.56, dir: -1, x0: 830, y: 462, g: walk },
  { coat: '#4f7a7e', trouser: '#3b4250', hair: 'bob', long: true, s: 0.52, dir: 1, x0: 540, y: 470, g: walk },
  { coat: '#c79a3b', trouser: '#4a4250', hair: 'short', child: true, s: 0.4, dir: -1, x0: 400, y: 448, g: walk },
  { coat: '#b3604f', trouser: '#4a4250', hair: 'bun', child: true, s: 0.38, dir: -1, x0: 430, y: 452, g: walk },
  { coat: '#8a8a93', trouser: '#555a66', hair: 'short', long: true, s: 0.5, dir: -1, x0: 250, y: 464, g: shuffle },
  { coat: '#3a3f6a', trouser: '#2a2d40', hair: 'short', s: 0.55, dir: 1, x0: 700, y: 446, g: walk },
  { coat: '#4a7a5a', trouser: '#3b4250', hair: 'bob', s: 0.5, dir: 1, x0: 880, y: 472, g: walk },
];

export function buildWalkers(parent, glowRegister) {
  const list = DEFS.map((d, i) => {
    const fig = makeFigure(parent, { coat: d.coat, hair: d.hair, long: d.long, child: d.child, legs: true, trouser: d.trouser });
    fig.nodes.clothes.forEach((n) => colored(n, d.coat));
    fig.nodes.legs.forEach((n) => colored(n, d.trouser));
    return { d, fig, ph: i * 0.37 };
  });
  return {
    update(T) {
      list.forEach(({ d, fig, ph }) => {
        const gt = d.g, v = gt.speed * d.s, range = 1100;
        const x = (((d.x0 + d.dir * v * T + 70) % range) + range) % range - 70;
        const phase = T / gt.period + ph, pose = gt.pose(phase);
        fig.place(x, d.y, d.dir, d.s);
        const sw = Math.sin(phase * 2 * Math.PI) * 7;
        fig.draw({ lean: 1.5, tilt: 0, bob: pose.bob, hF: [43 + sw, 83], hB: [39 - sw, 83], feet: pose.feet.map((f) => ({ ankle: f.ankle, knee: f.knee, pitch: f.pitch })) });
      });
    },
  };
}
