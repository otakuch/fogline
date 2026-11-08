// Menu de partie : pause, paramètres, légende, raccourcis, recommencer, quitter. Usage : node uimenu.js
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(), errs = [], out = {};
 for (const [w, h, lang] of [[1440, 900, 'fr'], [390, 844, 'en']]) { const o = out[lang + w] = {}; const p = await (await b.newContext({ viewport: { width: w, height: h }, isMobile: w < 500, hasTouch: w < 500 })).newPage(); p.on('pageerror', e => errs.push(e.message)); await p.route(/fonts\.g/, r => r.abort());
  await p.goto('file://' + __dirname + '/t.html'); await p.waitForTimeout(600); await p.evaluate(l => { __S.setLang(l); __S.brief('i6', false) }, lang); await p.click('[data-a=expg][data-v="0"]'); await p.click('[data-a=begin]'); await p.waitForTimeout(300);
  o.surOrdre = await p.evaluate(() => { __S.openMenu(); return !!__S.MENU }); // l'ordre d'opération est ouvert : pas de menu
  await p.evaluate(() => { document.getElementById('over').hidden = true; document.getElementById('over').innerHTML = ''; __S.s.running = true; __S.s.speed = 2 });
  await p.click('#menuBtn'); await p.waitForTimeout(150); const t0 = await p.evaluate(() => __S.s.t); await p.waitForTimeout(600); o.pause = await p.evaluate(t0 => [__S.s.running, +(__S.s.t - t0).toFixed(2), !!document.querySelector('#over .mn')], t0);
  o.reserve = await p.evaluate(() => __S.s.pauseLeft === undefined ? 90 : Math.round(__S.s.pauseLeft));
  await p.click('[data-a=mset][data-v="lang:' + (lang === 'fr' ? 'en' : 'fr') + '"]'); o.langue = await p.evaluate(() => [document.documentElement.lang, document.getElementById('menuBtn').textContent]);
  await p.click('[data-a=mset][data-v="lang:' + lang + '"]');
  await p.click('[data-a=mset][data-v="snd:2"]'); o.son = await p.evaluate(() => localStorage.getItem('seuil.snd'));
  await p.click('[data-a=mset][data-v="sym:simple"]'); o.sym = await p.evaluate(() => localStorage.getItem('seuil.app6')); await p.click('[data-a=mset][data-v="sym:app6"]');
  await p.click('[data-a=mset][data-v="names:0"]'); await p.click('[data-a=mset][data-v="ponk:1"]'); o.pon = await p.evaluate(() => JSON.parse(localStorage.getItem('seuil.pon') || '{}').k);
  await p.click('[data-a=mkeys]'); o.touches = await p.locator('.mn-keys .row').count();
  await p.click('[data-a=mlegend]'); await p.waitForTimeout(100); o.legende = await p.locator('[data-a=legclose]').count(); await p.click('[data-a=legclose] >> nth=0'); o.retourMenu = await p.locator('#over .mn').count();
  o.hs = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
  await p.keyboard.press('Escape'); await p.waitForTimeout(100); o.echap = await p.evaluate(() => [!!__S.MENU, __S.s.running, __S.s.speed]);
  await p.evaluate(() => { __S.s.sel = null }); await p.keyboard.press('KeyM'); o.toucheM = await p.evaluate(() => !!__S.MENU);
  const seed = await p.evaluate(() => __S.s.seed); await p.click('[data-a=magain]'); o.confirme = await p.locator('#over .warn').count(); await p.click('[data-a=magain]'); await p.waitForTimeout(300); o.recommence = await p.evaluate(s => [__S.s.seed === s, __S.s.t, !!__S.MENU], seed);
  await p.evaluate(() => { document.getElementById('over').hidden = true; document.getElementById('over').innerHTML = '' }); await p.click('#menuBtn'); await p.click('[data-a=mquit]'); o.quitte1 = await p.evaluate(() => document.body.classList.contains('home')); await p.click('[data-a=mquit]'); await p.waitForTimeout(300); o.quitte2 = await p.evaluate(() => [document.body.classList.contains('home'), !!__S.MENU, !!document.querySelector('.hs')]);
  o.manque = await p.evaluate(() => __S.missing()); await p.context().close() }
 console.log(JSON.stringify(out)); console.log('errs', errs.slice(0, 4)); await b.close() })();
