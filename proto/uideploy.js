// Déploiement par points avant la mission (17 novembre 2026) : budget, boutons + et −, plafonds, pays grisés,
// retour au briefing, unités en jeu conformes au choix. Vrais clics, français à 1440 px, anglais à 390 px.
// Usage : node uideploy.js [dossier captures]
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), errs = [], D = process.argv[2] || '/tmp', out = {}; let bad = 0;
  const need = (ok, m) => { if (!ok) { bad++; console.log('ÉCHEC', m); } };
  for (const [lang, vw, mob] of [['fr', { width: 1440, height: 900 }, 0], ['en', { width: 390, height: 844 }, 1]]) {
    const o = out[lang + vw.width] = {};
    const p = await (await b.newContext({ viewport: vw, isMobile: !!mob, hasTouch: !!mob, locale: lang })).newPage();
    await p.route(/fonts\.g/, r => r.abort()); p.on('pageerror', e => errs.push(e.message));
    await p.goto('file://' + __dirname + '/t.html'); await p.waitForTimeout(700);
    await p.evaluate(l => { __S.setLang(l); __S.brief('i5', false); }, lang); await p.waitForTimeout(300);
    const st = () => p.evaluate(() => ({ d: __S.draft.slice(), c: __S.deckCost(__S.draft), b: __S.budgetOf(__S.SC.i5) }));
    const click = async sel => { const l = p.locator(sel).first(); if (await l.isDisabled()) return false; await l.scrollIntoViewIfNeeded(); const bb = await l.boundingBox(); const hit = bb && await p.evaluate(([x, y, s]) => { const e = document.elementFromPoint(x, y); return !!(e && e.closest(s)); }, [bb.x + bb.width / 2, bb.y + bb.height / 2, sel]); if (hit) await l.click(); return !!hit; };
    o.bouton_briefing = (await p.locator('[data-a="todeck"]').innerText()).replace(/\s+/g, ' ');
    need(await click('[data-a="todeck"]'), lang + ' : bouton du briefing masqué');
    await p.waitForTimeout(200);
    const s0 = await st(); o.depart = s0;
    o.titre = await p.locator('#over h1').innerText();
    need(s0.c <= s0.b, lang + ' : forces recommandées hors budget');
    // pays : seul États-Unis actif
    o.pays = await p.evaluate(() => [...document.querySelectorAll('.ntabs .btn')].map(b => (b.disabled ? '×' : '✓') + b.innerText.replace(/\s+/g, ' ')));
    need(o.pays.length === 4 && o.pays.filter(x => x[0] === '✓').length === 1, lang + ' : onglets de pays');
    // retirer tout, puis ajouter deux destroyers et un drone
    need(await click('[data-a="clr"]'), lang + ' : bouton Tout retirer'); await p.waitForTimeout(100);
    need((await st()).d.length === 0, lang + ' : la liste n’est pas vide');
    for (let i = 0; i < 3; i++) await click('[data-a="add"][data-v="frigate"]');
    const s1 = await st(); o.destroyers = s1.d.filter(k => k === 'frigate').length;
    need(o.destroyers === 2, lang + ' : plafond de 2 destroyers non respecté');
    o.plus_bloque = await p.evaluate(() => { const b = document.querySelector('[data-a="add"][data-v="frigate"]'); return b.disabled && b.title; });
    need(!!o.plus_bloque, lang + ' : bouton + non bloqué au plafond ou sans raison');
    await click('[data-a="add"][data-v="drone"]');
    // remplir jusqu'au budget avec des LCS puis vérifier que l'achat refuse le dépassement
    for (let i = 0; i < 6; i++) await click('[data-a="add"][data-v="patrol"]');
    const s2 = await st(); o.apres_achats = s2; need(s2.c <= s2.b, lang + ' : budget dépassé');
    o.compteur = (await p.locator('.dp-bud').innerText()).replace(/\s+/g, ' ');
    need(await click('[data-a="del"][data-v="patrol"]'), lang + ' : bouton −');
    const s3 = await st(); need(s3.d.length === s2.d.length - 1, lang + ' : le bouton − n’a rien retiré');
    o.largeur = await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1);
    need(o.largeur, lang + ' : défilement horizontal');
    await p.evaluate(() => document.querySelector('#over').scrollTo(0, 0));
    await p.screenshot({ path: `${D}/deploy_${lang}${vw.width}.png` });
    // retour au briefing, puis début de partie : les unités en jeu suivent le choix
    need(await click('[data-a="tobrief"]'), lang + ' : retour au briefing'); await p.waitForTimeout(200);
    need(await click('[data-a="begin"]'), lang + ' : bouton Commencer'); await p.waitForTimeout(400);
    o.en_jeu = await p.evaluate(() => { const S = __S.s, c = {}; S.units.filter(u => u.type !== 'helo').forEach(u => c[u.type] = (c[u.type] || 0) + 1); const ff = S.units.filter(u => u.type === 'frigate'); return { c, sep: ff.length === 2 ? Math.round(Math.hypot(ff[0].x - ff[1].x, ff[0].y - ff[1].y)) : null, mer: S.units.filter(u => __S.UT[u.type].naval).every(u => __S.seaOK(u.x, u.y)) }; });
    const want = {}; s3.d.forEach(k => { if (!__S_off(k)) want[k] = (want[k] || 0) + 1; });
    function __S_off(k) { return ['team', 'analysis', 'comm'].includes(k); }
    need(JSON.stringify(Object.keys(want).sort().map(k => [k, want[k]])) === JSON.stringify(Object.keys(o.en_jeu.c).sort().map(k => [k, o.en_jeu.c[k]])), lang + ' : unités en jeu différentes du choix ' + JSON.stringify(o.en_jeu.c));
    need(o.en_jeu.mer, lang + ' : un navire est placé sur la terre');
    o.manque = await p.evaluate(() => __S.missing()); need(!o.manque.length, lang + ' : textes manquants ' + o.manque.join());
    await p.close();
  }
  console.log(JSON.stringify(out, null, 1));
  need(!errs.length, 'erreurs de page : ' + errs.slice(0, 3).join(' | '));
  console.log(bad ? bad + ' échec(s)' : 'OK'); await b.close(); process.exit(bad ? 1 : 0);
})();
