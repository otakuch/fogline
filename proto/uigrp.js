// Groupe tactique, menu contextuel, raccourcis, contacts, doctrine au briefing et bilan, avec de vrais clics. Usage : node uigrp.js [dossier captures]
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(), errs = [], out = {}, D = process.argv[2] || '/tmp';
 const page = async (vw, mob, lang = 'fr') => { const p = await (await b.newContext({ viewport: vw, isMobile: !!mob, hasTouch: !!mob, locale: lang })).newPage(); await p.route(/fonts\.g/, r => r.abort()); p.on('pageerror', e => errs.push(e.message)); await p.goto('file://' + __dirname + '/t.html'); await p.waitForTimeout(500);
  await p.evaluate(l => { const A = __S; A.setLang(l); A.home(false); document.getElementById('over').hidden = true; A.newGame(11, { sc: 'la', deck: ['frigate', 'patrol', 'patrol', 'recon'], contested: false, guided: false, timer: 'easy' }); const S = A.s; S.running = false; S.sched = {}; S.pendingK = []; S.sc = { ...S.sc, dyn: 0 }; const f = S.units[0];[S.units[1], S.units[2]].forEach((u, k) => { const q = A.nearSea(f.x + (k ? -20 : 20), f.y + 8); u.x = q[0] * 4 + 2; u.y = q[1] * 4 + 2 }); A.applyCamX() }, lang); await p.waitForTimeout(400); return p };
 const scr = (p, x, y) => p.evaluate(([x, y]) => { const c = document.getElementById('c').getBoundingClientRect(), s = __S.toScr(x, y); return [s[0] + c.left, s[1] + c.top] }, [x, y]);
 for (const lang of ['fr', 'en']) {
  let p = await page({ width: 1440, height: 900 }, 0, lang); const o = out[lang] = {};
  const f = await p.evaluate(() => { const u = __S.s.units[0]; return { id: u.id, x: u.x, y: u.y } });
  await p.click('[data-a=ltab][data-v=forces]'); await p.click(`[data-a=selU][data-v="${f.id}"]`); await p.waitForTimeout(150);
  await p.click('#right [data-a=grpform]'); await p.waitForTimeout(150);
  o.groupe = await p.evaluate(() => __S.s.units.map(u => u.grp ? u.grp.lead : u.grpL ? 'L' : '-').join(','));
  o.dissoudre = await p.locator('#right [data-a=grpbreak]').count();
  if (lang === 'fr') await p.screenshot({ path: D + '/grp-panneau.png' });
  // clic droit : aller ici
  const tgt = await p.evaluate(f => { const q = __S.nearSea(f.x + 60, f.y - 20); return { x: q[0] * 4 + 2, y: q[1] * 4 + 2 } }, f); const [sx, sy] = await scr(p, tgt.x, tgt.y);
  await p.mouse.click(sx, sy, { button: 'right' }); await p.waitForTimeout(150);
  o.menu = await p.locator('#ctxm:not([hidden]) [data-a=ctx]').count();
  if (lang === 'fr') await p.screenshot({ path: D + '/grp-menu.png' });
  await p.click('#ctxm [data-v=move]'); await p.waitForTimeout(100);
  o.ordre = await p.evaluate(() => __S.s.units[0].path.length > 0 || __S.s.queue.length > 0);
  o.menuFerme = await p.locator('#ctxm').evaluate(m => m.hidden);
  await p.evaluate(() => { for (let i = 0; i < 400; i++) __S.step(.1) });
  o.suivi = await p.evaluate(() => { const S = __S.s, L = S.units[0]; return S.units.filter(u => u.grp).map(u => Math.round(Math.hypot(u.x - L.x - u.grp.dx, u.y - L.y - u.grp.dy))).join('/') });
  // raccourcis
  await p.locator('#c').click({ position: { x: 5, y: 5 } }).catch(() => { }); await p.keyboard.press('Escape'); await p.evaluate(() => { if (__S.MENU) __S.closeMenu() });
  await p.keyboard.press('KeyN'); o.toucheN = await p.evaluate(() => __S.s.sel && __S.s.sel.id);
  await p.keyboard.press('KeyN'); await p.keyboard.press('KeyG'); o.toucheG = await p.evaluate(() => { const u = __S.s.sel; return u && (u.grp ? 'quitte?' : 'libre') });
  await p.keyboard.press('Digit2'); o.vitesse = await p.evaluate(() => __S.s.speed + (__S.s.running ? ' marche' : ' pause')); await p.keyboard.press('Space');
  await p.keyboard.press('KeyP'); o.toucheP = await p.evaluate(() => !!__S.patrolEdit); await p.keyboard.press('Escape'); o.echap = await p.evaluate(() => !__S.patrolEdit);
  // contacts et journal
  await p.evaluate(() => { const S = __S.s; S.ships.slice(0, 3).forEach(s => { s.seen = true; s.ais = false }) });
  await p.click('[data-a=ltab][data-v=cont]'); await p.waitForTimeout(100); o.contacts = await p.locator('#leftC [data-a=selC]').count();
  await p.click('[data-a=ltab][data-v=track]'); await p.click('[data-a=logf][data-v=warn]'); await p.click('[data-a=pon][data-v=k]'); o.pon = await p.evaluate(() => __S.pon.k);
  await p.evaluate(() => { const S = __S.s; S.running = true; __S.startCrisis('desinfo') }); o.pause = await p.evaluate(() => !__S.s.running); await p.click('[data-a=pon][data-v=k]');
  // bilan
  await p.evaluate(() => { const S = __S.s; let n = 0; while (!S.over && n++ < 9000) __S.step(.1) }); await p.waitForTimeout(300);
  o.bilan = await p.locator('#over').evaluate(e => !e.hidden && /Pertes et consommations|Losses and expenditures/i.test(e.textContent));
  if (lang === 'fr') await p.screenshot({ path: D + '/grp-bilan.png', fullPage: false });
  o.manque = await p.evaluate(() => __S.missing()); await p.context().close();
 }
 // mobile 390 : panneau de groupe, sans défilement horizontal
 let m = await page({ width: 390, height: 844 }, 1);
 await m.evaluate(() => { __S.s.sel = __S.s.units[0]; __S.draw() }); await m.waitForTimeout(200); out.mobile = await m.evaluate(() => ({ hscroll: document.documentElement.scrollWidth > innerWidth + 1, bouton: !!document.querySelector('[data-a=grpform]') }));
 await m.screenshot({ path: D + '/grp-mobile.png' }); await m.context().close();
 // briefing : doctrine de départ
 let q = await page({ width: 1440, height: 900 }); await q.evaluate(() => { __S.s.over = true; }); const br = await q.evaluate(() => { const b = [...document.querySelectorAll('[data-a]')].map(x => x.dataset.a); return b.length });
 console.log(JSON.stringify(out)); console.log('errs', errs.slice(0, 5)); await b.close() })();
