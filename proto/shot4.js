// Captures des écrans principaux. Usage : node shot4.js <page> <dossier> <préfixe>
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(), [pg, D, pre] = process.argv.slice(2), errs = [];
 for (const [lang, vw, mob] of [['fr', { width: 1440, height: 900 }, 0], ['en', { width: 390, height: 844 }, 1]]) { const tag = pre + '-' + lang + vw.width, p = await (await b.newContext({ viewport: vw, isMobile: !!mob, hasTouch: !!mob })).newPage(); await p.route(/fonts\.g/, r => r.continue()); p.on('pageerror', e => errs.push(e.message)); await p.goto('file://' + pg); await p.waitForTimeout(1500);
  await p.evaluate(l => { try { localStorage.setItem('seuil.lang', l) } catch (_) { } __S.setLang(l); __S.home(true) }, lang); await p.waitForTimeout(1300); await p.screenshot({ path: `${D}/${tag}-1accueil.png` });
  await p.evaluate(() => { __S.brief('la', false) }); await p.waitForTimeout(400); await p.screenshot({ path: `${D}/${tag}-2briefing.png` });
  await p.evaluate(() => { const A = __S; A.home(false); document.getElementById('over').hidden = true; A.newGame(11, { sc: 'la', deck: A.SC.la.rec, contested: false, guided: false, timer: 'easy' }); const S = A.s; S.running = false; A.applyCamX(); const c = A.startCrisis('cyber'); S.sel = c; S.tokens = 4; A.redraw() }); await p.waitForTimeout(700); await p.screenshot({ path: `${D}/${tag}-3jeu.png` });
  if (mob) { await p.evaluate(() => { const e = document.getElementById('rightC'); if (e) e.scrollIntoView() }); await p.waitForTimeout(200); await p.screenshot({ path: `${D}/${tag}-3jeu-dossier.png`, fullPage: true }) }
  await p.evaluate(() => __S.openMenu()); await p.waitForTimeout(300); await p.screenshot({ path: `${D}/${tag}-4menu.png` }); await p.evaluate(() => __S.closeMenu());
  await p.evaluate(() => { const A = __S; for (let i = 0; i < 9000 && !A.s.over; i++) A.step(.1); A.redraw() }); await p.waitForTimeout(600); await p.screenshot({ path: `${D}/${tag}-5bilan.png` }); await p.close() }
 console.log('errs', errs.slice(0, 4)); await b.close() })();
