// Mesure v48 : référence, omniscient et aucun ordre, avec les compteurs de présomption, de relèvement et de variante.
// Usage : node v48m.js <page.html> c1,f2 [parties] ; OFF=1000 change les tirages ; NOVAR=1 joue le script complet sans tirage.
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(), p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
 await p.goto('file://' + __dirname + '/' + process.argv[2]); await p.addScriptTag({ path: __dirname + '/bots.js' }); await p.waitForTimeout(300);
 const ids = process.argv[3] === 'all' ? await p.evaluate(() => Object.keys(__S.SC).filter(k => !__S.SC[k].tuto)) : process.argv[3].split(',');
 const tot = {};
 for (const sc of ids) { const r = await p.evaluate(([sc, N, OFF, NOVAR]) => { const A = __S, row = { sc };
   for (const [nm, o] of [['ref', {}], ['omni', { oracle: true }], ['rien', null]]) { let s = 0, ok = 0, pl = 0, pok = 0, ph = 0, phok = 0, pa = 0, pb = 0, bf = 0, bk = 0, fp = 0, kept = 0, vn = 0, cr = 0;
     for (let i = 1; i <= N; i++) { const g = playGame(i * 53 + 7 + OFF, sc, Object.assign({ contested: true }, NOVAR ? { novar: 1 } : {}), o ? mkBot(o) : null), S = A.s; s += g.s; ok += g.ok;
       const L = S.presLog || []; pl += L.length; pok += L.filter(x => x.ok).length; ph += L.filter(x => x.k === 'h').length; phok += L.filter(x => x.k === 'h' && x.ok).length; pa += S.presAct || 0; pb += S.presBad || 0; bf += S.brgFix || 0; bk += S.brgFake || 0; fp += S.fpOk || 0; cr += S.crises.filter(c => !c.silent).length; if (S.varOut) { kept += S.varOut.kept.length; vn += S.varOut.n } }
     row[nm] = { s: s / N, ok: ok / N, pl, pok, ph, phok, pa, pb, bf, bk, fp, kept, vn, cr: cr / N, N } } return row }, [sc, +process.argv[4] || 4, +process.env.OFF || 0, !!process.env.NOVAR]);
  const f = x => Math.round(x.s) + ' ' + Math.round(100 * x.ok) + '%';
  console.log(sc.padEnd(4), 'ref', f(r.ref), '| omni', f(r.omni), '| rien', f(r.rien), '| crises', r.ref.cr.toFixed(1), '| pres', r.ref.pl, 'ok', r.ref.pok, 'host', r.ref.ph, 'ok', r.ref.phok, 'act', r.ref.pa, 'bad', r.ref.pb, '| brg fix', r.ref.bf, 'echo', r.ref.bk, 'fp', r.ref.fp, r.ref.vn ? '| var ' + r.ref.kept + '/' + r.ref.vn : '');
  for (const k of ['ref', 'omni', 'rien']) { const t = tot[k] = tot[k] || { s: 0, ok: 0, n: 0, pl: 0, pok: 0, ph: 0, phok: 0, pa: 0, pb: 0, bf: 0, bk: 0, fp: 0 }; t.s += r[k].s; t.ok += r[k].ok; t.n++; for (const q of ['pl', 'pok', 'ph', 'phok', 'pa', 'pb', 'bf', 'bk', 'fp']) t[q] += r[k][q] } }
 for (const k of ['ref', 'omni', 'rien']) { const t = tot[k]; console.log('TOTAL', k, Math.round(t.s / t.n), Math.round(100 * t.ok / t.n) + '%', k === 'ref' ? JSON.stringify({ pres: t.pl, justes: t.pok, hostiles: t.ph, hostilesJustes: t.phok, actions: t.pa, aTort: t.pb, recoupes: t.bf, echosParRelevement: t.bk, fauxPositifsEcartes: t.fp }) : '') }
 console.log('errs', errs.slice(0, 4)); await b.close() })();
