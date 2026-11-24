// Justesse des présomptions par règle et par vérité (script de référence). Usage : node v48p.js <page> ids parties
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(), p = await b.newPage(); await p.goto('file://' + __dirname + '/' + process.argv[2]); await p.addScriptTag({ path: __dirname + '/bots.js' }); await p.waitForTimeout(300);
 const ids = process.argv[3] === 'all' ? await p.evaluate(() => Object.keys(__S.SC).filter(k => !__S.SC[k].tuto)) : process.argv[3].split(','); const T = {};
 for (const sc of ids) { const r = await p.evaluate(([sc, N]) => { const o = {}; for (let i = 1; i <= N; i++) { playGame(i * 53 + 7, sc, { contested: true }, mkBot({})); const S = __S.s, all = S.ships.concat(S.gone || []); (S.presLog || []).forEach(x => { const k = x.r + ' ' + x.tr + (x.ok ? ' juste' : ' faux'); o[k] = (o[k] || 0) + 1 }) } return o }, [sc, +process.argv[4] || 4]); for (const k in r) T[k] = (T[k] || 0) + r[k] }
 console.log(JSON.stringify(T)); await b.close() })();
