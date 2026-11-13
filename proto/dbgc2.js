const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(), p = await b.newPage(); await p.route(/fonts\.g/, r => r.abort()); await p.goto('file://' + (process.argv[2] || __dirname + '/t.html')); await p.addScriptTag({ path: __dirname + '/bots.js' }); await p.waitForTimeout(300);
 const r = await p.evaluate(() => { const A = __S, o = [];
  const chk = (S, sc) => { if (Math.round(S.t) % 20) return; const fg = A.landGrid(A.thId), u = S.units.find(u => u.id === 'DDG-1'); if (!u) return; const a = Math.round(u.x * 2), c = Math.round(u.y * 2); o.push([Math.round(S.t), Math.round(u.x), Math.round(u.y), fg[c * 2880 + a], u.path.length, u.chase ? 'ch' : '', u.escort ? 'esc' : '', u.task ? u.task.kind : '']) };
  playGame(48, 'a5', { contested: true, guided: false }, mkBot({}), chk); return o });
 console.log(JSON.stringify(r)); await b.close() })();
