const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(), p = await b.newPage(); await p.route(/fonts\.g/, r => r.abort()); await p.goto('file://' + (process.argv[2] || __dirname + '/t.html')); await p.addScriptTag({ path: __dirname + '/bots.js' }); await p.waitForTimeout(300);
 const r = await p.evaluate(() => { const A = __S, ids = Object.keys(A.SC).filter(k => !A.SC[k].tuto).filter((k, i) => i % 3 === 0), o = {}, ex = [];
  const chk = (S, sc) => { const fg = A.landGrid(A.thId); S.units.forEach(u => { const T = A.UT[u.type]; if (!(T.naval || u.type === 'repair')) return; const a = Math.round(u.x * 2), c = Math.round(u.y * 2); if (fg[c * 2880 + a] === 1) { const k = sc + ':' + u.id + ':' + (u.path.length ? 'mv' : 'idle') + ':' + (u.task ? u.task.kind : u.chase ? 'chase' : u.escort ? 'esc' : u.grp ? 'grp' : u.patrol ? 'pat' : '-') + ':' + (A.coastAt ? A.coastAt(u.x, u.y) : '?'); o[k] = (o[k] || 0) + 1 } }) };
  for (const sc of ids) playGame(48, sc, { contested: true, guided: false }, mkBot({}), chk); return Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, 25) });
 console.log(JSON.stringify(r)); await b.close() })();
