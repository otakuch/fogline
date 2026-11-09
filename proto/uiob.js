// Ordre de bataille, ordre d'opération, fiche d'unité, allure, zoom vers le curseur, côtes détaillées. Usage : node uiob.js
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(), errs = [], out = {};
 for (const [w, h, lang] of [[1440, 900, 'fr'], [390, 844, 'en']]) { const o = out[lang + w] = {}; const p = await (await b.newContext({ viewport: { width: w, height: h }, isMobile: w < 500, hasTouch: w < 500 })).newPage(); p.on('pageerror', e => errs.push(e.message)); await p.route(/fonts\.g/, r => r.abort()); await p.goto('file://' + __dirname + '/t.html'); await p.waitForTimeout(600);
  await p.evaluate(l => { __S.setLang(l); __S.brief('i6', false) }, lang); await p.click('[data-a=todeck]'); await p.waitForTimeout(100);
  await p.click('.ob-row [data-a=obsel] >> nth=0'); o.sheet = await p.locator('.ob-sheet h2').textContent(); o.capteurs = await p.locator('.ob-sheet .row').count();
  o.achat = await p.locator('[data-a=add],[data-a=del],[data-a=rec]').count(); o.orb = await p.evaluate(() => __S.s ? null : document.querySelectorAll('.ob-row').length);
  o.hsDeck = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
  await p.click('[data-a=tobrief]'); await p.click('[data-a=begin]'); await p.waitForTimeout(300); await p.evaluate(() => { const o = document.getElementById('over'); o.hidden = true; __S.s.running = false });
  o.opord = await p.evaluate(() => ({ taches: document.querySelectorAll('.opord .obj').length, regle: !!document.querySelector('.op-rule'), cond: document.querySelectorAll('.opord .row').length }));
  // fiche d'unité et allure
  await p.click('[data-a=ltab][data-v=forces]'); const id = await p.evaluate(() => __S.s.units.find(u => u.type === 'patrol').id); await p.click(`[data-a=selU][data-v="${id}"]`); await p.waitForTimeout(100);
  await p.click('#right details.uadv>summary'); await p.click('#right [data-a=thr][data-v="0"]'); o.allure = await p.evaluate(() => __S.s.sel.thr);
  o.vitesse = await p.evaluate(() => { const S = __S.s, u = S.sel, A = __S, r = []; S.sched = {}; S.pendingK = []; for (const th of [0, 2]) { A.setThr(u, th); u.path = [{ x: u.x + (th ? -200 : 200), y: u.y }]; const x0 = u.x, y0 = u.y; for (let i = 0; i < 10; i++) A.step(.1); r.push(+Math.hypot(u.x - x0, u.y - y0).toFixed(1)) } return r });
  o.fiche = await p.locator('#right .us-row').count();
  o.moral = await p.evaluate(() => { const S = __S.s, A = __S, m0 = S.mor, L = S.units.filter(x => x !== S.sel); A.hitUnit(L[0], 100); const m1 = S.mor, t0 = A.morT(); if (L[1]) A.hitUnit(L[1], 100); A.moral(-30); return [m0, Math.round(m1), Math.round(S.mor), t0, A.morT(), document.getElementById('hMor').textContent] });
  // zoom vers le curseur
  if (w > 500) { const r = await p.evaluate(() => { const c = document.getElementById('c').getBoundingClientRect(); return { x: c.left + c.width * .6, y: c.top + c.height * .5 } }); const before = await p.evaluate(([x, y]) => { const c = document.getElementById('c').getBoundingClientRect(); return __S.toScr ? null : null }, [r.x, r.y]);
   const w0 = await p.evaluate(([x, y]) => { const c = document.getElementById('c').getBoundingClientRect(), A = __S, z = A.cam.z, v = A.toScr(0, 0); return [(x - c.left - v[0]) / z, (y - c.top - v[1]) / z] }, [r.x, r.y]);
   await p.mouse.move(r.x, r.y); for (let i = 0; i < 25; i++) await p.mouse.wheel(0, -100); await p.waitForTimeout(200);
   const w1 = await p.evaluate(([x, y]) => { const c = document.getElementById('c').getBoundingClientRect(), A = __S, z = A.cam.z, v = A.toScr(0, 0); return [(x - c.left - v[0]) / z, (y - c.top - v[1]) / z, z] }, [r.x, r.y]);
   o.zoom = { z: +w1[2].toFixed(1), derive: +Math.hypot(w1[0] - w0[0], w1[1] - w0[1]).toFixed(2) }; o.cotes = await p.evaluate(() => !document.getElementById('attrib').hidden || 'webgl absent') }
  o.hsJeu = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1); o.manque = await p.evaluate(() => __S.missing()); await p.context().close() }
 console.log(JSON.stringify(out)); console.log('errs', errs.slice(0, 4)); await b.close() })();
