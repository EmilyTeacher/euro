// Bundles src/ + lib/ into one self-contained ../whale-academy.html (no network, no server).
import { build } from 'esbuild';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const here = import.meta.dirname;
const r = await build({ entryPoints: [resolve(here, 'src/main.js')], bundle: true, minify: true, format: 'iife', target: 'es2020', write: false });
const js = r.outputFiles[0].text.replace(/<\/script>/g, '<\\/script>');
const html = readFileSync(resolve(here, 'template.html'), 'utf8').replace('/*__BUNDLE__*/', () => js);
writeFileSync(resolve(here, '../whale-academy.html'), html);
console.log(`whale-academy.html  ${(html.length / 1024).toFixed(0)} KB`);
