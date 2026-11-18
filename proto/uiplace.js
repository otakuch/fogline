// Placement des unités avant la mission (17 novembre 2026), vrais clics sur la carte :
// jeu figé ; navire refusé à terre et accepté en mer ; unité terrestre refusée en mer et acceptée à terre ; hors zone refusé ;
// avion seulement sur une base amie ; drone partout dans la zone ; positions prévues ; validation, puis ordre de changement de situation.
// Français à 1440 px, anglais à 390 px. Usage : node uiplace.js [dossier captures]
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), errs = [], D = process.argv[2] || '/tmp', out = {}; let bad = 0;
  const need = (ok, m) => { if (!ok) { bad++; console.log('ÉCHEC', m); } };
  for (const [lang, vw, mob] of [['fr', { width: 1440, height: 900 }, 0], ['en', { width: 390, height: 844 }, 1]]) {
    const o = out[lang + vw.width] = {}, tag = lang + ' ' + vw.width + ' : ';
    const p = await (await b.newContext({ viewport: vw, isMobile: !!mob, hasTouch: !!mob, locale: lang })).newPage();
    await p.route(/fonts\.g/, r => r.abort()); p.on('pageerror', e => errs.push(e.message));
    await p.goto('file://' + __dirname + '/t.html'); await p.waitForTimeout(700);
    await p.evaluate(l => { __S.setLang(l); __S.brief('i5', false); }, lang); await p.waitForTimeout(300);
    await p.locator('[data-a="begin"]').first().click(); await p.waitForTimeout(600);
    o.phase = await p.evaluate(() => ({ placing: !!__S.s.placing, over: document.getElementById('over').hidden, panneau: !document.getElementById('placeP').hidden, t0: __S.s.t }));
    need(o.phase.placing && o.phase.over && o.phase.panneau, tag + 'phase de placement absente');
    await p.waitForTimeout(1200);
    o.fige = await p.evaluate(() => __S.s.t === 0 && !__S.s.running); need(o.fige, tag + 'le jeu tourne pendant le placement');
    // choisir un point visible de la carte, non couvert par un panneau, selon une condition
    const find = (id, kind) => p.evaluate(([id, kind]) => {
      const A = __S, S = A.s, u = S.units.find(x => x.id === id), Z = A.placeZone(), cv = document.getElementById('c'), r = cv.getBoundingClientRect(), L = [];
      for (let x = 0; x <= 1440; x += 6) for (let y = 0; y <= 900; y += 6) {
        const inZ = x >= Z.x0 && x <= Z.x1 && y >= Z.y0 && y <= Z.y1, sea = A.seaOK(x, y);
        const ok = kind === 'land' ? inZ && !sea : kind === 'sea' ? inZ && sea : kind === 'out' ? !inZ && sea : kind === 'farsea' ? inZ && sea && A.friendBases().every(n => Math.hypot(A.P[n][0] - x, A.P[n][1] - y) > Math.max(60, 40 / A.cam.z)) : false;
        if (!ok) continue; const [sx, sy] = A.toScr(x, y); if (sx < 8 || sy < 8 || sx > r.width - 8 || sy > r.height - 8) continue;
        const e = document.elementFromPoint(r.left + sx, r.top + sy); if (e !== cv) continue;
        if (A.pickAt(sx, sy)) continue; L.push({ x, y, cx: r.left + sx, cy: r.top + sy, d: Math.hypot(x - u.x, y - u.y) });
      }
      L.sort((a, b) => a.d - b.d); return L[Math.min(L.length - 1, 3)] || null;
    }, [id, kind]);
    const sel = async id => { const l = p.locator(`[data-a="plsel"][data-v="${id}"]`); await l.scrollIntoViewIfNeeded(); await l.click(); };
    const pos = id => p.evaluate(id => { const u = __S.s.units.find(x => x.id === id); return { x: Math.round(u.x), y: Math.round(u.y), msg: __S.s.placeMsg }; }, id);
    const tryAt = async (id, kind) => { const pt = await find(id, kind); if (!pt) return { pas_de_point: kind }; const a = await pos(id); await p.mouse.click(pt.cx, pt.cy); await p.waitForTimeout(150); const z = await pos(id); return { bouge: a.x !== z.x || a.y !== z.y, msg: z.msg, vers: [pt.x, pt.y], dans: [z.x, z.y] }; };
    const ids = await p.evaluate(() => { const S = __S.s, f = t => (S.units.find(u => u.type === t) || {}).id; return { ship: f('frigate'), land: f('battery') || f('guard'), air: f('recon') || f('fighter'), drone: f('drone') || f('armed') }; });
    o.unites = ids;
    // navire
    await sel(ids.ship); o.navire_terre = await tryAt(ids.ship, 'land'); o.navire_mer = await tryAt(ids.ship, 'sea'); o.navire_hors_zone = await tryAt(ids.ship, 'out');
    need(!o.navire_terre.bouge && /terre|land/i.test(o.navire_terre.msg || ''), tag + 'navire accepté à terre ' + JSON.stringify(o.navire_terre));
    need(o.navire_mer.bouge, tag + 'navire refusé en mer ' + JSON.stringify(o.navire_mer));
    if (!o.navire_hors_zone.pas_de_point) need(!o.navire_hors_zone.bouge && /zone/i.test(o.navire_hors_zone.msg || ''), tag + 'navire accepté hors zone');
    // unité terrestre
    await sel(ids.land); o.terre_mer = await tryAt(ids.land, 'sea'); o.terre_terre = await tryAt(ids.land, 'land');
    need(!o.terre_mer.bouge && /mer|sea/i.test(o.terre_mer.msg || ''), tag + 'unité terrestre acceptée en mer ' + JSON.stringify(o.terre_mer));
    need(o.terre_terre.bouge, tag + 'unité terrestre refusée à terre ' + JSON.stringify(o.terre_terre));
    // avion : refusé loin d'une base, accepté sur une base amie de la zone
    await sel(ids.air); o.avion_mer = await tryAt(ids.air, 'farsea');
    need(!o.avion_mer.bouge && /base/i.test(o.avion_mer.msg || ''), tag + 'avion accepté loin d’une base ' + JSON.stringify(o.avion_mer));
    const base = await p.evaluate(id => { const A = __S, S = A.s, u = S.units.find(x => x.id === id), Z = A.placeZone(), cv = document.getElementById('c'), r = cv.getBoundingClientRect(); const L = A.friendBases().filter(n => { const [x, y] = A.P[n]; return x >= Z.x0 && x <= Z.x1 && y >= Z.y0 && y <= Z.y1 && Math.hypot(x - u.x, y - u.y) > 5; }).map(n => { const [sx, sy] = A.toScr(A.P[n][0], A.P[n][1]); return { n, cx: r.left + sx, cy: r.top + sy, vis: sx > 8 && sy > 8 && sx < r.width - 8 && sy < r.height - 8 && document.elementFromPoint(r.left + sx, r.top + sy) === cv }; }).filter(q => q.vis); return L[0] || null; }, ids.air);
    if (base) { await p.mouse.click(base.cx, base.cy); await p.waitForTimeout(150); o.avion_base = { base: base.n, ...(await pos(ids.air)) }; need(new RegExp(base.n).test(o.avion_base.msg), tag + 'avion non basé sur ' + base.n); } else o.avion_base = 'aucune autre base visible';
    // drone : partout dans la zone
    if (ids.drone) { await sel(ids.drone); o.drone_terre = await tryAt(ids.drone, 'land'); need(o.drone_terre.bouge || o.drone_terre.pas_de_point, tag + 'drone refusé au-dessus de la terre'); }
    o.largeur = await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1); need(o.largeur, tag + 'défilement horizontal');
    await p.screenshot({ path: `${D}/place_${lang}${vw.width}.png` });
    // positions prévues, puis nouveau placement et validation
    const p0 = await p.evaluate(() => __S.s.units.map(u => [u.id, Math.round(u._p0 ? u._p0.x : u.x)]));
    await p.locator('[data-a="plreset"]').click(); await p.waitForTimeout(100);
    o.retour_prevu = await p.evaluate(p0 => p0.every(([id, x]) => Math.round(__S.s.units.find(u => u.id === id).x) === x), p0); need(o.retour_prevu, tag + 'positions prévues non rétablies');
    await sel(ids.ship); const fin = await tryAt(ids.ship, 'sea');
    await p.locator('[data-a="plok"]').click(); await p.waitForTimeout(300);
    o.apres = await p.evaluate(id => ({ placing: !!__S.s.placing, frago: !document.getElementById('over').hidden, x: Math.round(__S.s.units.find(u => u.id === id).x), y: Math.round(__S.s.units.find(u => u.id === id).y), journal: __S.s.log[0].m }), ids.ship);
    need(!o.apres.placing && o.apres.frago, tag + 'la validation n’ouvre pas l’ordre de changement de situation');
    need(o.apres.x === fin.dans[0] && o.apres.y === fin.dans[1], tag + 'position perdue à la validation');
    o.manque = await p.evaluate(() => __S.missing()); need(!o.manque.length, tag + 'textes manquants ' + o.manque.join());
    await p.close();
  }
  console.log(JSON.stringify(out, null, 1));
  need(!errs.length, 'erreurs de page : ' + errs.slice(0, 3).join(' | '));
  console.log(bad ? bad + ' échec(s)' : 'OK'); await b.close(); process.exit(bad ? 1 : 0);
})();
