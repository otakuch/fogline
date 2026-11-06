// Tutoriel de bout en bout avec de vrais clics, dans une langue et un format. Usage : node uit.js [fr|en] [largeur]
const { chromium } = require('playwright');
(async () => { const lang = process.argv[2] || 'fr', w = +process.argv[3] || 1440, b = await chromium.launch(), p = await (await b.newContext({ viewport: { width: w, height: w < 500 ? 844 : 860 }, locale: lang })).newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
 await p.goto('file://' + __dirname + '/t.html'); await p.waitForTimeout(400); const shot = n => p.screenshot({ path: __dirname + `/t_${lang}_${w}_${n}.png` });
 await p.click(`[data-a=lang][data-v=${lang}]`); await shot('home'); await p.click('.hs-go[data-a=tuto]'); await p.waitForTimeout(150); await shot('brief'); await p.click('[data-a=begin]'); await p.waitForTimeout(150); await shot('frago'); await p.click('[data-a=ack]');
 const st = () => p.evaluate(() => ({ i: __S.coach.i, k: (__S.COACH[__S.coach.i] || {}).k, over: __S.s.over }));
 const log = []; const clickVis = async sel => { const e = p.locator(sel).first(); await e.scrollIntoViewIfNeeded(); await e.click(); };
 for (let n = 0; n < 200; n++) { const c = await st(); if (c.over) break; if (log[log.length - 1] !== c.i) { log.push(c.i); await p.waitForTimeout(60); await shot('s' + c.i) }
  if (await p.locator('[data-a=coachnext]').count()) { await clickVis('[data-a=coachnext]'); }
  else if (await p.locator('[data-a=coachend]').count()) { await clickVis('[data-a=coachend]'); }
  else if (c.i === 1) { const sel = await p.evaluate(() => __S.s.sel && __S.s.sel.type === 'patrol'); if (!sel) await clickVis('[data-a=selU][data-v="P-1"]'); else { const box = await p.locator('#c').boundingBox(), pt = await p.evaluate(() => { const o = __S.s.objs.find(x => x.k === 'patrol').zone; return __S.toScr(o.x, o.y) }); await p.locator('#c').scrollIntoViewIfNeeded(); const b2 = await p.locator('#c').boundingBox(); await p.mouse.click(b2.x + pt[0], b2.y + pt[1]) } }
  else { const hl = p.locator('.coach-hl[data-a=act]:not([disabled])'); if (await hl.count()) await hl.first().scrollIntoViewIfNeeded().then(() => hl.first().click()); }
  await p.waitForTimeout(350) }
 const end = await p.evaluate(() => { const S = __S.s, r = __S.score(); return { over: S.over, t: Math.round(S.t), objs: S.objs.map(o => o.key + ':' + o.st), s: r.s, st: r.stars, again: !!document.querySelector('.go[data-a=play]') } });
 await p.waitForTimeout(150); await shot('end'); console.log(lang, w, 'étapes', log.join(','), JSON.stringify(end), 'manq', await p.evaluate(() => __S.missing()), 'errs', errs); await b.close() })();
