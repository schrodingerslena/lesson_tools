import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
test('landing links, Brawl Math shell and runtime imports resolve',()=>{for(const name of ['index.html','brawl-math/index.html','brawl-math/app.mjs','brawl-math/math.mjs','brawl-math/brawlers.mjs']){const source=readFileSync(resolve(root,name),'utf8');const links=name.endsWith('.html')?[...source.matchAll(/(?:href|src)="([^"#]+)"/g)].map(m=>m[1]):[...source.matchAll(/from '([^']+)'/g)].map(m=>m[1]);for(const link of links){if(/^(?:https?:|data:)/.test(link))continue;assert.ok(existsSync(resolve(root,dirname(name),link.split('?')[0])),`${name}: ${link}`);}}const home=readFileSync(resolve(root,'index.html'),'utf8');assert.ok(home.includes('./geometry/'));assert.ok(home.includes('./variation/'));assert.ok(home.indexOf('./brawl-math/')>home.indexOf('id="s5"'));});
