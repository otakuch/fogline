// Compare : rien, conseil seul en guidé, référence en guidé, référence en complet. Usage : node advbot.js [seeds]
const { chromium } = require('playwright'), fs = require('fs');
(async () => { const b = await chromium.launch(), p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
 await p.goto('file://' + __dirname + '/t.html'); await p.addScriptTag({ path: __dirname + '/bots.js' }); await p.waitForTimeout(300);
 const r = await p.evaluate((N) => { const A = __S, ids = Object.keys(A.SC).filter(k => !A.SC[k].tuto), out = {}, leak = [];
  const run = (nm, cfg, pol) => { const t = { s: 0, ok: 0, st: 0, se1: 0, fe: 0, n: 0, by: {} }; for (const sc of ids) { let bs = 0; for (let i = 1; i <= N; i++) { const g = playGame(i * 97 + 3, sc, cfg, pol ? pol() : null); t.s += g.s; t.ok += g.ok; t.st += g.st; t.se1 += g.se1; t.fe += g.fe; t.n++; bs += g.ok } t.by[sc] = bs } out[nm] = { s: Math.round(t.s / t.n), ok: Math.round(100 * t.ok / t.n), st: +(t.st / t.n).toFixed(2), seuil1: Math.round(100 * t.se1 / t.n), faux: +(t.fe / t.n).toFixed(2), zero: Object.keys(t.by).filter(k => !t.by[k]).join(' ') } };
  run('rien_guide', { contested: true, guided: true }, null);
  run('conseil_guide', { contested: true, guided: true, esc: true }, () => mkAdvisor());
  run('conseil_complet', { contested: true, esc: true }, () => mkAdvisor());
  run('ref_guide', { contested: true, guided: true }, () => mkBot({}));
  run('ref_complet', { contested: true }, () => mkBot({}));
  return out }, +process.argv[2] || 3);
 console.log(JSON.stringify(r, null, 0).replace(/},/g, '},\n')); console.log('ERREURS', errs.slice(0, 5)); await b.close() })();
