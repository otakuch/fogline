// Version 43 : ralenti au zoom, vitesse ×½, temps de jeu indépendant de la fluidité de l'affichage.
// Usage : node uiv43.js [ralentissement du processeur, 4 par défaut]
const { chromium } = require('playwright');
(async () => {
  const thr = +(process.argv[2] || 4), b = await chromium.launch(); let bad = 0, n = 0;
  const need = (ok, m) => { n++; if (!ok) { bad++; console.log('ÉCHEC', m); } else console.log('ok', m) };
  for (const [lang, vw, mob] of [['fr', { width: 1440, height: 900 }, 0], ['en', { width: 390, height: 844 }, 1]]) {
    const tag = lang + vw.width, errs = [], ctx = await b.newContext({ viewport: vw, isMobile: !!mob, hasTouch: !!mob }), p = await ctx.newPage();
    await p.route(/fonts\.g/, r => r.abort()); p.on('pageerror', e => errs.push(e.message));
    await p.addInitScript(l => { try { localStorage.clear(); localStorage.setItem('seuil.lang', l) } catch (_) { } }, lang);
    if (thr > 1 && !mob) { const c = await ctx.newCDPSession(p); await c.send('Emulation.setCPUThrottlingRate', { rate: thr }); }
    await p.goto('file://' + __dirname + '/t.html'); await p.waitForTimeout(900);
    await p.evaluate(l => { const A = __S; A.setLang(l); A.home(false); document.getElementById('over').hidden = true; A.newGame(11, { sc: 'asw', deck: A.SC.asw.rec, contested: false, guided: false, timer: 'easy' }); const S = A.s; S.sched = {}; S.pendingK = []; S.sc = { ...S.sc, dyn: 0 }; S.tmode = 'rt'; S.speed = 1; S.running = false; A.applyCamX(); }, lang);
    const meas = (f, speed, ms = 2500) => p.evaluate(async ([f, speed, ms]) => {
      const A = __S, S = A.s, u = S.units.find(x => x.type === 'frigate'); A.cam.z = A.minZ() * f; A.cam.x = u.x; A.cam.y = u.y; S.speed = speed; S.running = true; S.pendingK = []; S.sched = {};
      await new Promise(r => setTimeout(r, 400)); const t0 = S.t, p0 = S.pauseLeft === undefined ? 90 : S.pauseLeft, st = performance.now(); await new Promise(r => setTimeout(r, ms));
      const real = (performance.now() - st) / 1000, o = { f, speed, simReel: +((S.t - t0) / real).toFixed(2), zs: A.loopZs, reserve: +(p0 - (S.pauseLeft === undefined ? 90 : S.pauseLeft)).toFixed(1), real: +real.toFixed(1), chip: document.getElementById('fzLvl').innerText.replace(/\n/g, ' ') }; S.running = false; return o
    }, [f, speed, ms]);
    const a = await meas(1, 1); console.log(tag, JSON.stringify(a));
    need(a.simReel > .85 && a.simReel < 1.2 && a.zs === 1, tag + ' vue large : temps réel (processeur ralenti ' + (mob ? 1 : thr) + ' fois) ' + a.simReel);
    const z = await meas(4, 1); console.log(tag, JSON.stringify(z));
    need(Math.abs(z.zs - .4) < .01 && z.simReel > .3 && z.simReel < .5 && /0[,.]4/.test(z.chip), tag + ' zoom ×4 : temps ×0,4 affiché, ' + z.simReel + ' · ' + z.chip);
    need(z.reserve > 1 && Math.abs(z.reserve - z.real * .6) < 1.2, tag + ' niveau Complet : le ralenti consomme la réserve de pause (1 − 0,4 par seconde) : ' + z.reserve + ' s sur ' + z.real + ' s');
    const zz = await meas(32, 1); need(Math.abs(zz.zs - .25) < .01, tag + ' zoom ×32 : jamais sous ×0,25 : ' + zz.zs);
    await p.evaluate(() => { __S.ZSLOW.on = false }); const off = await meas(4, 1); await p.evaluate(() => { __S.ZSLOW.on = true });
    need(off.zs === 1 && off.simReel > .85, tag + ' réglage coupé : temps normal au zoom : ' + off.simReel);
    // niveau Simple, pause illimitée : la réserve ne bouge pas
    await p.evaluate(() => { const S = __S.s; S.guided = true; S.timer = 'easy'; S.pauseLeft = 90; });
    const g = await meas(4, 1, 1500); need(g.reserve === 0 && g.zs < 1, tag + ' niveau Simple : ralenti sans consommer de réserve : ' + g.reserve);
    await p.evaluate(() => { const S = __S.s; S.guided = false; });
    // réserve épuisée : le ralenti s'arrête
    await p.evaluate(() => { __S.s.pauseLeft = .3 }); const ex = await meas(4, 1, 1500); const out = await p.evaluate(() => [__S.s.zsOut, __S.zTime()]);
    need(out[0] === true && out[1] === 1, tag + ' réserve épuisée : ralenti arrêté : ' + out + ' ' + ex.simReel);
    await p.evaluate(() => { const S = __S.s; S.zsOut = false; S.pauseLeft = 90; });
    // vitesse ×½ par le vrai bouton
    await p.evaluate(() => { const A = __S, S = A.s; A.cam.z = A.minZ(); S.running = true; }); await p.waitForTimeout(200);
    const btn = p.locator('#sp05'); const vis = await btn.isVisible(); if (vis) await btn.click(); else await p.evaluate(() => document.getElementById('sp05').click());
    await p.waitForTimeout(300);
    const h = await p.evaluate(async () => { const S = __S.s, t0 = S.t, st = performance.now(); await new Promise(r => setTimeout(r, 2000)); return { sp: S.speed, on: document.getElementById('sp05').classList.contains('on'), r: +((S.t - t0) / ((performance.now() - st) / 1000)).toFixed(2) } });
    need(h.sp === .5 && h.on && h.r > .4 && h.r < .62, tag + ' bouton ×½ : ' + JSON.stringify(h) + (vis ? '' : ' (bouton masqué à cette largeur)'));
    const sw = await p.evaluate(() => [document.documentElement.scrollWidth, innerWidth]); need(sw[0] <= sw[1], tag + ' pas de défilement horizontal : ' + sw);
    await p.screenshot({ path: '/tmp/v43-' + tag + '.png' });
    const miss = await p.evaluate(() => __S.missing()); need(!miss.length, tag + ' aucun texte manquant : ' + miss.join(','));
    need(!errs.length, tag + ' aucune erreur : ' + errs.slice(0, 3).join(' | '));
    await ctx.close();
  }
  await b.close(); console.log(bad ? bad + ' échec(s) sur ' + n : 'tout passe (' + n + ' contrôles)'); process.exit(bad ? 1 : 0);
})();
