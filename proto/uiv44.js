// Version 44 : navigation fine (aucun navire sur la terre affichée), silhouettes seules et à l'échelle au zoom détaillé,
// pointeurs de la carte, marqueurs écartés, message et règle sur téléphone. Usage : node uiv44.js [dossier captures]
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), D = process.argv[2] || '/tmp'; let bad = 0, n = 0;
  const need = (ok, m) => { n++; if (!ok) { bad++; console.log('ÉCHEC', m); } };
  // 1. routes sur les six théâtres : aucune case de terre traversée, même mer, temps de calcul
  {
    const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto('file://' + __dirname + '/t.html'); await p.waitForTimeout(500);
    const r = await p.evaluate(() => {
      const A = __S, out = {}; let s = 11; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
      for (const [sc, th] of [['l12', 'natl'], ['c1', 'eu'], ['g3', 'gn'], ['a4', 'ad'], ['e6', 'em'], ['m6', 'ml']]) {
        A.newGame(5, { sc, deck: A.SC[sc].rec, contested: true }); const N = A.navGet(), o = { th: A.thId, n: 0, nul: 0, terre: 0, debut: 0, ms: 0, max: 0 }; const cnt = new Map(); for (let i = 0; i < N.comp.length; i += 7) if (!N.blk[i]) cnt.set(N.comp[i], (cnt.get(N.comp[i]) || 0) + 1); const main = [...cnt].sort((x, y) => y[1] - x[1])[0][0];
        for (let k = 0; k < 80; k++) {
          let a, c; do { a = [rnd() * 1440, rnd() * 900] } while (A.NB(a[0], a[1]) || N.comp[Math.floor(a[1]) * 1440 + Math.floor(a[0])] !== main);
          do { c = [rnd() * 1440, rnd() * 900] } while (A.NB(c[0], c[1]) || N.comp[Math.floor(c[1]) * 1440 + Math.floor(c[0])] !== main);
          const t0 = performance.now(), rt = A.route(a[0], a[1], c[0], c[1]), dt = performance.now() - t0; o.ms += dt; o.max = Math.max(o.max, dt); o.n++;
          if (!rt || !rt.length) { o.nul++; continue }
          if (!A.navLos(a[0], a[1], rt[0].x, rt[0].y, 0, 0)) o.debut++;
          for (let i = 1; i < rt.length; i++) if (!A.navLos(rt[i - 1].x, rt[i - 1].y, rt[i].x, rt[i].y, 0, 0)) { o.terre++; break }
        }
        o.ms = +(o.ms / o.n).toFixed(1); o.max = Math.round(o.max); out[sc] = o
      }
      return out
    });
    for (const [sc, o] of Object.entries(r)) need(o.nul === 0 && o.terre === 0 && o.debut === 0 && o.ms < 30, `route ${o.th} : ${o.n} trajets, nuls ${o.nul}, segment sur la terre ${o.terre}, départ ${o.debut}, ${o.ms} ms en moyenne (max ${o.max})`);
    // 2. un destroyer envoyé de l'autre côté d'une terre ne la traverse jamais et arrive
    const g = await p.evaluate(() => {
      const A = __S; A.newGame(7, { sc: 'l12', deck: A.SC.l12.rec, contested: false, guided: false }); const S = A.s; S.running = false; S.sched = {}; S.pendingK = []; S.sc = { ...S.sc, dyn: 0 };
      const u = S.units.find(x => x.type === 'frigate'); u.x = 640; u.y = 640; u.path = []; const tg = [855, 650]; A.orderMove(u, tg[0], tg[1]); let land = 0, mn = 1e9;
      for (let i = 0; i < 4000 && (u.path.length || i < 5); i++) { A.step(.1); if (A.NB(u.x, u.y)) land++; mn = Math.min(mn, Math.hypot(u.x - tg[0], u.y - tg[1])) }
      return { land, mn: +mn.toFixed(1), left: u.path.length }
    });
    need(g.land === 0 && g.mn < 4, 'destroyer de la mer du Nord vers le Skagerrak : jamais sur la terre, arrivée à ' + g.mn + ' (' + JSON.stringify(g) + ')');
    // 3. un navire ne naît jamais sur la terre
    const sp = await p.evaluate(() => { const A = __S; A.newGame(9, { sc: 'l12', deck: A.SC.l12.rec }); const s = A.addShip({ kindI: 1, x: 846, y: 459, path: [], v: 10 }, 'civil', true); return [A.NB(s.x, s.y), +s.x.toFixed(1), +s.y.toFixed(1)] });
    need(sp[0] === 0, 'navire créé à Trondheim, à terre, recalé en mer : ' + sp);
    need(!errs.length, 'erreurs : ' + errs.slice(0, 2));
    await p.close();
  }
  for (const [lang, vw, mob] of [['fr', { width: 1440, height: 900 }, 0], ['en', { width: 390, height: 844 }, 1]]) {
    const tag = lang + vw.width, errs = [];
    const ctx = await b.newContext({ viewport: vw, isMobile: !!mob, hasTouch: !!mob, locale: lang }), p = await ctx.newPage();
    await p.route(/fonts\.g/, r => r.abort()); p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/^Failed to load resource/.test(m.text())) errs.push(m.text()); });
    await p.goto('file://' + __dirname + '/t.html'); await p.waitForTimeout(600);
    const st = (f, a) => p.evaluate(f, a), tick = (ms = 400) => p.waitForTimeout(ms);
    await st(l => { try { localStorage.removeItem('seuil.fz') } catch (_) { } const A = __S; A.setLang(l); A.home(false); document.getElementById('over').hidden = true; A.newGame(11, { sc: 'asw', deck: A.SC.asw.rec, contested: false, guided: false, timer: 'easy' }); const S = A.s; S.sched = {}; S.pendingK = []; S.sc = { ...S.sc, dyn: 0 }; S.running = false; A.applyCamX(); for (let i = 0; i < 100; i++)A.step(.1); A.redraw() }, lang);
    await tick(500);
    // 4. zoom détaillé : silhouette seule, plus de symbole tactique ; taille liée au zoom
    const det = async f => { await st(f => { const A = __S, u = A.s.units.find(x => x.type === 'frigate'); A.cam.z = A.minZ() * f; A.cam.x = u.x; A.cam.y = u.y; A.redraw() }, f); await tick(); return st(() => { const e = [...document.querySelectorAll('#fzl .fogline-marker')].find(x => /DDG-1/.test(x.getAttribute('aria-label') || '')); if (!e) return null; const im = e.querySelector('.unit-silhouette img'), r = im && im.getBoundingClientRect(); return { lv: e.dataset.zoomLevel, sil: !!im, sym: !!e.querySelector('.tactical-symbol'), w: r ? Math.round(r.width) : 0 } }) };
    const t2 = await det(2), d3 = await det(3), d12 = await det(12), d40 = await det(40);
    need(t2 && t2.lv === 'tactical' && t2.sym && !t2.sil, tag + ' vue tactique : symbole tactique ' + JSON.stringify(t2));
    need(d3 && d3.lv === 'detail' && d3.sil && !d3.sym, tag + ' vue détaillée : silhouette seule, sans symbole ' + JSON.stringify(d3));
    need(d3.w >= 22 && d3.w <= d12.w && d12.w <= d40.w && d40.w <= 64 && d40.w > d3.w, tag + ` silhouette qui grandit avec le zoom : ${d3.w} → ${d12.w} → ${d40.w} px`);
    await p.screenshot({ path: D + '/v44-detail-' + tag + '.png' });
    // avion : sa propre silhouette ; contact seulement détecté : symbole gardé
    const air = await st(() => { const A = __S, S = A.s, u = S.units.find(x => x.type === 'recon'); u.x = 700; u.y = 400; u.ready = 0; const s = S.ships.find(x => !x.ais && !x.gone) || S.ships[0]; s.visible = true; s.seen = true; s.ev = []; s.cls = null; s.trk = 0; s.idd = false; s.located = false; s.ais = false; s.x = 712; s.y = 404; A.cam.z = A.minZ() * 8; A.cam.x = 705; A.cam.y = 402; A.redraw(); return s.id });
    await tick();
    const a2 = await st(id => { const m = [...document.querySelectorAll('#fzl .fogline-marker')], u = m.find(x => /P8-1/.test(x.getAttribute('aria-label') || '')), c = m.find(x => (x.getAttribute('aria-label') || '').startsWith(id + ' ')); return { u: u && (u.querySelector('img') || {}).dataset, us: u && !!u.querySelector('.tactical-symbol'), c: c && !!c.querySelector('.tactical-symbol'), ci: c && !!c.querySelector('img') } }, air);
    need(a2.u && a2.u.sil === 'avion' && !a2.us, tag + ' P-8A en vue détaillée : silhouette d’avion ' + JSON.stringify(a2));
    need(a2.c && !a2.ci, tag + ' contact seulement détecté en vue détaillée : symbole gardé, aucune silhouette ' + JSON.stringify(a2));
    // 5. deux unités au même point : marqueurs écartés, trait de rappel
    const sp = await st(() => { const A = __S, S = A.s, a = S.units.find(x => x.type === 'patrol'), c = S.units.filter(x => x.type === 'patrol')[1] || S.units.find(x => x.type === 'frigate'); a.x = c.x = 760; a.y = c.y = 560; a.path = []; c.path = []; A.cam.z = A.minZ() * 1.8; A.cam.x = 760; A.cam.y = 560; for (let i = 0; i < 30; i++)A.redraw(); return [a.id, c.id] });
    await tick(600);
    const gap = await st(ids => { const m = ids.map(i => [...document.querySelectorAll('#fzl .fogline-marker')].find(x => (x.getAttribute('aria-label') || '').startsWith(i + ' '))).map(e => e.getBoundingClientRect()); return Math.round(Math.hypot(m[0].x - m[1].x, m[0].y - m[1].y)) }, sp);
    need(gap >= 18, tag + ' deux unités au même point : marqueurs écartés de ' + gap + ' px');
    // 6. pointeurs (souris seulement)
    if (!mob) {
      const cur = async (x, y) => { await p.mouse.move(x, y); await tick(120); return st(() => { const c = document.getElementById('c'); return [c.dataset.cur, getComputedStyle(c).cursor.slice(0, 12)] }) };
      await st(() => { const A = __S, S = A.s; S.sel = null; A.cam.z = A.minZ() * 1.2; A.cam.x = 700; A.cam.y = 600; A.redraw() }); await tick();
      const pt = await st(() => { const A = __S, c = document.getElementById('c').getBoundingClientRect(), f = (x, y) => { const s = A.toScr(x, y); return [c.left + s[0], c.top + s[1]] }; return { sea: f(560, 520), land: f(640, 760), u: (() => { const u = A.s.units.find(x => x.type === 'frigate'); u.x = 600; u.y = 560; u._dx = u._dy = 0; A.redraw(); return f(600, 560) })() } });
      await tick();
      const c0 = await cur(...pt.sea);
      need(c0[0] === 'map' && /url/.test(c0[1]), tag + ' pointeur de visée sur la mer : ' + c0);
      const c1 = await cur(...pt.u);
      need(c1[0] === 'pick', tag + ' pointeur de cible sur une unité : ' + c1);
      await st(() => { const A = __S; A.s.sel = A.s.units.find(x => x.type === 'frigate'); A.redraw() });
      const c2 = await cur(...pt.sea), c3 = await cur(...pt.land);
      need(c2[0] === 'move' && c3[0] === 'nogo', tag + ' destroyer choisi : déplacement sur la mer, refus sur la terre : ' + c2[0] + ' / ' + c3[0]);
      await st(() => { const A = __S; A.patrolStart ? 0 : 0; window.__pe = 1 });
      const c4 = await p.evaluate(() => { const A = __S, u = A.s.units.find(x => x.type === 'frigate'); A.s.sel = u; return !!document.querySelector('[data-a="patrol"]') });
      const pb = p.locator('[data-a="patrol"]'); if (await pb.count()) { await pb.first().click(); await tick(); const c5 = await cur(...pt.sea); need(c5[0] === 'place', tag + ' tracé de patrouille : pointeur de placement : ' + c5[0]); await p.keyboard.press('Escape'); } else need(true, '');
      // une case de terre cliquée avec le destroyer : il s'arrête en mer
      await st(() => { const A = __S; A.s.sel = A.s.units.find(x => x.type === 'frigate'); A.s.units.find(x => x.type === 'frigate').patrol = null }); await p.mouse.click(...pt.land); await tick();
      const mv = await st(() => { const A = __S, u = A.s.units.find(x => x.type === 'frigate'), e = u.path[u.path.length - 1]; return e ? [A.NB(e.x, e.y), u.path.length] : [9, 0] });
      need(mv[0] === 0 && mv[1] > 0, tag + ' ordre sur la terre : destination recalée en mer ' + mv);
    }
    // 7. téléphone : le message ne passe plus sous la rangée de zoom
    if (mob) {
      await st(() => { const A = __S; A.s.log.unshift({ t: 'T1', m: 'Message de test assez long pour la carte', warn: false }); A.redraw() }); await tick();
      const ov = await st(() => { const h = document.getElementById('hint'), z = document.getElementById('zoom'); if (!h || h.hidden) return 'masqué'; const a = h.getBoundingClientRect(), bs = [...z.querySelectorAll('.btn')].map(x => x.getBoundingClientRect()); return bs.some(r => a.left < r.right && r.left < a.right && a.top < r.bottom && r.top < a.bottom) ? 'chevauche ' + JSON.stringify([Math.round(a.top), Math.round(a.bottom), h.style.bottom, bs.map(r => Math.round(r.top))]) : 'ok' });
      need(ov === 'ok' || ov === 'masqué', tag + ' message de la carte hors de la rangée de zoom : ' + ov);
    }
    const chip = await st(() => { const e = document.getElementById('fzLvl'), cs = getComputedStyle(e); return [cs.paddingLeft, cs.overflow] });
    need(chip[0] !== '18px' && chip[1] === 'hidden', tag + ' indicateur de niveau sans le style de la légende : ' + chip);
    const misc = await st(() => [document.documentElement.scrollWidth > innerWidth, [...(window.__missing || [])]]);
    need(!misc[0], tag + ' pas de défilement horizontal'); need(!misc[1].length, tag + ' textes manquants : ' + misc[1].join(','));
    need(!errs.length, tag + ' erreurs : ' + errs.slice(0, 3).join(' | '));
    await ctx.close();
  }
  console.log(bad ? `${bad} échec(s) sur ${n}` : `uiv44 : ${n} contrôles, tous réussis`); await b.close(); process.exit(bad ? 1 : 0);
})();
