// Trace des câbles sous-marins sur la grille de navigation fine (version 46).
// Chaque câble relie deux points d'atterrissage (ports du théâtre) par la mer, comme un navire.
// Usage : node tools/cables.js  (après python3 proto/build.py) ; écrit proto/th/cables.json
const { chromium } = require('playwright'), fs = require('fs'), path = require('path');
const ENDS = {
  natl: { L1: ['Lerwick', 'Bergen'], L2: ['Torshavn', 'Lerwick'], L3: ['Reykjavik', 'Torshavn'], L4: ['Bodo', 'Tromso'], L5: ['Aberdeen', 'Stavanger'] },
  gn: { L1: ['Lagos', 'Tema'], L2: ['Lagos', 'Malabo'], L3: ['Abidjan', 'Tema'], L4: ['Malabo', 'Libreville'], L5: ['SaoTome', 'Libreville'] },
  ad: { L1: ['Djibouti', 'Aden'], L2: ['Djibouti', 'Jeddah'], L3: ['Jeddah', 'PortSudan'], L4: ['Aden', 'Salalah'], L5: ['Berbera', 'Bosaso'] },
  em: { L1: ['Heraklion', 'Alexandrie'], L2: ['Heraklion', 'Limassol'], L3: ['Limassol', 'PortSaid'], L4: ['Piree', 'Heraklion'], L5: ['Antalya', 'Limassol'] },
  ml: { L1: ['Singapour', 'PortKlang'], L2: ['PortKlang', 'Penang'], L3: ['Penang', 'Phuket'], L4: ['Singapour', 'Kuantan'], L5: ['Singapour', 'Pontianak'] },
};
(async () => {
  const root = path.join(__dirname, '..'), b = await chromium.launch(), p = await b.newPage();
  await p.route(/fonts\.g/, r => r.abort()); await p.goto('file://' + root + '/proto/t.html'); await p.waitForTimeout(800);
  const out = await p.evaluate(ENDS => {
    const res = {}, rd = v => Math.round(v * 10) / 10;
    // segment en mer, sauf près des points d'atterrissage (le câble y traverse la côte)
    const segOk = (a, b, A, B, m = 0) => { const n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / .4); for (let i = 0; i <= n; i++) { const x = a[0] + (b[0] - a[0]) * i / n, y = a[1] + (b[1] - a[1]) * i / n; if (Math.hypot(x - A[0], y - A[1]) < 9 || Math.hypot(x - B[0], y - B[1]) < 9) continue; if ([[0, 0], [m, 0], [-m, 0], [0, m], [0, -m]].some(([dx, dy]) => !seaAt(x + dx, y + dy))) return false } return true };
    const lineOk = (P) => P.every((q, i) => !i || segOk(P[i - 1], q, P[0], P[P.length - 1]));
    const chaikin = P => { const Q = [P[0]]; for (let i = 0; i < P.length - 1; i++) { const a = P[i], b = P[i + 1]; if (i) Q.push([a[0] * .75 + b[0] * .25, a[1] * .75 + b[1] * .25]); if (i < P.length - 2) Q.push([a[0] * .25 + b[0] * .75, a[1] * .25 + b[1] * .75]) } Q.push(P[P.length - 1]); return Q };
    for (const th in ENDS) {
      useTheatre(th); res[th] = {};
      for (const id in ENDS[th]) {
        const [na, nb] = ENDS[th][id], A = P[na], B = P[nb];
        const r = route(A[0], A[1], B[0], B[1]).map(q => [q.x, q.y]).filter(q => Math.hypot(q[0] - A[0], q[1] - A[1]) > 4 && Math.hypot(q[0] - B[0], q[1] - B[1]) > 4);
        const raw = [A, ...r, B];
        // fil tendu : on garde le point le plus lointain visible par la mer (supprime crochets et zigzags)
        let pts = [A]; for (let i = 0; i < raw.length - 1;) { let j = raw.length - 1; while (j > i + 1 && !segOk(raw[i], raw[j], A, B, 1.5)) j--; if (j === i + 1) { j = raw.length - 1; while (j > i + 1 && !segOk(raw[i], raw[j], A, B)) j-- } pts.push(raw[j]); i = j }
        for (let k = 0; k < 3; k++) { const s = chaikin(pts); if (lineOk(s)) pts = s; else break }
        res[th][id] = { from: na, to: nb, ok: lineOk(pts), pts: pts.map(q => [rd(q[0]), rd(q[1])]) };
      }
    }
    return res;
  }, ENDS);
  fs.writeFileSync(path.join(root, 'proto/th/cables.json'), JSON.stringify(out));
  for (const th in out) for (const id in out[th]) console.log(th, id, out[th][id].from, '→', out[th][id].to, out[th][id].pts.length, 'points', out[th][id].ok ? 'en mer' : 'TERRE');
  await b.close();
})();
