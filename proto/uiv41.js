// Version 41 : bibliothèque FOGLINE symboles et zoom. Usage : node uiv41.js [dossier captures]
// Français à 1440 px puis anglais à 390 px : niveaux de zoom et tailles, sélection, identification après preuve,
// silhouettes et caps, légende (temps suspendu puis rendu), clavier, débordement, cinq appartenances,
// sous-marin caché jamais révélé, bandeau permanent absent, erreurs console.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), D = process.argv[2] || '/tmp'; let bad = 0, n = 0;
  const need = (ok, m) => { n++; if (!ok) { bad++; console.log('ÉCHEC', m); } };
  for (const [lang, vw, mob] of [['fr', { width: 1440, height: 900 }, 0], ['en', { width: 390, height: 844 }, 1]]) {
    const tag = lang + vw.width, errs = [];
    const ctx = await b.newContext({ viewport: vw, isMobile: !!mob, hasTouch: !!mob, locale: lang }), p = await ctx.newPage();
    await p.route(/fonts\.g/, r => r.abort()); p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/^Failed to load resource/.test(m.text())) errs.push(m.text()); }); p.on('requestfailed', r => { if (!/fonts\.g/.test(r.url())) errs.push('requête : ' + r.url().slice(0, 80)); }); /* polices Google coupées volontairement : hors ligne */
    await p.goto('file://' + __dirname + '/t.html'); await p.waitForTimeout(600);
    const st = (f, a) => p.evaluate(f, a), tick = (ms = 350) => p.waitForTimeout(ms);
    await st(l => { try { localStorage.removeItem('seuil.fz') } catch (_) { } const A = __S; A.setLang(l); A.home(false); document.getElementById('over').hidden = true; A.newGame(11, { sc: 'asw', deck: A.SC.asw.rec, contested: false, guided: false, timer: 'easy' }); const S = A.s; S.sched = {}; S.pendingK = []; S.sc = { ...S.sc, dyn: 0 }; S.running = false; A.applyCamX(); for (let i = 0; i < 200; i++) A.step(.1); A.redraw(); }, lang);
    await tick(500);
    // 0. bandeau permanent retiré, mention fictive gardée dans la barre de titre
    const fict = await st(() => { const f = document.getElementById('fict'), g = document.querySelector('#hud .fxtag'); return [f ? getComputedStyle(f).display : 'none', g ? g.textContent : '', g ? g.getBoundingClientRect().width : 0] });
    need(fict[0] === 'none' && /FICTI/.test(fict[1]) && fict[2] > 20, tag + ' bandeau absent, mention dans la barre : ' + fict);
    // 1. niveaux de zoom avec les vrais boutons + et −, tailles en pixels écran
    const size = () => st(() => { const lv = __S.fzLevel(), m = [...document.querySelectorAll('#fzl .fogline-marker:not([hidden])')], u = m.find(e => e.dataset.affiliation === 'friendly' && !e.classList.contains('has-map-profile')), s = u && u.querySelector('.marker-art>.tactical-symbol'), pr = m.find(e => e.classList.contains('has-map-profile')), bd = pr && pr.querySelector('.unit-affiliation .tactical-symbol'), chip = document.getElementById('fzLvl'); return { lv, f: +__S.fzFactor().toFixed(2), btn: u ? Math.round(u.getBoundingClientRect().width) : 0, sym: s ? Math.round(s.getBoundingClientRect().width) : 0, sil: pr ? Math.round(pr.getBoundingClientRect().width) : 0, badge: bd ? Math.round(bd.getBoundingClientRect().width) : 0, chip: chip.textContent, chipH: Math.round(chip.getBoundingClientRect().height), n: m.length } });
    await st(() => { const A = __S, u = A.s.units.find(x => x.type === 'frigate'); A.cam.z = A.minZ() * 1.02; A.cam.x = u.x; A.cam.y = u.y; A.redraw(); }); await tick();
    const lv = [await size()];
    for (let i = 0; i < 6; i++) { await p.click('[data-a=zoom][data-v="1.3"]'); await tick(250); lv.push(await size()); }
    const by = k => lv.find(x => x.lv === k);
    const ov = by('overview'), ta = by('tactical'), de = by('detail');
    need(ov && ov.btn === 44 && ov.sym === 30, tag + ' vue d\'ensemble 30 px / 44 px : ' + JSON.stringify(ov));
    need(ta && ta.btn === 48 && ta.sym === 38 && ta.f >= 1.6 && ta.f < 2.4, tag + ' vue tactique 38 px / 48 px : ' + JSON.stringify(ta));
    /* v44 : silhouette seule, de 22 à 64 px selon le zoom et le type, plus de badge */need(de && de.f >= 2.4 && de.sil >= 22 && de.sil <= 64 && !de.badge, tag + ' vue détaillée : silhouette de 22 à 64 px sans badge : ' + JSON.stringify(de));
    need(lv.every(x => x.chipH >= 44) && /Détail|Detail/.test(de.chip) && /Ensemble|Overview/.test(ov.chip), tag + ' indicateur de niveau affiché, 44 px : ' + lv.map(x => x.chip).join(' / '));
    await p.screenshot({ path: D + '/v41-detail-' + tag + '.png' });
    for (let i = 0; i < 6; i++) { await p.click('[data-a=zoom][data-v="0.77"]'); await tick(200); }
    const back = await size(); need(back.lv === 'overview', tag + ' retour en vue d\'ensemble : ' + back.lv);
    // 2. déplacement de carte conservé (glisser sur un endroit vide)
    const pan = await st(async () => { const c = document.getElementById('c').getBoundingClientRect(); return { x: __S.cam.x, cx: c.left + c.width * .5, cy: c.top + c.height * .8 } });
    await p.mouse.move(pan.cx, pan.cy); await p.mouse.down(); await p.mouse.move(pan.cx - 120, pan.cy, { steps: 6 }); await p.mouse.up(); await tick();
    const pan2 = await st(() => __S.cam.x); need(Math.abs(pan2 - pan.x) > 5, tag + ' déplacement de carte : ' + pan.x.toFixed(0) + ' → ' + pan2.toFixed(0));
    // 3. sélection d'une unité par un vrai clic sur son marqueur (zoom tactique)
    await st(() => { const A = __S, u = A.s.units.find(x => x.type === 'frigate'); A.cam.z = A.minZ() * 2; A.cam.x = u.x; A.cam.y = u.y; A.s.sel = null; A.redraw(); }); await tick();
    const mk = await st(() => { const e = [...document.querySelectorAll('#fzl .fogline-marker')].find(x => /DDG-1/.test(x.getAttribute('aria-label'))), r = e.getBoundingClientRect(); return { x: r.left + r.width / 2 + 8, y: r.top + r.height / 2 - 7, aria: e.getAttribute('aria-label') } });
    if (!mob) await p.mouse.click(mk.x, mk.y); else await p.touchscreen.tap(mk.x, mk.y); await tick(400);
    const sel = await st(() => { const S = __S.s, e = [...document.querySelectorAll('#fzl .fogline-marker')].find(x => /DDG-1/.test(x.getAttribute('aria-label'))); return [S.sel && S.sel.id, e.getAttribute('aria-pressed'), e.dataset.labelHidden || ''] });
    need(sel[0] === 'DDG-1' && sel[1] === 'true' && sel[2] === '', tag + ' sélection par clic à 10 px du centre (cible 48 px) et étiquette prioritaire : ' + sel + ' · ' + mk.aria);
    if (mob) { const nb = p.locator('[data-a=mnav][data-v=dos]'); if (await nb.count()) { await nb.first().click(); await tick(); } }
    const sheet = await st(() => { const r = document.getElementById('rightC'); const i = r && r.querySelector('h2 .fzi'); return i ? i.getAttribute('aria-label') : '' });
    need(/Frégate|Frigate/.test(sheet), tag + ' symbole dans la fiche d\'unité : ' + sheet);
    if (mob) { const nb = p.locator('[data-a=mnav][data-v=map]'); if (await nb.count()) { await nb.first().click(); await tick(); } }
    // 4. identification après preuve, sans jamais lire la vérité
    const id = await st(() => {
      const A = __S, S = A.s, o = {}; S.sel = null;
      const s = S.ships.find(x => !x.ais && !x.gone) || S.ships.find(x => !x.ais); s.visible = true; s.seen = true; s.ev = []; s.cls = null; s.trk = 0; s.idd = false; s.located = false; s.hact = false; s.exMark = false;
      o.t0 = JSON.stringify(A.fzShip(s)); const tr0 = s.truth; s.truth = tr0 === 'raider' ? 'civil' : 'raider'; o.t0b = JSON.stringify(A.fzShip(s)); s.truth = tr0;
      A.addEv(s, 'visual'); o.t1 = JSON.stringify(A.fzShip(s));
      A.classify(s, 'raider'); o.t2 = JSON.stringify(A.fzShip(s)); o.prof = A.fzProfile(A.fzShip(s));
      A.cam.z = A.minZ() * 3; A.cam.x = s.x; A.cam.y = s.y; A.redraw(); o.id = s.id; return o
    });
    await tick(400);
    const idm = await st(i => { const e = [...document.querySelectorAll('#fzl .fogline-marker')].find(x => (x.getAttribute('aria-label') || '').startsWith(i + ' ')); return e ? [e.dataset.type, e.dataset.affiliation, !!e.querySelector('img[data-sil="fregate"]')] : null }, id.id);
    const j = x => JSON.parse(x);
    need(j(id.t0).classification === 'detected' && id.t0 === id.t0b, tag + ' contact seulement détecté : non classifié et indépendant de la vérité : ' + id.t0);
    need(j(id.t1).classification === 'identified' && j(id.t1).knownType === 'navire_surface', tag + ' preuve à vue : navire de surface identifié : ' + id.t1);
    need(j(id.t2).affiliation === 'hostile' && j(id.t2).knownType === 'fregate' && id.prof === 'fregate' && idm && idm[0] === 'fregate' && idm[1] === 'hostile' && idm[2], tag + ' classé navire armé : hostile, silhouette en vue détaillée : ' + id.t2 + ' · ' + idm);
    // 5. sous-marin caché : jamais révélé avant une preuve
    const sub = await st(() => {
      const A = __S, S = A.s, o = {}; let c; for (let k = 0; k < 40; k++) { c = A.startCrisis('sub'); if (c.truth === 'sousmarin') break; c.closed = true; }
      A.cam.z = A.minZ() * 3; A.cam.x = c.sb.x; A.cam.y = c.sb.y; c.sb.seen = false; c.located = false; A.redraw(); A.fzSync();
      const find = () => [...document.querySelectorAll('#fzl .fogline-marker')].find(x => (x.getAttribute('aria-label') || '').includes(c.id));
      o.hidden = !find() && !A.fzItems('detail').some(i => i.o === c);
      c.located = true; c.sb.seen = true; A.fzSync(); let e = find();
      o.seen = e ? { type: e.dataset.type, aff: e.dataset.affiliation, img: !!e.querySelector('img'), aria: e.getAttribute('aria-label'), html: e.innerHTML } : null;
      c.truth = 'bio'; e && (e.dataset.sigtest = '1'); const sig = JSON.stringify(A.fzSub(c)); c.truth = 'sousmarin'; o.same = sig === JSON.stringify(A.fzSub(c));
      A.classify(c, 'sousmarin'); A.fzSync(); e = find(); o.cls = e ? [e.dataset.type, e.dataset.affiliation, !!e.querySelector('img[data-sil="sous_marin"]')] : null; return o
    });
    need(sub.hidden, tag + ' sous-marin non détecté : aucun marqueur');
    need(sub.seen && sub.seen.type === 'inconnu' && sub.seen.aff === 'unknown' && !sub.seen.img && !/Sous-marin ·|Submarine ·/.test(sub.seen.aria) && sub.same, tag + ' écho non classé : symbole non classifié, sans silhouette, indépendant de la vérité : ' + JSON.stringify(sub.seen && { t: sub.seen.type, a: sub.seen.aff, aria: sub.seen.aria }));
    need(sub.cls && sub.cls[0] === 'sous_marin' && sub.cls[1] === 'hostile' && sub.cls[2], tag + ' après classement par le joueur : sous-marin, silhouette : ' + sub.cls);
    // 6. cinq appartenances, quatre silhouettes chargées
    const aff = await st(() => { const A = __S, o = {}; ['friendly', 'neutral', 'hostile', 'unfriendly', 'unknown'].forEach(a => { const d = document.createElement('div'); d.innerHTML = A.tacticalSymbol('navire_surface', a); o[a] = [d.firstChild.style.color, d.innerHTML.includes('stroke-dasharray')] }); o.map = [...new Set([...document.querySelectorAll('#fzl .fogline-marker')].map(e => e.dataset.affiliation))].sort().join(','); return o });
    need(aff.friendly[0] === 'rgb(127, 209, 244)' && aff.neutral[0] === 'rgb(152, 211, 131)' && aff.hostile[0] === 'rgb(255, 119, 119)' && aff.unfriendly[0] === 'rgb(242, 181, 68)' && aff.unknown[0] === 'rgb(244, 223, 120)' && aff.unfriendly[1] && !aff.hostile[1], tag + ' cinq couleurs, cadre suspect pointillé : ' + JSON.stringify(aff));
    // 7. caps : formule et silhouette tournée selon le déplacement projeté
    const caps = await st(() => [0, 90, 180, 270, 360].map(c => __S.fzCapAngle(c, 0)));
    need(caps.join() === '-90,0,90,180,270', tag + ' caps cardinaux 0/90/180/270/360 → ' + caps);
    const rot = await st(async () => {
      const A = __S, S = A.s, u = S.units.find(x => x.type === 'frigate'), out = {}; A.cam.z = A.minZ() * 3; S.sel = null;
      for (const [k, dx, dy] of [['E', 1, 0], ['N', 0, -1], ['W', -1, 0], ['S', 0, 1]]) { u.path = []; A.cam.x = u.x; A.cam.y = u.y; A.fzSync(); u.x += dx * 2; u.y += dy * 2; A.fzSync(); const e = [...document.querySelectorAll('#fzl .fogline-marker')].find(x => /DDG-1/.test(x.getAttribute('aria-label'))); out[k] = Math.round(parseFloat(e.style.getPropertyValue('--profile-angle'))); out[k + 'b'] = e.querySelector('.unit-affiliation') ? getComputedStyle(e.querySelector('.unit-affiliation')).transform : '?' }
      return out
    });
    need(rot.E === 0 && rot.N === -90 && Math.abs(rot.W) === 180 && rot.S === 90 && rot.Eb === '?', tag + ' silhouette tournée (est 0, nord −90, ouest 180, sud 90), sans badge depuis la version 44 : ' + JSON.stringify(rot));
    // 8. légende : ouverte au clavier depuis l'indicateur, temps suspendu puis rendu
    await st(() => { __S.s.running = true; document.getElementById('fzLvl').focus(); }); await p.keyboard.press('Enter'); await tick(500);
    const leg = await st(() => { const o = document.getElementById('over'); return { open: !o.hidden, run: __S.s.running, cats: o.querySelectorAll('.fzgrid>div').length, aff: o.querySelectorAll('.fzleg .lg2')[0].children.length, sil: [...o.querySelectorAll('.fzsil img')].map(i => i.complete && i.naturalWidth > 0).filter(Boolean).length, w: [document.documentElement.scrollWidth, innerWidth] } });
    await p.screenshot({ path: D + '/v41-legende-' + tag + '.png' });
    need(leg.open && leg.run === false && leg.cats === 29 && leg.aff === 5 && leg.sil === 9 && leg.w[0] <= leg.w[1], tag + ' légende : 29 catégories, 5 appartenances, 9 silhouettes chargées, temps suspendu : ' + JSON.stringify(leg));
    await p.click('[data-a=legclose]'); await tick(300);
    const after = await st(() => [document.getElementById('over').hidden, __S.s.running]); need(after[0] && after[1] === true, tag + ' fermeture : temps rendu : ' + after);
    await st(() => { __S.s.running = false });
    // 9. clavier : un marqueur prend le focus, Entrée le sélectionne, Tab passe au suivant
    const kb = await st(() => { const A = __S, S = A.s, u = S.units.find(x => x.type === 'frigate'); S.sel = null; A.cam.z = A.minZ() * 2; A.cam.x = u.x; A.cam.y = u.y; A.redraw(); A.fzSync(); const e = [...document.querySelectorAll('#fzl .fogline-marker:not([hidden])')].find(x => /LCS-1|LCS-2/.test(x.getAttribute('aria-label'))); e.focus(); return e.getAttribute('aria-label') });
    await p.keyboard.press('Enter'); await tick(300);
    const kb2 = await st(() => [__S.s.sel && __S.s.sel.id, document.activeElement && document.activeElement.className, getComputedStyle(document.activeElement).outlineStyle]);
    await p.keyboard.press('Tab'); const kb3 = await st(() => document.activeElement && document.activeElement.className);
    need(/LCS/.test(kb2[0] || '') && /fogline-marker/.test(kb2[1]) && kb2[2] !== 'none' && /fogline-marker/.test(kb3 || ''), tag + ' clavier : focus visible, Entrée sélectionne, Tab au marqueur suivant : ' + kb + ' · ' + kb2 + ' · ' + kb3);
    // 9 bis. bouées et torpille dessinées avec les pictogrammes de la bibliothèque, sans erreur
    const bt = await st(() => { const A = __S, S = A.s, u = S.units.find(x => x.type === 'frigate'); S.buoys.push({ x: u.x + 30, y: u.y, r: 52, until: S.t + 60, act: 0 }, { x: u.x - 30, y: u.y, r: 70, until: S.t + 30, act: 1 }); (S.torps = S.torps || []).push({ x0: u.x, y0: u.y, x: u.x + 10, y: u.y, tx: u.x + 40, ty: u.y, c: { closed: false }, t0: S.t, end: S.t + 12 }); A.redraw(); return S.buoys.length });
    await tick(500); await st(() => { const S = __S.s; S.torps = []; S.buoys = []; __S.redraw(); });
    need(bt >= 2, tag + ' bouées et torpille dessinées : ' + bt);
    // 10. liste des contacts avec symboles, débordement, menu
    const cont = await st(() => { const A = __S; return A.s.ships.filter(s => s.seen && !s.ais).length });
    await st(() => { const A = __S; A.s.sel = null; A.redraw(); }); if (mob) { const nb = p.locator('[data-a=mnav][data-v=crises]'); if (await nb.count()) { await nb.first().click(); await tick(); } }
    await p.evaluate(() => { const b = document.querySelector('[data-a=ltab][data-v=cont]'); if (b) b.click(); }); await tick(400);
    const ci = await st(() => document.querySelectorAll('#leftC .fzi').length);
    need(cont === 0 || ci > 0, tag + ' symboles dans la liste des contacts : ' + ci);
    const wd = await st(() => [document.documentElement.scrollWidth, innerWidth]); need(wd[0] <= wd[1], tag + ' pas de défilement horizontal : ' + wd);
    const miss = await st(() => __S.missing()); need(!miss.length, tag + ' aucun texte manquant : ' + miss.join(','));
    need(!errs.length, tag + ' aucune erreur console : ' + errs.slice(0, 3).join(' | '));
    await ctx.close();
  }
  await b.close(); console.log(bad ? bad + ' échec(s) sur ' + n : 'tout passe (' + n + ' contrôles)'); process.exit(bad ? 1 : 0);
})();
