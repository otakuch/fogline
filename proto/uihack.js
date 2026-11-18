// Piratage d'une unité (17 novembre 2026) : indication dans le journal, la liste des forces, la fiche et sur la carte ;
// bouton « Contrer le piratage » cliqué pour de vrai, délai, retour en service, ligne du bilan. Français à 1440 px, anglais à 390 px.
// Usage : node uihack.js [dossier captures]
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), errs = [], D = process.argv[2] || '/tmp', out = {}; let bad = 0;
  const need = (ok, m) => { if (!ok) { bad++; console.log('ÉCHEC', m); } };
  for (const [lang, vw, mob] of [['fr', { width: 1440, height: 900 }, 0], ['en', { width: 390, height: 844 }, 1]]) {
    const o = out[lang + vw.width] = {};
    const p = await (await b.newContext({ viewport: vw, isMobile: !!mob, hasTouch: !!mob, locale: lang })).newPage();
    await p.route(/fonts\.g/, r => r.abort()); p.on('pageerror', e => errs.push(e.message));
    await p.goto('file://' + __dirname + '/t.html'); await p.waitForTimeout(700);
    for (const team of [1, 0]) {
      await p.evaluate(([l, team]) => { const A = __S; A.setLang(l); A.home(false); document.getElementById('over').hidden = true; const deck = A.SC.la.rec.filter(k => team || k !== 'team'); A.newGame(11, { sc: 'la', deck: deck.includes('frigate') ? deck : deck.concat('frigate'), contested: false, timer: 'easy' }); const S = A.s; S.sched = {}; S.pendingK = []; S.sc = { ...S.sc, dyn: 0 }; S.running = false; S.tokens = 4; A.applyCamX(); const u = S.units.find(x => x.type === 'frigate'); A.hackUnit(u); S.sel = u; A.cam.x = u.x; A.cam.y = u.y; A.redraw(); }, [lang, team]);
      await p.waitForTimeout(500);
      const k = team ? 'equipe' : 'equipage', r = o[k] = {};
      r.journal = await p.evaluate(() => __S.s.log[0].m);
      r.etat = await p.evaluate(() => { const A = __S, u = A.s.sel; return A.s.units.includes(u) && A.hacked(u); });
      const btn = p.locator('[data-a="unhack"]');
      r.bouton = (await btn.count()) ? (await btn.first().innerText()).replace(/\s+/g, ' ') : null;
      if (mob) await btn.first().scrollIntoViewIfNeeded().catch(() => {});
      if (!team) await p.screenshot({ path: `${D}/hack_${lang}${vw.width}.png` });
      if (r.bouton) { const bb = await btn.first().boundingBox(), hit = bb && await p.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return !!(e && e.closest('[data-a="unhack"]')); }, [bb.x + bb.width / 2, bb.y + bb.height / 2]); r.cliquable = !!hit; if (hit) await btn.first().click(); }
      await p.waitForTimeout(200);
      r.apres_clic = await p.evaluate(() => { const u = __S.s.sel; return u.hack ? Math.round(u.hack.fix - __S.s.t) : null; });
      r.jetons = await p.evaluate(() => __S.s.tokens);
      r.reprise = await p.evaluate(() => (document.querySelector('.hackw') || {}).innerText || '');
      await p.evaluate(() => { const S = __S.s; for (let i = 0; i < 400 && __S.hacked(S.sel); i++) __S.step(.1); });
      r.retour = await p.evaluate(() => !__S.hacked(__S.s.sel) && __S.s.log[0].m);
      r.largeur = await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1);
      r.manque = await p.evaluate(() => __S.missing());
      need(r.etat, lang + ' ' + k + ' : unité non piratée');
      need(r.bouton && r.cliquable, lang + ' ' + k + ' : bouton absent ou masqué');
      need(r.apres_clic === (team ? 15 : 35), lang + ' ' + k + ' : délai attendu ' + (team ? 15 : 35) + ' s, obtenu ' + r.apres_clic);
      need(r.jetons === 3, lang + ' ' + k + ' : un jeton doit être dépensé');
      need(!!r.retour, lang + ' ' + k + ' : unité pas revenue en service');
      need(r.largeur, lang + ' ' + k + ' : défilement horizontal');
      need(!r.manque.length, lang + ' ' + k + ' : textes manquants ' + r.manque.join());
    }
    await p.close();
  }
  console.log(JSON.stringify(out, null, 1));
  need(!errs.length, 'erreurs de page : ' + errs.slice(0, 3).join(' | '));
  console.log(bad ? bad + ' échec(s)' : 'OK'); await b.close(); process.exit(bad ? 1 : 0);
})();
