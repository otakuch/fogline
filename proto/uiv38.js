// Version 38 : collisions, inertie, vitesses, règles réalistes et scénario de chasse sous-marine. Français à 1440 px puis anglais à 390 px.
// Usage : node uiv38.js [dossier captures]
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), errs = [], out = {}, D = process.argv[2] || '/tmp'; let bad = 0;
  const need = (ok, m) => { if (!ok) { bad++; console.log('ÉCHEC', m); } };
  const st = (p, f, a) => p.evaluate(f, a);
  for (const [lang, vw, mob] of [['fr', { width: 1440, height: 900 }, 0], ['en', { width: 390, height: 844 }, 1]]) {
    const o = out[lang + ' ' + vw.width] = {}, tag = lang + vw.width;
    const p = await (await b.newContext({ viewport: vw, isMobile: !!mob, hasTouch: !!mob, locale: lang })).newPage(); await p.route(/fonts\.g/, r => r.abort()); p.on('pageerror', e => errs.push(e.message));
    await p.goto('file://' + __dirname + '/t.html'); await p.waitForTimeout(600);
    const game = (sc, real, simple) => st(p, ([l, sc, real, simple]) => { const A = __S; A.setLang(l); A.home(false); document.getElementById('over').hidden = true; A.newGame(11, { sc, deck: A.SC[sc].rec, contested: false, guided: simple, timer: 'easy', real }); const S = A.s; S.sched = {}; S.pendingK = []; S.sc = { ...S.sc, dyn: 0 }; S.running = false; A.applyCamX(); }, [lang, sc, !!real, !!simple]);
    // 1. briefing : choix des règles au niveau Complet, indication sur la mission de chasse, absent au niveau Simple
    await st(p, l => { try { localStorage.removeItem('seuil.real') } catch (_) { } __S.setLang(l); __S.brief('asw', false); }, lang); await p.waitForTimeout(300);
    o.brief = [await p.locator('[data-a=expreal]').count(), await p.locator('text=' + (lang === 'fr' ? 'conçue pour les règles réalistes' : 'designed for the realistic rules')).count()]; need(o.brief[0] === 2 && o.brief[1] === 1, tag + ' choix des règles et indication : ' + o.brief);
    await p.click('[data-a=expreal][data-v="1"]'); await p.waitForTimeout(200); o.liste = await p.locator('details.more li').count(); need(o.liste === 8, tag + ' huit règles expliquées : ' + o.liste); await p.screenshot({ path: D + '/v38-briefing-' + tag + '.png', fullPage: true });
    o.largeB = await st(p, () => [document.documentElement.scrollWidth, innerWidth]); need(o.largeB[0] <= o.largeB[1], tag + ' briefing sans défilement horizontal : ' + o.largeB);
    await p.click('[data-a=begin]'); await p.waitForTimeout(400); if (await p.locator('[data-a=ack]').count()) await p.click('[data-a=ack]'); await p.waitForTimeout(600);
    o.depart = await st(p, () => [__S.s.real, localStorage.getItem('seuil.real'), document.getElementById('hTurn').textContent]); need(o.depart[0] === true && o.depart[1] === '1' && /réalistes|realistic/.test(o.depart[2]), tag + ' partie en règles réalistes : ' + o.depart);
    await st(p, () => { __S.brief('asw', true); }); await p.waitForTimeout(250); o.simple = await p.locator('[data-a=expreal]').count(); need(o.simple === 0, tag + ' pas de choix des règles au niveau Simple : ' + o.simple);
    // 2. inertie et vitesses : le LCS arrive avant le destroyer, la vitesse monte progressivement, le cap ne saute pas
    await game('asw', false);
    o.inertie = await st(p, () => { const A = __S, S = A.s, r = {}; S.crises = []; for (const id of ['LCS-1', 'DDG-1']) { const u = S.units.find(x => x.id === id); u.x = 300; u.y = id === 'LCS-1' ? 560 : 600; u.sp = 0; u.hd = 0; u.path = [{ x: 520, y: u.y }]; } const l = S.units.find(x => x.id === 'LCS-1'), d = S.units.find(x => x.id === 'DDG-1'); let t = 0, sp5 = 0, tl = 0, td = 0; while (t < 60 && (l.path.length || d.path.length)) { A.step(.1); t += .1; if (Math.abs(t - .5) < .05) sp5 = [l.sp, d.sp]; if (!l.path.length && !tl) tl = t; if (!d.path.length && !td) td = t; } r.t = [+tl.toFixed(1), +td.toFixed(1)]; r.sp5 = sp5.map(v => +v.toFixed(1)); r.max = [A.UT.patrol.speed, A.UT.frigate.speed];
      d.x = 400; d.y = 700; d.sp = 0; d.hd = 0; d.path = [{ x: 200, y: 700 }]; A.step(.1); r.cap = +Math.abs(d.hd).toFixed(2); return r });
    need(o.inertie.t[0] < o.inertie.t[1] && o.inertie.sp5[0] < o.inertie.max[0] && o.inertie.sp5[1] < o.inertie.sp5[0] && o.inertie.cap < .5 && o.inertie.max[0] > o.inertie.max[1], tag + ' inertie : ' + JSON.stringify(o.inertie));
    // 3. collisions : deux navires et deux avions envoyés au même point ne se superposent pas ; aucune route ne coupe un coin de terre
    o.sep = await st(p, () => { const A = __S, S = A.s, u = id => S.units.find(x => x.id === id), d = (a, b) => Math.hypot(a.x - b.x, a.y - b.y); S.crises = []; const a = u('LCS-1'), b2 = u('LCS-2'), p1 = u('P8-1'), p2 = u('P8-2'); a.x = 300; a.y = 560; b2.x = 300; b2.y = 640; [a, b2].forEach(x => { x.sp = 0; x.path = [{ x: 420, y: 600 }] }); [p1, p2].forEach((x, i) => { x.x = 300 + i * 200; x.y = 500; x.ready = 0; x.rtb = false; x.fuel = 100; x.path = [{ x: 400, y: 420 }] }); let min = 99, minA = 99; for (let i = 0; i < 400; i++) { A.step(.1); if (i > 5) { min = Math.min(min, d(a, b2)); minA = Math.min(minA, d(p1, p2)) } } return [+min.toFixed(1), +d(a, b2).toFixed(1), +minA.toFixed(1), A.SEP.sea, A.SEP.air] });
    need(o.sep[1] >= o.sep[3] - .6 && o.sep[0] > 3 && o.sep[2] > 3, tag + ' séparation en mer et en l’air : ' + o.sep);
    o.route = await st(p, () => { const A = __S; let n = 0, coin = 0, terre = 0, nul = 0, s = 7; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647; for (let k = 0; k < 120; k++) { const a = A.nearSea(rnd() * 1440, rnd() * 900), c = A.nearSea(rnd() * 1440, rnd() * 900), r = A.route(a[0] * 4 + 2, a[1] * 4 + 2, c[0] * 4 + 2, c[1] * 4 + 2); if (!r) { nul++; continue } let px = a[0] * 4 + 2, py = a[1] * 4 + 2; for (const q of r) { const m = Math.ceil(Math.hypot(q.x - px, q.y - py)); for (let i = 0; i <= m; i++) { n++; const x = px + (q.x - px) * i / m, y = py + (q.y - py) * i / m; if (!A.seaOK(x, y)) terre++ } px = q.x; py = q.y } } return [n, terre, nul] });
    need(o.route[1] / o.route[0] < 1e-4 && o.route[0] > 5000, tag + ' routes sans passage sur la terre : ' + o.route);
    // 4. règles réalistes : cible non militaire, avarie et repli, consigne, carburant, radar rallumé, bruit propre, couche thermique
    await game('asw', true);
    o.civ = await st(p, () => { const A = __S, S = A.s, s = S.ships.find(x => x.ais && x.truth === 'civil'), u = S.units.find(x => x.id === 'DDG-1'); u.x = s.x + 20; u.y = s.y; s.visible = true; s.seen = true; S.posture = 4; S.doc = 'free'; const L = A.shipActions(s).filter(a => a.id === 'fire' || /^f[us]:/.test(a.id)); return [L.length, L.filter(a => a.ok).length, (L[0] || {}).why || ''] });
    need(o.civ[0] > 0 && o.civ[1] === 0 && /militaire|military/.test(o.civ[2]), tag + ' tir refusé sur un navire déclaré : ' + o.civ);
    o.avarie = await st(p, () => { const A = __S, S = A.s, u = S.units.find(x => x.id === 'DDG-1'), l = S.units.find(x => x.id === 'LCS-1'); u.x = 480; u.y = 470; u.path = []; const r0 = A.sensorR(u); A.hitUnit(u, 50); const r = [u.hp, !!u.wd, u.path.length > 0, +(A.sensorR(u) / r0).toFixed(2), A.dmgF(u)]; S.wd = false; l.path = []; A.hitUnit(l, 50); r.push(!!l.wd, l.path.length); return r });
    need(o.avarie[0] === 50 && o.avarie[1] && o.avarie[2] && o.avarie[3] === .75 && o.avarie[4] === .6 && !o.avarie[5] && o.avarie[6] === 0, tag + ' avarie, repli, consigne « reste en ligne » : ' + o.avarie);
    o.bingo = await st(p, () => { const A = __S, S = A.s, u = S.units.find(x => x.id === 'P8-1'); S.crises = []; u.ready = 0; u.rtb = false; u.x = u.base.x + 360; u.y = u.base.y; u.fuel = 40; u.path = [{ x: u.x + 300, y: u.y }]; let t = 0; while (t < 30 && !u.rtb) { A.step(.1); t += .1 } return [u.rtb, +u.fuel.toFixed(0), +t.toFixed(1), S.bingoN || 0] });
    need(o.bingo[0] && o.bingo[1] > 0 && o.bingo[3] >= 1, tag + ' retour avec le carburant du trajet : ' + o.bingo);
    o.emcon = await st(p, () => { const A = __S, S = A.s, u = S.units.find(x => x.id === 'LCS-2'); u.active = false; u.x = 700; u.y = 300; u.path = []; S.mis.push({ x: u.x + 60, y: u.y, tg: u, v: 48, side: 'r', n: 9999, pk: .7 }); A.step(.1); return [u.active, S.embN || 0] });
    need(o.emcon[0] === true && o.emcon[1] === 1, tag + ' radar rallumé sous attaque : ' + o.emcon);
    o.sonar = await st(p, () => { const A = __S, S = A.s, u = S.units.find(x => x.id === 'LCS-1'); u.path = []; const r = [A.ownNz(u)]; u.path = [{ x: 0, y: 0 }]; u.thr = 2; r.push(A.ownNz(u)); u.thr = 1; r.push(A.ownNz(u)); u.path = []; const c = { truth: 'sousmarin', sb: { ly: 0 } }; S.t = 10; r.push(A.subDeep(c)); S.t = 50; r.push(A.subDeep(c)); r.push(A.subDeep({ truth: 'bio', sb: { ly: 0 } })); return r });
    need(o.sonar[0] === 1.25 && o.sonar[1] === .5 && o.sonar[2] === 1 && o.sonar[3] === true && o.sonar[4] === false && o.sonar[5] === false, tag + ' bruit propre et couche thermique : ' + o.sonar);
    // 5. consignes à l'écran, fiche d'unité, pas de règle réaliste en règles standard
    await game('asw', true); await st(p, () => { const A = __S; A.s.running = false; A.redraw(); });
    o.cons = await st(p, () => { const A = __S; return [/wdset/.test(A.docHtml ? A.docHtml() : document.body.innerHTML), /embset/.test(A.docHtml ? A.docHtml() : document.body.innerHTML)] });
    o.fiche = await st(p, () => { const A = __S, S = A.s, h = A.unitSheet(S.units.find(x => x.id === 'LCS-1')), h2 = A.unitSheet(S.units.find(x => x.id === 'ARC-1')); return [/vive|nimble/.test(h), /lourde|heavy/.test(h2)] }); need(o.fiche[0] && o.fiche[1], tag + ' manœuvre sur la fiche : ' + o.fiche);
    await game('asw', false); o.std = await st(p, () => { const A = __S, S = A.s, u = S.units.find(x => x.id === 'DDG-1'), r0 = A.sensorR(u); A.hitUnit(u, 50); const s = S.ships.find(x => x.ais); return [S.real, !!u.wd, +(A.sensorR(u) / r0).toFixed(2), A.civT(s)] }); need(o.std[0] === false && !o.std[1] && o.std[2] === 1 && o.std[3] === false, tag + ' règles standard inchangées : ' + o.std);
    // 6. une partie de chasse sous-marine se joue jusqu'au bilan en règles réalistes
    await p.addScriptTag({ path: __dirname + '/bots.js' }); o.partie = await st(p, () => { const g = playGame(60, 'asw', { contested: true, guided: false, real: true }, mkBot({})); const S = __S.s; return [g.done, g.s, g.ok, S.crises.filter(c => c.type === 'sub').length, S.real] }); need(o.partie[0] === 1 && o.partie[3] >= 3 && o.partie[4], tag + ' partie de chasse jusqu’au bilan : ' + o.partie);
    o.bilan = await st(p, () => /Réaliste|Realistic/.test(__S.expEnd())); need(o.bilan, tag + ' règles rappelées au bilan'); await p.waitForTimeout(300); await p.screenshot({ path: D + '/v38-bilan-' + tag + '.png' });
    o.large = await st(p, () => [document.documentElement.scrollWidth, innerWidth]); need(o.large[0] <= o.large[1], tag + ' pas de défilement horizontal : ' + o.large);
    o.manq = await st(p, () => __S.missing()); need(!o.manq.length, tag + ' textes manquants : ' + o.manq);
    await p.close();
  }
  console.log(JSON.stringify(out)); console.log('errs', errs.slice(0, 4), bad ? 'ÉCHECS ' + bad : 'OK'); await b.close(); process.exit(bad || errs.length ? 1 : 0);
})();
