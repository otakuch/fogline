// Banc des mécaniques navales (version 47). Usage : node navlab.js [parties de hasard par mission]
// Partie A : un test ciblé par mécanique. Partie B : parties jouées par le script avec des ordres navals au hasard, contrôles à chaque seconde.
const { chromium } = require('playwright');
const N = +(process.argv[2] || 4);
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1440, height: 860 } }), errs = [];
  p.on('pageerror', e => errs.push(e.message + ' @ ' + (e.stack || '').split('\n')[1]));
  await p.goto('file://' + __dirname + '/seuil-prototype.html'); await p.addScriptTag({ path: __dirname + '/bots.js' }); await p.addScriptTag({ content: 'window.__setS=(o,c,si,f)=>{S=o;CABLES=c;SITES=si;CFG=f};window.__getS=()=>[S,CABLES,SITES,CFG];' }); await p.waitForTimeout(300);
  const A_ = process.env.SKIPA ? { R: [], missing: [] } : await p.evaluate(() => {
    const A = __S, R = [], ok = (c, m, d) => R.push([!!c, m, c ? '' : JSON.stringify(d === undefined ? '' : d).slice(0, 300)]);
    const run = s => { let n = Math.round(s * 10); while (n-- > 0 && !A.s.over) A.step(.1) };
    const G = (sc, o = {}) => { A.newGame(o.seed || 7, { sc, deck: A.SC[sc].rec, contested: false, ...o }); const S = A.s; S.running = false; S.tokens = 6; return S };
    const U = id => A.s.units.find(u => u.id === id), rec = id => A.allAir().find(r => r.id === id), tm = id => A.allTeams().find(x => x.id === id);
    const sea = (o, d, ang = 0) => { for (let k = 0; k < 24; k++) { const a = ang + k * Math.PI / 12, x = o.x + Math.cos(a) * d, y = o.y + Math.sin(a) * d; if (A.seaOK(x, y) && A.route(o.x, o.y, x, y)) return { x, y } } return null };
    const waitFor = (f, s) => { let n = Math.round(s * 10); while (n-- > 0 && !A.s.over) { if (f()) return true; A.step(.1) } return !!f() };
    const deep = (o, d) => { for (const dd of [d, d * 1.5, d * 2, d * 3]) for (let k = 0; k < 24; k++) { const a = k * Math.PI / 12, x = o.x + Math.cos(a) * dd, y = o.y + Math.sin(a) * dd; if (A.seaOK(x, y) && A.buoyPts({ x, y }, 'tri', 0).every(([px, py]) => A.seaOK(px, py)) && A.route(o.x, o.y, x, y)) return { x, y } } return null };
    const logs = () => A.s.log.map(l => l.m).join(' | ');
    const click = (u, a, v) => { A.s.sel = u; const d = document.createElement('div'); d.innerHTML = nvEmbHtml(u) + navHtml(); document.body.appendChild(d); const bt = [...d.querySelectorAll('[data-a]')].find(x => x.dataset.a === a && (v === undefined || x.dataset.v === v)); const st = bt ? (bt.disabled ? 'disabled' : 'on') : 'absent', why = bt && bt.querySelector('small') ? bt.querySelector('small').textContent : ''; if (bt && !bt.disabled) bt.click(); d.remove(); return { st, why } };
    // 1. cycle d'un hélicoptère : 6 s de déploiement, mission, retour, 6 s de récupération, 45 s de remise en condition
    { const S = G('c1'), s = U('LCS-1'), r = s.air[0];
      const c0 = click(s, 'nvl', r.id), h = U(r.id); ok(c0.st === 'on' && h && r.st === 'deploying', 'hélico : décollage par le bouton', c0);
      run(3); ok(r.st === 'deploying' && Math.hypot(h.x - s.x, h.y - s.y) < 1, 'hélico : immobile pendant le déploiement', [r.st]);
      run(3.2); ok(r.st === 'deployed', 'hélico : en mission après 6 s', r.st);
      const q = sea(s, 70); A.orderMove(h, q.x, q.y); run(8); ok(Math.hypot(h.x - s.x, h.y - s.y) > 20, 'hélico : obéit à un ordre de mouvement');
      const c1 = click(h, 'helorec', ''); ok(c1.st === 'on' && h.rtb && r.st === 'returning', 'hélico : rappel par le bouton', [c1, r.st]);
      ok(waitFor(() => r.st === 'recovering', 90), 'hélico : récupération entamée au bâtiment', r.st); const t0 = A.s.t;
      ok(waitFor(() => r.st === 'aboard', 8) && A.s.t - t0 >= 5.8, 'hélico : récupération de 6 s', A.s.t - t0);
      ok(!U(r.id), 'hélico : plus d’unité sur la carte une fois à bord');
      const c2 = click(s, 'nvl', r.id); ok(c2.st === 'disabled' && /\d+ s/.test(c2.why), 'hélico : remise en condition expliquée', c2);
      run(46); const c3 = click(s, 'nvl', r.id); ok(c3.st === 'on', 'hélico : redécolle après 45 s', c3); }
    // 2. plafond d'appareils en l'air
    { const S = G('l12'), d = U('DDG-1'), l = U('LCS-1'); A.nvLaunch(d, 'any', 'DDG-1-H1'); A.nvLaunch(d, 'any', 'DDG-1-H2');
      const c = click(l, 'nvl', 'LCS-1-H1'); ok(c.st === 'disabled' && c.why.length > 5 && !rec('LCS-1-H1').unit, 'plafond : 3e appareil refusé avec raison (2 en local régional)', c);
      ok(A.allAir().filter(r => r.unit).length === 2, 'plafond : 2 appareils en l’air au plus'); }
    // 3. bouées finies, jamais rechargées en vol ni à l'appontage
    { const S = G('c1'), s = U('LCS-1'), r = s.air[0], h = A.nvLaunch(s, 'buoy'); run(6.5); const b0 = S.buoys.length, q = deep(s, 50);
      const o1 = A.buoyOrder(h, q.x, q.y); ok(o1, 'bouées : ordre de pose accepté'); waitFor(() => !h.task, 60);
      ok(Math.round(h.buoys) === 0 && S.buoys.length - b0 === 2, 'bouées : 2 cercles posés avec 8 bouées (4 par cercle)', [h.buoys, S.buoys.length - b0]);
      ok(!A.buoyOrder(h, q.x + 5, q.y), 'bouées : nouvelle pose refusée à stock vide');
      h.rtb = true; waitFor(() => r.st === 'aboard', 120); ok(r.buoys === 0, 'bouées : pas de recharge à l’appontage', r.buoys);
      run(46); ok(!A.nvLaunch(s, 'buoy') && /bou|buoy/i.test(airWhy(s, 'buoy')), 'bouées : décollage pour poser refusé, raison donnée', airWhy(s, 'buoy'));
      ok(click(s, 'nvres', r.id).st === 'absent', 'bouées : pas de ravitaillement proposé sans ravitailleur prévu au profil'); }
    // 4. ravitaillement explicite par un ravitailleur alloué (asw, avec un Lewis and Clark)
    { const fleet = [{ cls: 'arleigh_burke', cfg: 'std' }, { cls: 'lewis_clark', cfg: 'std' }, { cls: 'virginia', cfg: 'std' }, { cls: 'lcs_freedom', cfg: 'suw' }];
      const S = G('asw', { fleet }), d = U('DDG-1'), L = S.units.find(u => u.stock && u.stock.spareBuoys0 > 0);
      ok(!!L && !S.fleetFix, 'ravitaillement : flotte avec ravitailleur acceptée', S.fleetSel);
      if (L) { const r = rec('DDG-1-H1'), h = A.nvLaunch(d, 'buoy', r.id); run(6.5); const q = deep(d, 50); A.buoyOrder(h, q.x, q.y); waitFor(() => !h.task, 60); const used = r.buoys0 - Math.round(h.buoys); ok(used > 0, 'ravitaillement : bouées posées avant recharge', used);
        h.rtb = true; waitFor(() => r.st === 'aboard', 120); L.x = d.x + 8; L.y = d.y; const sp0 = L.stock.spareBuoys;
        const c = click(d, 'nvres', r.id); ok(c.st === 'on' && r.buoys === r.buoys0 && L.stock.spareBuoys === sp0 - used, 'ravitaillement : bouées complétées, stock du ravitailleur décompté', [c, r.buoys, L.stock.spareBuoys, sp0, used]);
        ok(r.readyAt > S.t + 15, 'ravitaillement : prend du temps (20 s)');
        const row = nvExpRows().find(x => x[0] === 'nv.exp.buoy'); ok(row && row[1].includes(r.id + ' ' + used + '/'), 'ravitaillement : bilan des bouées utilisées juste après recharge', row);
        L.x = d.x + 200; ok(click(d, 'nvres', r.id).st !== 'on', 'ravitaillement : refusé loin du ravitailleur'); } }
    // 5. torpilles comptées
    { const S = G('asw'), d = U('DDG-1'), c = A.startCrisis('sub'), r = rec('DDG-1-H1'), h = A.nvLaunch(d, 'torp', r.id); run(6.5);
      A.torpLaunch(c, h); A.torpLaunch(c, h); ok(h.torp === 0, 'torpilles : 2 tirées, stock à 0', h.torp);
      h.x = c.zone.x; h.y = c.zone.y; c.located = true; const ac = A.crisisActions(c).filter(a => /torp/i.test(a.id) && a.ok);
      const hasOther = A.allAir().some(x => x.id !== r.id && x.kind === 'mh60r' && x.torp > 0);
      ok(ac.every(a => !String(a.label).includes(r.id)), 'torpilles : l’appareil vide ne reçoit plus d’ordre de tir', ac.map(a => a.label)); }
    // 6. MH-60S : aucune action acoustique
    { const S = G('e6'), lp = U('LPD-1'); ok(!A.nvLaunch(lp, 'buoy') && !A.nvLaunch(lp, 'dip') && !A.nvLaunch(lp, 'torp'), 'MH-60S : refus des décollages acoustiques');
      ok(/MH-60S|acoustique|acoustic/i.test(airWhy(lp, 'dip')), 'MH-60S : raison affichée', airWhy(lp, 'dip'));
      const c = A.startCrisis('sub'); const ac = A.crisisActions(c).filter(a => a.ok && /bou|buoy|sonar|tremp|dip/i.test(a.label + a.id));
      ok(!ac.some(a => /LPD|H1|H2/.test(a.label)), 'MH-60S : aucune action acoustique proposée avec un appareil de soutien', ac.map(a => a.id + ':' + a.label)); }
    // 7. équipes depuis un bâtiment : 8 s, plafond, observation, récupération à 25 au plus
    { const S = G('e6'), lp = U('LPD-1'), ah = U('AH-1'), x1 = tm('LPD-1-T1'), x2 = tm('LPD-1-T2'), x3 = tm('AH-1-T1');
      const c0 = click(lp, 'tdep', x1.id); ok(c0.st === 'on' && x1.st === 'deploying', 'équipe : déploiement par le bouton', c0); run(7.5); ok(x1.st === 'deploying', 'équipe : encore en déploiement à 7,5 s'); run(.7); ok(x1.st === 'deployed', 'équipe : déployée après 8 s', x1.st);
      A.teamDeploy(x2, lp); run(8.2); const c1 = click(ah, 'tdep', x3.id); ok(c1.st === 'disabled' && c1.why.length > 5 && x3.st === 'aboard', 'équipe : 3e déploiement refusé au plafond de 2', c1);
      const q = sea(lp, 60); A.orderMove(lp, q.x, q.y); run(25); ok(!A.teamRecover(x1, lp), 'équipe : reprise refusée à plus de 25');
      A.orderMove(lp, x1.x, x1.y); waitFor(() => Math.hypot(lp.x - x1.x, lp.y - x1.y) < 20, 60); const c2 = click(lp, 'trec', x1.id);
      ok(c2.st === 'on' && x1.st === 'recovering', 'équipe : reprise par le bouton à portée', c2); run(8.2); ok(x1.st === 'aboard' && x1.carrier === 'LPD-1', 'équipe : de retour à bord après 8 s', x1.st);
      // reprise par un autre bâtiment : l'équipe change de bord
      ah.x = x2.x + 5; ah.y = x2.y; ok(A.teamRecover(x2, ah), 'équipe : reprise par un autre bâtiment'); run(8.2); ok(x2.st === 'aboard' && x2.carrier === 'AH-1', 'équipe : transférée sur AH-1', [x2.st, x2.carrier]);
      const c3 = click(ah, 'tdep', x2.id); ok(c3.st === 'on' && x2.st === 'deploying', 'équipe : redéployable depuis son nouveau bord', c3);
      // observation près d'une crise
      let c = null; for (const k of ['site', 'incursion', 'seabed', 'cyber']) { G('e6'); c = A.startCrisis(k); if (c.hyp && c.zone) break; c = null }
      if (c) { const lp2 = U('LPD-1'), y = tm('LPD-1-T3'), z = sea(c.zone, 15) || c.zone; lp2.x = z.x; lp2.y = z.y; const e0 = c.ev.length; A.teamDeploy(y, lp2); run(8.2); ok(c.ev.length > e0 && c.ev.some(e => e.kind === 'team'), 'équipe : observation versée au dossier (' + c.type + ')', [c.ev.length, e0]) } else ok(false, 'équipe : aucune crise avec dossier et zone pour tester l’observation') }
    // 8. équipe héliportée, rappel bloqué, reprise, appontage
    { const S = G('e6'), lp = U('LPD-1'), x = tm('LPD-1-T1'), c0 = click(lp, 'nvlt', 'LPD-1-H1|' + x.id), h = U('LPD-1-H1');
      ok(c0.st === 'on' && h && x.st === 'embarked' && x.carrier === h.id, 'héliporté : décollage avec l’équipe', [c0, x.st]);
      ok(click(h, 'tdrop', x.id).st === 'disabled', 'héliporté : dépose refusée pendant le déploiement de l’appareil'); run(6.5);
      const q = sea(lp, 60); A.orderMove(h, q.x, q.y); run(10); const c1 = click(h, 'tdrop', x.id); ok(c1.st === 'on' && x.st === 'deploying' && h.teamOut === x.id, 'héliporté : dépose de l’équipe', c1);
      const hx = h.x; run(4); ok(Math.hypot(h.x - hx, h.y - h.y) < .5, 'héliporté : stationnaire pendant la dépose'); run(4.5); ok(x.st === 'deployed', 'héliporté : équipe déployée');
      const c2 = click(h, 'helorec', ''); ok(c2.st === 'disabled' && /T1/.test(c2.why) && !h.rtb, 'héliporté : retour bloqué tant que l’équipe est dehors, raison donnée', c2);
      h.rtb = true; run(2); ok(!h.rtb && /T1/.test(logs()), 'héliporté : un rappel forcé est refusé et journalisé');
      const rp = A.recallAll(); ok(rp.rows.some(r => r.id === h.id && r.k === 'team') && rp.rows.some(r => r.id === x.id && r.k === 'tok'), 'rappel général : appareil bloqué, équipe reprise', rp.rows);
      run(8.5); ok(x.st === 'embarked' && !h.teamOut, 'héliporté : équipe remontée', [x.st, h.teamOut]);
      const c3 = click(h, 'helorec', ''); ok(c3.st === 'on', 'héliporté : retour possible une fois l’équipe à bord', c3); ok(waitFor(() => x.st === 'aboard', 120) && x.carrier === 'LPD-1', 'héliporté : équipe à bord du bâtiment après appontage', [x.st, x.carrier]);
      const nb = S.log.filter(l => /bloqu|blocked/i.test(l.m)).length; ok(nb <= 4, 'héliporté : journal non saturé par le blocage', nb); }
    // 9. carburant épuisé avec une équipe dehors
    { const S = G('e6'), lp = U('LPD-1'), x = tm('LPD-1-T1'), h = A.nvLaunch(lp, 'carry', 'LPD-1-H1', x); run(6.5); const qf = sea(lp, 60); A.orderMove(h, qf.x, qf.y); waitFor(() => !h.path.length, 30); A.teamDeploy(x, h); run(8.5); h.fuel = 4; const n0 = S.log.length; run(30);
      const nb = S.log.slice(n0).filter(l => /bloqu|blocked/i.test(l.m)).length; ok(nb <= 3, 'carburant : pas de message répété à chaque pas', nb);
      ok(x.strand && !h.teamOut, 'carburant : l’équipe est laissée sur place et signalée', [x.strand, h.teamOut, x.st]);
      ok(waitFor(() => rec('LPD-1-H1').st === 'aboard' || rec('LPD-1-H1').st === 'lost', 120), 'carburant : l’appareil rentre', rec('LPD-1-H1').st); }
    // 10. capacités selon la configuration
    { G('m6'); const c = A.startCrisis('mine'), sw = A.crisisActions(c).find(a => a.id === 'sweep'); ok(sw && sw.ok, 'MCM : dragage proposé avec un LCS MCM ou un Avenger', sw && sw.label);
      G('c1'); const c2 = A.startCrisis('mine'), sw2 = A.crisisActions(c2).find(a => a.id === 'sweep'); ok(sw2 && !sw2.ok && /mine/i.test(sw2.why || ''), 'MCM : refusé avec un LCS SUW, raison donnée', sw2 && [sw2.label, sw2.why]);
      G('e6'); const c3 = A.startCrisis('evac', 'PORT'), ev = A.crisisActions(c3).find(a => a.id === 'evacs'); ok(ev && ev.ok, 'évacuation : proposée avec un bâtiment de transport', ev && [ev.label, ev.why]);
      G('c1'); const c4 = A.startCrisis('evac', 'PORT'), ev2 = A.crisisActions(c4).find(a => a.id === 'evacs'); ok(ev2 && !ev2.ok && (ev2.why || '').length > 5, 'évacuation : refusée sans capacité de transport, raison donnée', ev2 && [ev2.label, ev2.why]);
      G('f2'); const c5 = A.startCrisis('seabed'), so = A.crisisActions(c5).find(a => a.id === 'sonar'); ok(so && so.ok, 'fonds marins : relevé proposé avec un bâtiment hydrographique', so && [so.label, so.why]);
      let c6 = null; for (const sc of ['g3', 'e6', 'c1', 'a4']) { G(sc); if (A.cables.length) { c6 = A.startCrisis('seabed'); if (c6.type === 'seabed' && !A.s.units.some(u => A.capU(u, 'sonar') || A.capU(u, 'seabed_survey'))) break; c6 = null } }
      const so2 = c6 && A.crisisActions(c6).find(a => a.id === 'sonar'); ok(!c6 || (so2 && !so2.ok && (so2.why || '').length > 5), 'fonds marins : refusé sans moyen adapté, raison donnée', so2 && [so2.label, so2.why]); }
    // 11. écoute par le sous-marin
    { const S = G('asw'), c = A.startCrisis('sub'), a = A.crisisActions(c).find(x => x.id === 'ssn'), sn = U('SSN-1'); ok(a && a.ok, 'sous-marin : écoute proposée', a && a.label);
      if (a) { A.doAct(a); ok(sn.listen === c.id, 'sous-marin : ordre d’écoute pris'); const a2 = A.crisisActions(c).find(x => x.id === 'ssn'); ok(a2 && !a2.ok, 'sous-marin : ordre déjà donné signalé');
        ok(waitFor(() => S.buoys.some(b => b.ssn === sn.id), 240) || c.closed, 'sous-marin : écoute active une fois dans la zone', [Math.round(Math.hypot(sn.x - c.zone.x, sn.y - c.zone.y)), c.zone.r]); }
      const S2 = G('asw'); run(30); ok(!S2.buoys.some(b => b.ssn), 'sous-marin : pas d’écoute sans ordre'); }
    // 12. perte d'un bâtiment avec appareil et équipe dehors
    { const S = G('e6'), lp = U('LPD-1'), x = tm('LPD-1-T1'), h = A.nvLaunch(lp, 'carry', 'LPD-1-H1', x); run(6.5); A.hitUnit(lp, 200); run(1); ok(!U('LPD-1') || lp.hp <= 0, 'perte : bâtiment perdu');
      ok(waitFor(() => rec('LPD-1-H1').st === 'lost' || rec('LPD-1-H1').st === 'aboard', 200), 'perte : l’appareil finit perdu', rec('LPD-1-H1').st);
      ok(['deployed', 'lost'].includes(x.st), 'perte : équipe embarquée déposée ou perdue, jamais orpheline', x.st);
      ok(['LPD-1-T2', 'LPD-1-T3'].every(i => tm(i).st === 'lost'), 'perte : équipes restées à bord perdues'); ok(!document.querySelector('.err'), 'perte : pas d’erreur affichée'); }
    // 13. sauvegarde au milieu d'un vol et d'une dépose
    { const S = G('e6', { seed: 11 }), lp = U('LPD-1'), x = tm('LPD-1-T1'); window.__noAutoSave = 1; run(20); A.nvLaunch(lp, 'carry', 'LPD-1-H1', x); run(7); A.teamDeploy(x, U('LPD-1-H1')); run(3);
      ok(A.saveGame(true), 'sauvegarde : écrite en vol'); const sig = () => JSON.stringify([A.s.t.toFixed(1), A.allAir().map(r => [r.id, r.st, r.buoys]), A.allTeams().map(x => [x.id, x.st, x.carrier]), A.s.units.map(u => [u.id, u.x.toFixed(2), u.y.toFixed(2)]), A.s.tokens, A.s.crises.length]);
      run(40); const s1 = sig(); const e = A.loadGame(); ok(!e && A.s.running === false, 'sauvegarde : reprise en pause', e); run(40); const s2 = sig(); ok(s1 === s2, 'sauvegarde : même suite après reprise', [s1.slice(0, 150), s2.slice(0, 150)]); }
    // 15. MQ-8 : identification, ni transport ni bouées
    { const allow = ['c1', 'f2', 'asw', 'l12', 'g3', 'a4', 'e6', 'm6'].filter(m => A.NV.validateFleetSelection([{ cls: 'lcs_freedom', cfg: 'suw_mq8' }], A.nvProf(m)).ok);
      const S = G(allow[0] || 'c1', { fleet: [{ cls: 'lcs_freedom', cfg: 'suw_mq8' }] }), s = U('LCS-1'), m = s && s.air && s.air.find(r => r.kind === 'mq8');
      ok(allow.length ? !!m : (S.fleetFix && !m), allow.length ? 'MQ-8 : configuration acceptée là où le profil l’active' : 'MQ-8 : configuration historique refusée par tous les profils (aucun ne l’active)', [allow, S.fleetSel]); if (m) { const d = document.createElement('div'); d.innerHTML = nvEmbHtml(s); ok(![...d.querySelectorAll('[data-a=nvlt]')].some(b => b.dataset.v.startsWith(m.id)), 'MQ-8 : pas de transport d’équipe proposé');
        const h = A.nvLaunch(s, 'any', m.id); run(6.5); ok(h && Math.round(h.buoys || 0) === 0 && !A.buoyOrder(h, s.x + 30, s.y), 'MQ-8 : aucune pose de bouées'); ok(A.fzUnit(h).sil === 'drone', 'MQ-8 : dessiné comme un drone'); } }
    // 16. groupe aéronaval : tension annoncée et chasseurs embarqués
    { const S = G('a4', { fleet: A.NV.groupMembers('csg') }); ok(!S.fleetFix && S.tension >= .3 - 1e-9 && S.units.some(u => u.type === 'fighter') && /0[.,]3/.test(logs()), 'groupe aéronaval : +0,3 de tension journalisé, chasseurs présents', [S.fleetFix, S.tension, S.units.map(u => u.type)]); }
    // 17. continuité du commandement par un bâtiment de commandement
    { const ms = ['c1', 'f2', 'asw', 'l12', 'g3', 'a4', 'e6', 'm6'].filter(m => A.NV.validateFleetSelection(A.NV.groupMembers('continuity'), A.nvProf(m)).ok);
      if (ms.length) { const S = G(ms[0], { fleet: A.NV.groupMembers('continuity') }); S.svc.c2.down = 99; ok(!A.s.units.some(u => u.caps && u.caps.includes('c2')) || !c2Cut(), 'commandement : relais du bâtiment de commandement quand le réseau tombe', ms[0]) } else ok(true, 'commandement : aucun profil n’autorise le groupe de continuité'); }
    // 18. ordres de dragage, d'évacuation et de relevé menés jusqu'au bout
    { for (const [sc, k, id, arg] of [['m6', 'mine', 'sweep'], ['e6', 'evac', 'evacs', 'PORT'], ['f2', 'seabed', 'sonar']]) { const S = G(sc); S.tokens = 6; const c = A.startCrisis(k, arg), a = A.crisisActions(c).find(x => x.id === id); const done = a && A.doAct(a);
      const fin = waitFor(() => c.closed || (id === 'sonar' && c.ev.some(e => e.kind === 'sonar')), 240); ok(done && fin, k + ' : ordre ' + id + ' mené à terme', [!!a, done, c.closed, c.ev.map(e => e.kind)]) } }
    // 19. flotte invalide refusée au lancement, flotte recommandée à la place
    { const S = G('c1', { fleet: A.NV.groupMembers('csg') }); ok(S.fleetFix && A.NV.validateFleetSelection(S.fleetSel, A.nvProf('c1')).ok, 'flotte : sélection hors profil remplacée par la recommandation', S.fleetSel); }
    // 20. ravitaillement prévu au profil : la composition recommandée doit le permettre
    { const bad = ['c1', 'f2', 'asw', 'l12', 'g3', 'a4', 'e6', 'm6'].filter(m => { const pr = A.nvProf(m); if (!pr.loadout.resupply) return false; const sel = A.NV.recommendFleet(pr).ships; return !sel.some(q => q.cls === pr.loadout.resupply) });
      ok(!bad.length, 'ravitaillement : prévu au profil et présent dans la composition recommandée', bad); }
    // 21. lutte sous-marine par unité : sous-marin, bâtiment, hélicoptère, avion
    { const subC = (sc, truth = 'sousmarin') => { let c; for (let k = 0; k < 40; k++) { c = A.startCrisis('sub'); if (c.truth === truth) break; c.closed = true } return c };
      const put = (u, o, dx) => { const q = A.nearSea(o.x + dx, o.y); u.x = q[0] * 4 + 2; u.y = q[1] * 4 + 2; u.path = [] };
      const uacts = (u, c) => A.crisisActions(c).filter(a => a.unit === u.id), sheet = u => { const d = document.createElement('div'); d.innerHTML = aswUHtml(u); return [...d.querySelectorAll('button')] };
      let S = G('asw'), c = subC(), sn = U('SSN-1'); S.tokens = 9;
      const far = uacts(sn, c).find(a => a.id === 'ping:SSN-1'); put(sn, c.sb, 400); const far2 = uacts(sn, c).find(a => a.id === 'ping:SSN-1');
      ok(far2 && !far2.ok && /milles|nm/.test(far2.why), 'sous-marin : sonar actif refusé hors de portée, raison donnée', far2 && far2.why);
      put(sn, c.sb, 30); const pg = uacts(sn, c).find(a => a.id === 'ping:SSN-1'); ok(pg && pg.ok && sheet(sn).some(b => b.dataset.v === c.id + '|ping:SSN-1' && !b.disabled), 'sous-marin : sonar actif proposé sur sa fiche', pg && pg.label);
      sn.thr = 2; const h0 = c.hold; A.doAct(pg); run(5); ok(c.located && c.alertU > S.t && sn.exposedU > S.t, 'sous-marin : un sonar actif à portée localise le contact et alerte l’adversaire', [c.hold, h0, c.located]);
      const pg2 = uacts(sn, c).find(a => a.id === 'ping:SSN-1'); ok(pg2 && !pg2.ok && /s/.test(pg2.why), 'sous-marin : sonar en recharge, raison donnée', pg2 && pg2.why); run(16); ok(uacts(sn, c).find(a => a.id === 'ping:SSN-1').ok, 'sous-marin : sonar de nouveau prêt après 20 s');
      const tp = uacts(sn, c).find(a => a.id === 'torpu:SSN-1'); ok(tp && tp.ok && tp.escTo === 4, 'sous-marin : torpille proposée, passage en Engager annoncé', tp && tp.label);
      const t0 = sn.torp; A.doAct(tp); ok(waitFor(() => !!c.torpOn || c.closed, 20) && sn.torp === t0 - 1, 'sous-marin : torpille lancée après autorisation, stock décompté', [sn.torp, t0, S.posture]);
      ok(waitFor(() => c.closed || !c.torpOn, 20), 'sous-marin : torpille résolue (touché ou manqué)', [c.closed, c.out]); ok(S.torpN >= 1, 'sous-marin : lancement compté au bilan');
      // écoute passive : vitesse lente, sans alerte
      S = G('asw'); c = subC(); sn = U('SSN-1'); put(sn, c.sb, 45); sn.thr = 0; run(10); ok(c.hold > 3 && !(c.alertU > S.t), 'sous-marin : écoute passive à vitesse lente, sans alerter', [c.hold, c.alertU]);
      S = G('asw'); c = subC(); sn = U('SSN-1'); put(sn, c.sb, 45); sn.thr = 2; sn.path = [{ x: sn.x + 1, y: sn.y }]; run(4); ok(c.hold < 1, 'sous-marin : à vitesse rapide, l’écoute passive porte moins loin', c.hold);
      // bâtiment : sonar de coque
      S = G('asw'); S.tokens = 9; c = subC(); const d = U('DDG-1'); put(d, c.sb, 18); const pd = uacts(d, c).find(a => a.id === 'ping:DDG-1'); ok(pd && pd.ok, 'destroyer : sonar actif de coque proposé'); A.doAct(pd); run(5); ok(c.located, 'destroyer : contact localisé par le sonar de coque');
      const td = uacts(d, c).find(a => a.id === 'torpu:DDG-1'); ok(td && td.ok, 'destroyer : torpille proposée à portée', td && [td.label, td.why]);
      // hélicoptère : sonar trempé en stationnaire, puis torpille
      S = G('asw'); S.tokens = 9; c = subC(); const d2 = U('DDG-1'); put(d2, c.sb, 60); const h = A.nvLaunch(d2, 'any', 'DDG-1-H1'); run(1); ok(!uacts(h, c).find(a => a.id === 'ping:DDG-1-H1').ok, 'hélicoptère : sonar trempé refusé pendant le décollage');
      run(6); A.orderMove(h, c.sb.x + 10, c.sb.y); waitFor(() => !h.path.length, 30); const hp = uacts(h, c).find(a => a.id === 'ping:DDG-1-H1'); ok(hp && hp.ok, 'hélicoptère : sonar trempé proposé sur sa fiche', hp && [hp.label, hp.why]);
      A.doAct(hp); const hx = h.x, hy = h.y; A.orderMove(h, hx + 50, hy); run(0.1); h.path = []; h.task = { kind: 'dipu', until: S.t + 8 }; h.hold = S.t + 8; run(4); ok(Math.hypot(h.x - hx, h.y - hy) < 2, 'hélicoptère : stationnaire pendant le sonar trempé'); run(5); ok(c.located, 'hélicoptère : contact localisé par le sonar trempé', c.hold);
      ok(!h.task, 'hélicoptère : libéré après le sonar trempé');
      const ht = uacts(h, c).find(a => a.id === 'torpu:DDG-1-H1'); ok(ht && ht.ok, 'hélicoptère : torpille proposée', ht && [ht.label, ht.why]); S.posture = 4; const ht2 = uacts(h, c).find(a => a.id === 'torpu:DDG-1-H1'); const tt = h.torp; A.doAct(ht2); ok(waitFor(() => !!c.torpOn, 30) && h.torp === tt - 1, 'hélicoptère : torpille larguée', [h.torp, tt]);
      // avion de patrouille : envoyé larguer
      S = G('asw'); S.tokens = 9; S.posture = 4; c = subC(); c.located = true; c.hold = 9; A.subZone && 0; const p8 = S.units.find(u => u.type === 'recon'); if (p8) { const pa = uacts(p8, c).find(a => a.id === 'torpu:' + p8.id); ok(pa && pa.ok && /Envoyer|Send/.test(pa.label), 'avion : envoyé larguer une torpille', pa && pa.label); A.doAct(pa); ok(waitFor(() => !!c.torpOn, 120), 'avion : torpille larguée sur zone') }
      // fausse cible : torpille comptée à tort
      S = G('asw'); S.tokens = 9; S.posture = 4; c = subC('asw', 'bio'); sn = U('SSN-1'); put(sn, c.sb, 30); c.located = true; c.hold = 9; c.zone = { x: c.sb.x, y: c.sb.y, r: 45 }; const fb = S.torpBad || 0; A.doAct(uacts(sn, c).find(a => a.id === 'torpu:SSN-1')); waitFor(() => c.closed, 30); ok(c.closed && (S.torpBad || 0) === fb + 1, 'torpille sur un contact biologique : tir à tort compté');
      // MH-60S : pas de lutte sous-marine
      S = G('e6'); c = subC(); const lp = U('LPD-1'), hs = A.nvLaunch(lp, 'any'); run(7); ok(!aswUHtml(hs) && !uacts(hs, c).length, 'MH-60S : aucune action de lutte sous-marine');
      // dossier de crise : actions d'unité renvoyées vers les fiches
      S = G('asw'); c = subC(); S.sel = c; renderRight(); const tx = document.getElementById('right').innerText; ok(!/SSN-1 · /.test(tx) && /Lutte sous-marine|Anti-submarine/.test(tx), 'dossier : les actions d’unité restent sur les fiches, avec un renvoi', tx.slice(0, 200));
      // mission sans registre naval : frégate et hélicoptère classiques
      const leg = Object.keys(A.SC).find(k => !A.nvProf(k) && (A.SC[k].rec || []).includes('frigate') && JSON.stringify(A.SC[k].script || []).includes('sub'));
      if (leg) { G(leg); c = subC(); const fr = A.s.units.find(u => u.type === 'frigate'); put(fr, c.sb, 30); ok(uacts(fr, c).some(a => a.id === 'ping:' + fr.id && a.ok), 'mission classique (' + leg + ') : sonar actif de la frégate') } }
    // 14. chaque bouton de bâtiment ou d'appareil a un libellé et, s'il est grisé, une raison
    { const bad = []; for (const sc of ['c1', 'f2', 'asw', 'l12', 'g3', 'a4', 'e6', 'm6']) { G(sc); run(1); A.s.units.filter(u => u.air || u.teams).forEach(u => { const d = document.createElement('div'); d.innerHTML = nvEmbHtml(u); d.querySelectorAll('button').forEach(bt => { const tx = bt.textContent.trim(); if (!tx || /undefined|NaN|\bnv\.[a-z]/.test(tx)) bad.push(sc + ' ' + u.id + ' ' + tx); if (bt.disabled && !bt.querySelector('small')) bad.push(sc + ' ' + u.id + ' sans raison : ' + tx) }) }) }
      ok(!bad.length, 'fiches : libellés complets et raisons des refus', bad.slice(0, 8)); }
    return { R, missing: A.missing() };
  });
  let fail = 0; A_.R.forEach(([o, m, d]) => { if (!o) fail++; console.log((o ? 'ok   ' : 'ÉCHEC') + ' ' + m + (o ? '' : ' ' + d)) });
  console.log('== partie A :', A_.R.length, 'contrôles,', fail, 'échec(s) ; textes manquants', JSON.stringify(A_.missing));
  // ---------- partie B : parties complètes, script de référence + ordres navals au hasard
  const B_ = await p.evaluate(N => {
    const A = __S, bad = {}, note = (k, sc, d) => { const o = bad[k] = bad[k] || { n: 0, sc: {}, d }; o.n++; o.sc[sc] = 1 };
    const VA = ['aboard', 'deploying', 'deployed', 'returning', 'recovering', 'lost'], VT = ['aboard', 'embarked', 'deploying', 'deployed', 'recovering', 'lost'], OUT = ['deploying', 'deployed', 'returning', 'recovering'];
    let rnd = 1; const rr = () => (rnd = (rnd * 16807) % 2147483647) / 2147483647, pick = L => L[Math.floor(rr() * L.length)];
    let lastLog = 0, lastT = 0, svN = 0; const clicks = {}, noEff = {};
    const sig = S => JSON.stringify([A.allAir().map(r => r.st + r.buoys + (r.readyAt || 0)), A.allTeams().map(x => x.st + x.carrier), S.units.map(u => u.id + u.rtb + (u.path || []).length + (u.listen || '')), S.tokens, S.log.length, S.recallN || 0]);
    const chk = (S, sc) => {
      if (!S.alloc) return; const ids = S.units.map(u => u.id); if (new Set(ids).size !== ids.length) note('identifiants d’unité en double', sc, ids);
      const air = A.allAir(), tms = A.allTeams();
      air.forEach(r => { if (!VA.includes(r.st)) note('état d’appareil invalide ' + r.st, sc); if (!(r.buoys >= 0) || r.buoys !== Math.round(r.buoys)) note('bouées invalides', sc, r); if (!(r.torp >= 0)) note('torpilles invalides', sc, r);
        const us = S.units.filter(u => u.rec === r.id && !u.recov); if (OUT.includes(r.st) && us.length !== 1) note('appareil dehors sans unité unique', sc, [r.id, r.st, us.length]); if (r.st === 'aboard' && us.length) note('appareil à bord encore sur la carte', sc, r.id);
        const u = us[0]; if (u && (u.buoys < 0 || u.torp < 0)) note('stock négatif en vol', sc); if (u && !Number.isFinite(u.fuel)) note('carburant invalide', sc) });
      if (A.NV.engagedCount(air) > S.alloc.maxAir) note('plafond d’appareils dépassé', sc, [A.NV.engagedCount(air), S.alloc.maxAir]);
      if (A.NV.engagedCount(tms) > S.alloc.maxTeams) note('plafond d’équipes dépassé', sc, [A.NV.engagedCount(tms), S.alloc.maxTeams]);
      tms.forEach(x => { if (!VT.includes(x.st)) note('état d’équipe invalide ' + x.st, sc); const car = S.units.find(u => u.id === x.carrier);
        if (x.st === 'embarked' && !(car && car.type === 'helo' && !car.recov)) note('équipe embarquée sans appareil', sc, [x.id, x.carrier]);
        if (x.st === 'aboard' && !(car && car.type !== 'helo')) note('équipe à bord sans bâtiment', sc, [x.id, x.carrier]);
        if (['deployed', 'deploying', 'recovering'].includes(x.st) && !Number.isFinite(x.x + x.y)) note('équipe sans position', sc) });
      S.units.filter(u => u.teamOut).forEach(h => { const x = tms.find(y => y.id === h.teamOut); if (!x || !['deploying', 'deployed', 'recovering'].includes(x.st)) note('appareil bloqué par une équipe absente', sc, [h.id, h.teamOut, x && x.st]) });
      S.units.forEach(u => { if (A.UT[u.type].naval && !A.UT[u.type].air && A.isDeep && !A.seaOK(u.x, u.y)) note('bâtiment sur la terre', sc, [u.id, u.type, Math.round(u.x), Math.round(u.y)]) });
      if (S.t - lastT >= 1) { const n = S.log.length - lastLog; if (n > 12) note('journal saturé (> 12 messages par seconde)', sc, S.log.slice(-3).map(l => l.m)); lastLog = S.log.length; lastT = S.t }
      for (const c of S.crises.filter(c => !c.closed)) for (const a of A.crisisActions(c)) { if (typeof a.label !== 'string' || /undefined|NaN/.test(a.label)) note('action sans libellé', sc, [c.type, a.id]); if (!a.ok && !(a.why && String(a.why).length > 2)) note('action grisée sans raison', sc, [c.type, a.id, a.label]) }
    };
    const actor = (base) => S => { base(S); if (!S.alloc || rr() < .35) return;
      const L = S.units.filter(u => (u.air || u.teams || u.rec) && A.UT[u.type]), carr = S.units.filter(h => h.type === 'helo' && !h.path.length && A.allTeams().some(x => (x.st === 'embarked' && x.carrier === h.id) || (x.st === 'deployed' && h.teamOut === x.id))), u = carr.length && rr() < .6 ? pick(carr) : pick(L); if (!u) return; S.sel = u;
      const d = document.createElement('div'); d.innerHTML = nvEmbHtml(u) + navHtml(); document.body.appendChild(d);
      const bs = [...d.querySelectorAll('[data-a]')].filter(x => !x.disabled && ['nvl', 'nvlt', 'tdep', 'tdrop', 'trec', 'nvres', 'helorec', 'nvall'].includes(x.dataset.a) && (x.dataset.a !== 'nvall' || rr() < .15));
      const bt = pick(bs); if (bt) { const k = bt.dataset.a, s0 = sig(S); bt.click(); clicks[k] = (clicks[k] || 0) + 1; if (sig(S) === s0) (noEff[k] = noEff[k] || []).push(S.sc.id + ' ' + u.id + ' ' + bt.textContent.trim().slice(0, 60)) }
      d.remove();
      if (u.type === 'helo' && rr() < .4 && !u.rtb) { const c = pick(S.crises.filter(c => !c.closed && c.zone)); const tg = c ? c.zone : null; if (tg) A.orderMove(u, tg.x + (rr() - .5) * 40, tg.y + (rr() - .5) * 40) }
      if (u.type === 'helo' && u.rec && (u.buoys || 0) >= 4 && !u.rtb && !u.task && rr() < .3) { const c = S.crises.find(c => !c.closed && c.type === 'sub' && c.zone) || S.crises.find(c => !c.closed && c.zone); if (c) { const x = c.zone.x + (rr() - .5) * 60, y = c.zone.y + (rr() - .5) * 60; if (A.seaOK(x, y)) A.buoyOrder(u, x, y) } }
      if (u.type === 'helo' && A.allTeams().some(x => x.st === 'embarked' && x.carrier === u.id) && !u.rtb && rr() < .5) { const c = pick(S.crises.filter(c => !c.closed && c.zone)); if (c) A.orderMove(u, c.zone.x, c.zone.y) }
      if (rr() < .15) { const c = pick(S.crises.filter(c => !c.closed && !c.choice)); if (c) { const ac = A.crisisActions(c).filter(a => a.ok && a.run); const a = pick(ac); if (a) A.doAct(a) } }
      if (!S.svT && S.t > 90 + rr() * 200) { S.svT = 1; const [oS, oC, oSi, oF] = window.__getS(), ser = X => { const L = X.log, sc = X.sc; X.log = []; X.sc = sc.id; const o = JSON.stringify(A.nvSer(X)); X.log = L; X.sc = sc; return o }, s0 = ser(oS); window.__noAutoSave = 1; if (!A.saveGame(true)) note('sauvegarde refusée en partie', S.sc.id); else { const e = A.loadGame(); if (e) note('reprise refusée', S.sc.id, e); else { const s1 = ser(A.s); if (s1 !== s0) { let i = 0; while (s0[i] === s1[i]) i++; note('état différent après sauvegarde et reprise', oS.sc.id, [s0.slice(Math.max(0, i - 80), i + 60), s1.slice(Math.max(0, i - 80), i + 60)]) } svN++ } } window.__setS(oS, oC, oSi, oF) }
      if (u.teams && rr() < .2) { const x = pick(A.allTeams().filter(y => y.st === 'deployed')); if (x) A.orderMove(u, x.x, x.y) }
      S.sel = null };
    const res = {}; let games = 0, unfinished = 0;
    for (const sc of ['c1', 'f2', 'asw', 'l12', 'g3', 'a4', 'e6', 'm6']) { const prof = A.nvProf(sc), fl = [null];
      for (const g of A.NAVAL_CAT.taskGroups) { const m = A.NV.groupMembers(g.id); if (m && A.NV.validateFleetSelection(m, prof).ok) fl.push(m) }
      res[sc] = { fleets: fl.length, ok: 0, n: 0 };
      for (let sd = 1; sd <= N; sd++) { const fleet = fl[(sd - 1) % fl.length]; rnd = sd * 7919 + sc.length; lastLog = 0; lastT = 0;
        const r = playGame(sd * 31 + 3, sc, { contested: true, fleet: fleet || undefined }, actor(mkBot()), chk); if (fleet && JSON.stringify(A.s.fleetSel) !== JSON.stringify(fleet.map(q => ({ cls: q.cls, cfg: q.cfg })))) note('flotte demandée non appliquée', sc, [fleet, A.s.fleetSel]); games++; if (!r.done) unfinished++; res[sc].n++; res[sc].ok += r.ok;
        const S = A.s; if (fleet && S.fleetFix) note('flotte de groupe valide remplacée au lancement', sc, fleet);
        try { const rows = nvExpRows(); if (rows.some(x => /undefined|NaN/.test(x[1]))) note('bilan naval incomplet', sc, rows) } catch (e) { note('bilan naval en erreur ' + e.message, sc) } } }
    const noE = {}; for (const [k, v] of Object.entries(noEff)) noE[k] = [v.length, v.slice(0, 3)];
    return { games, unfinished, bad, res, clicks, noEff: noE, svN, missing: A.missing() };
  }, N);
  console.log('== partie B :', B_.games, 'parties, non finies', B_.unfinished, '; clics', JSON.stringify(B_.clicks), '; sauvegardes et reprises en cours de partie', B_.svN);
  Object.entries(B_.res).forEach(([k, v]) => console.log('   ', k, 'flottes', v.fleets, 'réussite', v.ok + '/' + v.n));
  const bk = Object.entries(B_.bad); console.log('   défauts :', bk.length ? '' : 'aucun'); bk.sort((a, b) => b[1].n - a[1].n).forEach(([k, v]) => console.log('     ', k, v.n, Object.keys(v.sc).join(','), JSON.stringify(v.d || '').slice(0, 220)));
  console.log('   boutons actifs sans effet :', JSON.stringify(B_.noEff));
  console.log('   textes manquants', JSON.stringify(B_.missing), '; erreurs page', errs.length, errs.slice(0, 5).join(' || '));
  await b.close(); process.exit(fail || bk.length || errs.length ? 1 : 0);
})();
