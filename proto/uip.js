// Patrouilles et liberté de mouvement, avec de vrais clics. Usage : node uip.js
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(), errs = [], out = {};
 const page = async (vw, mob) => { const p = await (await b.newContext({ viewport: vw, isMobile: !!mob, hasTouch: !!mob, locale: 'fr' })).newPage(); await p.route(/fonts\.g/, r => r.abort()); p.on('pageerror', e => errs.push(e.message)); await p.goto('file://' + __dirname + '/t.html'); await p.waitForTimeout(500);
  await p.evaluate(() => { const A = __S; A.setLang('fr'); A.home(false); document.getElementById('over').hidden = true; A.newGame(11, { sc: 'la', deck: A.SC.la.rec, contested: false, guided: false, timer: 'easy' }); const S = A.s; S.running = false; S.sched = {}; S.pendingK = []; S.sc = { ...S.sc, dyn: 0 }; A.applyCamX() }); await p.waitForTimeout(400); return p };
 const scr = (p, x, y) => p.evaluate(([x, y]) => { const c = document.getElementById('c').getBoundingClientRect(), s = __S.toScr(x, y); return [s[0] + c.left, s[1] + c.top] }, [x, y]);
 let p = await page({ width: 1440, height: 900 });
 const u = await p.evaluate(() => { const u = __S.s.units.find(x => x.type === 'patrol'); return { id: u.id, x: u.x, y: u.y } });
 // sélection par la liste des forces
 await p.click('[data-a=ltab][data-v=forces]'); await p.click(`[data-a=selU][data-v="${u.id}"]`); await p.waitForTimeout(150);
 out.bouton = await p.locator('#right [data-a=patnew]').count(); await p.click('#right [data-a=patnew]'); await p.waitForTimeout(100);
 const pts = await p.evaluate(u => { const A = __S, o = []; for (const [dx, dy] of [[-60, -40], [-120, 10], [-40, 70]]) { const q = A.patrolPt(A.s.units.find(x => x.id === u.id), u.x + dx, u.y + dy); if (q) o.push(q) } return o }, u);
 for (const q of pts) { const [sx, sy] = await scr(p, q.x, q.y); await p.mouse.click(sx, sy); await p.waitForTimeout(80) }
 out.points = await p.evaluate(() => __S.patrolEdit && __S.patrolEdit.pts.length); await p.screenshot({ path: __dirname + '/../../p_edit.png' });
 await p.click('#right [data-a=patgo]'); await p.waitForTimeout(100);
 out.lancee = await p.evaluate(u => { const x = __S.s.units.find(z => z.id === u.id); return x.patrol ? x.patrol.length : 0 }, u);
 const tr = await p.evaluate(u => { const A = __S, S = A.s, x = S.units.find(z => z.id === u.id), seen = new Set(); let mx = 0; for (let i = 0; i < 2400; i++) { A.step(.1); S.running = false; const j = x.patrol ? x.patrol.findIndex(q => Math.hypot(q.x - x.x, q.y - x.y) < 6) : -1; if (j >= 0) seen.add(j); if (!A.seaOK(x.x, x.y)) mx++ } return { passages: [...seen].sort().join(','), toujours: !!x.patrol, surTerre: mx } }, u); Object.assign(out, tr);
 await p.waitForTimeout(200); await p.screenshot({ path: __dirname + '/../../p_run.png' });
 // un ordre de déplacement arrête la patrouille
 const [ax, ay] = await scr(p, u.x - 30, u.y + 20); await p.mouse.click(ax, ay); await p.waitForTimeout(100); out.arretParOrdre = await p.evaluate(u => !__S.s.units.find(z => z.id === u.id).patrol, u);
 // liberté de mouvement : présence comptée au bord de la zone, pas au loin
 const cov = await p.evaluate(() => { const A = __S, S = A.s; S.units.forEach(x => { x.path = []; x.patrol = null }); const o = S.objs.find(z => z.k === 'patrol'), z = o.zone, u = S.units.find(x => x.type === 'patrol'), R = A.sensorR(u); const res = {}; for (const [k, d] of [['dedans', 0], ['bord', z.r + R * .6], ['loin', z.r + R * 1.4]]) { S.units.filter(x => x !== u).forEach(x => { x.x = 5; x.y = 5 }); u.x = z.x + d; u.y = z.y; u.path = []; o.p = 0; o.st = 0; const p0 = 0; for (let i = 0; i < 50; i++) { A.step(.1); S.running = false } res[k] = +(o.p - p0).toFixed(1) } return { r: z.r, capteur: Math.round(R), ...res } }); out.couverture = cov;
 await p.close();
 // téléphone
 p = await page({ width: 390, height: 844 }, true); await p.evaluate(() => { const S = __S.s; S.sel = S.units.find(x => x.type === 'patrol') }); await p.waitForTimeout(300); await p.locator('#right [data-a=patnew]').scrollIntoViewIfNeeded(); await p.click('#right [data-a=patnew]'); await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(200);
 const q2 = await p.evaluate(() => { const A = __S, u = A.s.units.find(x => x.type === 'patrol'); const o = []; for (const [dx, dy] of [[60, -40], [120, 10], [40, 70], [-40, 50], [80, -80]]) { const q = A.patrolPt(u, u.x + dx, u.y + dy); if (q && o.length < 2) o.push(q) } return o }); for (const q of q2) { const [sx, sy] = await scr(p, q.x, q.y); await p.mouse.click(sx, sy); await p.waitForTimeout(80) } out.mobilePoints = await p.evaluate(() => __S.patrolEdit && __S.patrolEdit.pts.length); out.mobileLarg = await p.evaluate(() => [document.documentElement.scrollWidth, innerWidth]); await p.locator('#right [data-a=patgo]').scrollIntoViewIfNeeded(); await p.screenshot({ path: __dirname + '/../../p_mob.png' });
 console.log(JSON.stringify(out)); if (process.env.DBG) console.log(await p.evaluate(() => JSON.stringify(__S.s.units.map(u => [u.id, Math.round(u.x), Math.round(u.y)])))); console.log('manq', await p.evaluate(() => __S.missing()), 'errs', errs); await b.close() })();
