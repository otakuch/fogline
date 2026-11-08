// Projection orthographique par théâtre : départ sur les ports, puis carte de distance aux côtes du jeu (vec.json).
const fs = require('fs'), path = require('path'), G = path.resolve('../geo/node_modules') + '/', P = '../src/seuil-fogline/proto/';
const d3 = require(G + 'd3-geo'), topo = require(G + 'topojson-client');
const T = JSON.parse(fs.readFileSync('../geo/wa/package/land-10m.json')), NE = topo.feature(T, T.objects.land);
const VEC = JSON.parse(fs.readFileSync(P + 'th/vec.json')), TP = JSON.parse(fs.readFileSync(P + 'th/theatres.json')), geo = JSON.parse(fs.readFileSync(P + 'geo.json')), PL = JSON.parse(fs.readFileSync('places.json'));
const nev = []; NE.features.forEach(f => f.geometry.coordinates.forEach(po => po.forEach(r => r.forEach(q => nev.push(q)))));
const FAM = process.env.FAM || 'geoOrthographic', mk = p => { const P = d3[FAM]().rotate([p[0], FAM === 'geoMercator' || FAM === 'geoEquirectangular' ? 0 : p[1], 0]).scale(p[2]).translate([p[3], p[4]]); return FAM === 'geoMercator' || FAM === 'geoEquirectangular' ? P.center([0, -p[1]]) : P };
function nm(err, x0, steps, it) { let S = [x0.slice()]; for (let i = 0; i < x0.length; i++) { const x = x0.slice(); x[i] += steps[i]; S.push(x) } let F = S.map(err); for (let n = 0; n < it; n++) { const o = F.map((v, i) => i).sort((a, b) => F[a] - F[b]); S = o.map(i => S[i]); F = o.map(i => F[i]); const c = S[0].map((_, j) => S.slice(0, -1).reduce((a, x) => a + x[j], 0) / (S.length - 1)), w = S[S.length - 1], r = c.map((v, j) => v + (v - w[j])), fr = err(r); if (fr < F[0]) { const e = c.map((v, j) => v + 2 * (v - w[j])), fe = err(e); if (fe < fr) { S[S.length - 1] = e; F[F.length - 1] = fe } else { S[S.length - 1] = r; F[F.length - 1] = fr } } else if (fr < F[F.length - 2]) { S[S.length - 1] = r; F[F.length - 1] = fr } else { const cc = c.map((v, j) => v + .5 * (w[j] - v)), fc = err(cc); if (fc < F[F.length - 1]) { S[S.length - 1] = cc; F[F.length - 1] = fc } else { for (let i = 1; i < S.length; i++) { S[i] = S[i].map((v, j) => S[0][j] + .5 * (v - S[0][j])); F[i] = err(S[i]) } } } } return [S[0], F[0]] }
const RS = 4, GW = 1440 * RS, GH = 900 * RS;
function dmap(th) { const D = new Float32Array(GW * GH).fill(1e6); const put = (x, y) => { const i = Math.round(x * RS), j = Math.round(y * RS); if (i >= 0 && j >= 0 && i < GW && j < GH) D[j * GW + i] = 0 };
 VEC[th].land.forEach(po => po.forEach(r => { let x = 0, y = 0, pv = null; for (let i = 0; i < r.length; i += 2) { x += r[i]; y += r[i + 1]; const q = [x / 10, y / 10]; if (pv) { const n = Math.ceil(Math.hypot(q[0] - pv[0], q[1] - pv[1]) * RS * 2) + 1; for (let k = 0; k <= n; k++) put(pv[0] + (q[0] - pv[0]) * k / n, pv[1] + (q[1] - pv[1]) * k / n) } pv = q } }));
 const a = 1, b = Math.SQRT2; for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) { const k = j * GW + i; let v = D[k]; if (i) v = Math.min(v, D[k - 1] + a); if (j) { v = Math.min(v, D[k - GW] + a); if (i) v = Math.min(v, D[k - GW - 1] + b); if (i < GW - 1) v = Math.min(v, D[k - GW + 1] + b) } D[k] = v }
 for (let j = GH - 1; j >= 0; j--) for (let i = GW - 1; i >= 0; i--) { const k = j * GW + i; let v = D[k]; if (i < GW - 1) v = Math.min(v, D[k + 1] + a); if (j < GH - 1) { v = Math.min(v, D[k + GW] + a); if (i < GW - 1) v = Math.min(v, D[k + GW + 1] + b); if (i) v = Math.min(v, D[k + GW - 1] + b) } D[k] = v }
 return D }
const out = {};
for (const th of (process.argv[2] ? process.argv[2].split(',') : Object.keys(PL))) {
 const places = th === 'natl' ? geo.places : TP[th].places, names = Object.keys(PL[th]).filter(n => places[n]);
 const c = names.map(n => PL[th][n]), lo = c.reduce((a, q) => a + q[0], 0) / c.length, la = c.reduce((a, q) => a + q[1], 0) / c.length;
 const e1 = p => names.reduce((s, n) => { const q = mk(p)(PL[th][n]); return s + Math.min((q[0] - places[n][0]) ** 2 + (q[1] - places[n][1]) ** 2, 2500) }, 0);
 let [p] = process.env.INIT ? [JSON.parse(process.env.INIT)] : nm(e1, [-lo, -la, 2000, 720, 450], [3, 3, 200, 40, 40], 2000);
 const D = dmap(th), loc = nev.filter(q => Math.abs(q[0] - lo) < 50 && Math.abs(q[1] - la) < 30), samp = loc.filter((_, i) => i % Math.max(1, Math.floor(loc.length / 25000)) === 0);
 const cost = (p, cap) => { const P = mk(p); let s = 0, n = 0; for (const q of samp) { const z = P(q); if (!z) continue; const i = Math.round(z[0] * RS), j = Math.round(z[1] * RS); if (i < 0 || j < 0 || i >= GW || j >= GH) continue; s += Math.min(D[j * GW + i] / RS, cap) ** 2; n++ } return n < 200 ? 1e9 : s / n };
 for (const cap of [40, 15, 6, 2, 1]) [p] = nm(q => cost(q, cap), p, [0.5, 0.5, 30, 5, 5].map(v => v * cap / 40 + v * .05), 400);
 const P_ = mk(p), ds = []; for (const q of samp) { const z = P_(q), i = Math.round(z[0] * RS), j = Math.round(z[1] * RS); if (i >= 0 && j >= 0 && i < GW && j < GH) ds.push(D[j * GW + i] / RS) } ds.sort((a, b) => a - b);
 out[th] = { fam: FAM, p }; console.log(FAM, th, p.map(v => +v.toFixed(4)).join(' '), 'n', ds.length, 'med', ds[ds.length >> 1].toFixed(3), 'p90', ds[Math.floor(ds.length * .9)].toFixed(3));
}
const old = fs.existsSync(process.env.OUT || 'fam.json') ? JSON.parse(fs.readFileSync(process.env.OUT || 'fam.json')) : {}; fs.writeFileSync(process.env.OUT || 'fam.json', JSON.stringify({ ...old, ...out }));
