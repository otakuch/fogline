// Version 46 : câbles sous-marins tracés en mer et affichés seulement dans les missions qui les mettent en jeu.
// Usage : node uiv46.js [dossier captures]
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), D = process.argv[2] || '/tmp'; let bad = 0, n = 0;
  const need = (ok, m) => { n++; if (!ok) { bad++; console.log('ÉCHEC', m); } };
  for (const [lang, vw, mob] of [['fr', { width: 1440, height: 900 }, 0], ['en', { width: 390, height: 844 }, 1]]) {
    const tag = lang + vw.width, errs = [];
    const ctx = await b.newContext({ viewport: vw, isMobile: !!mob, hasTouch: !!mob }), p = await ctx.newPage();
    await p.route(/fonts\.g/, r => r.abort()); p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/^Failed to load resource/.test(m.text())) errs.push(m.text()); });
    await p.goto('file://' + __dirname + '/t.html'); await p.waitForTimeout(600);
    const st = (f, a) => p.evaluate(f, a), tick = (ms = 300) => p.waitForTimeout(ms);
    // 1. tracé : chaque câble de chaque théâtre reste en mer hors des points d'atterrissage, et y aboutit
    const geo = await st(() => { const bad = []; let pts = 0; for (const th of ['natl', 'gn', 'ad', 'em', 'ml']) { useTheatre(th); for (const c of CABLE_DEF) { const A = c.pts[0], B = c.pts[c.pts.length - 1]; const pl = Object.values(P), nr = q => Math.min(...pl.map(v => Math.hypot(v[0] - q[0], v[1] - q[1]))); if (nr(A) > 1 || nr(B) > 1) bad.push(th + c.id + ' atterrissage'); for (let i = 0; i <= 200; i++) { const q = qb(c, i / 200); pts++; if (Math.hypot(q.x - A[0], q.y - A[1]) > 9 && Math.hypot(q.x - B[0], q.y - B[1]) > 9 && !seaAt(q.x, q.y)) { bad.push(th + c.id + '@' + i); break } } } } return { bad, pts } });
    need(!geo.bad.length, tag + ' câbles en mer et aux ports : ' + geo.bad.join(','));
    // 2. visibilité : seulement les missions avec sabotage ou fonds marins
    const want = { c1: '', f2: 'L1,L2', asw: '', l12: 'L4', g3: '', a4: '', e6: '', m6: 'L1,L2' };
    for (const id in want) {
      await st(([l, id]) => { __S.setLang(l); __S.brief(id, false) }, [lang, id]); await tick(250);
      await p.locator('[data-a="begin"]').first().click(); await tick(400);
      const g = await st(() => { const m = document.querySelector('#mleg'); return { c: __S.cables.map(c => c.id).join(','), leg: m && !m.hidden ? !!m.querySelector('.ln.l1') : null } });
      need(g.c === want[id], `${tag} ${id} : câbles « ${g.c} » attendus « ${want[id]} »`);
      if (g.leg !== null) need(g.leg === !!want[id], `${tag} ${id} : légende Câble ${g.leg}`);
      if (id === 'f2' && !mob) { const fb = p.getByRole('button', { name: /prendre acte|acknowledge/i }); if (await fb.isVisible()) await fb.click(); await tick(300); await p.keyboard.press('v'); await tick(800); await p.screenshot({ path: D + '/v46-f2-' + tag + '.png' }) }
    }
    // légende de carte (symboles du jeu) : entrée Câble seulement avec des câbles
    for (const [id, w] of [['f2', true], ['c1', false]]) { await st(([l, id]) => { __S.setLang(l); __S.brief(id, false) }, [lang, id]); await tick(250); await p.locator('[data-a="begin"]').first().click(); await tick(400); const lg = await st(() => { SYM.fz = false; SYM.ships = 'v2'; LAY.leg = true; renderMleg(); const m = document.querySelector('#mleg'); return m && !m.hidden ? !!m.querySelector('.ln.l1') : null }); need(lg === w, `${tag} ${id} : légende de carte, entrée Câble ${lg}`) }
    // 3. crises sur un câble : la zone et le saboteur restent en mer, près du câble
    await st(([l]) => { __S.setLang(l); __S.brief('f2', false) }, [lang]); await tick(250); await p.locator('[data-a="begin"]').first().click(); await tick(400);
    const cr = await st(() => { const r = []; for (let k = 0; k < 6; k++) { startCrisis('seabed'); const c = __S.s.crises[__S.s.crises.length - 1]; const d = Math.min(...Array.from({ length: 81 }, (_, i) => { const q = qb(c.cable, i / 80); return Math.hypot(q.x - c.zone.x, q.y - c.zone.y) })); r.push([seaAt(c.zone.x, c.zone.y), +d.toFixed(1)]) } startCrisis('sabotage'); const sh = []; for (let k = 0; k < 6; k++) { const s = spawnSaboteur(); const e = s.path[s.path.length - 1]; sh.push(seaAt(s.pt.x, s.pt.y) && Math.hypot((e.x ?? e[0]) - s.pt.x, (e.y ?? e[1]) - s.pt.y) < 4) } return { r, sh } });
    need(cr.r.every(([s, d]) => s && d < 12), tag + ' zones de fonds marins en mer près du câble : ' + JSON.stringify(cr.r));
    need(cr.sh.length === 6 && cr.sh.every(x => x), tag + ' saboteur : cible en mer sur le câble et atteignable : ' + JSON.stringify(cr.sh));
    const misc = await st(() => [document.documentElement.scrollWidth > innerWidth, __S.missing()]);
    need(!misc[0], tag + ' pas de défilement horizontal'); need(!misc[1].length, tag + ' textes manquants : ' + misc[1].join(','));
    need(!errs.length, tag + ' erreurs : ' + errs.slice(0, 3).join(' | '));
    await ctx.close();
  }
  console.log(bad ? `${bad} échec(s) sur ${n}` : `uiv46 : ${n} contrôles, tous réussis`); await b.close(); process.exit(bad ? 1 : 0);
})();
