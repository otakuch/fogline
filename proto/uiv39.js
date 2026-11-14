// Version 39 : commandement sous tension (concepts de CSIM). Réserve d'état-major, dette qui pèse sur les délais, coupure du réseau de commandement selon l'historique, visible et latent au bilan.
// Français à 1440 px, anglais à 390 px. Usage : node uiv39.js [dossier captures]
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), errs = [], out = {}, D = process.argv[2] || '/tmp'; let bad = 0;
  const need = (ok, m) => { if (!ok) { bad++; console.log('ÉCHEC', m); } };
  const st = (p, f, a) => p.evaluate(f, a);
  for (const [lang, vw, mob] of [['fr', { width: 1440, height: 900 }, 0], ['en', { width: 390, height: 844 }, 1]]) {
    const o = out[lang + ' ' + vw.width] = {}, tag = lang + vw.width;
    const p = await (await b.newContext({ viewport: vw, isMobile: !!mob, hasTouch: !!mob, locale: lang })).newPage(); await p.route(/fonts\.g/, r => r.abort()); p.on('pageerror', e => errs.push(e.message));
    await p.goto('file://' + __dirname + '/t.html'); await p.waitForTimeout(700);
    const game = (sc, simple) => st(p, ([l, sc, simple]) => { const A = __S; A.setLang(l); A.home(false); document.getElementById('over').hidden = true; A.newGame(11, { sc, deck: A.SC[sc].rec, contested: false, guided: simple, timer: 'easy' }); const S = A.s; S.sched = {}; S.pendingK = []; S.sc = { ...S.sc, dyn: 0 }; S.running = false; S.crises = []; S.queue = []; S.svc.c2.down = 0; A.applyCamX(); }, [lang, sc, !!simple]);
    // 1. panneau État-major : niveau Complet seulement
    await game('ic', false); await st(p, () => { __S.redraw() }); await p.waitForTimeout(300);
    o.panneau = await st(p, () => [__S.cmdOn(), !!document.querySelector('#leftC .cmdb'), document.querySelector('#leftC .cmdb') ? document.querySelector('#leftC .cmdb').innerText.slice(0, 40) : '']);
    if (mob) { o.panneau[1] = o.panneau[1] || await st(p, () => /cmd\.h|ÉTAT-MAJOR|STAFF/.test(__S.s && document.body.innerHTML)) }
    need(o.panneau[0] && o.panneau[1], tag + ' panneau État-major au niveau Complet : ' + o.panneau);
    await game('ic', true); await st(p, () => __S.redraw()); o.simple = await st(p, () => [__S.cmdOn(), !!document.querySelector('.cmdb'), __S.cmdAuth(), __S.cmdOrd()]); need(!o.simple[0] && !o.simple[1] && o.simple[2] === 1 && o.simple[3] === 0, tag + ' niveau Simple inchangé : ' + o.simple);
    // 2. réserve : crises en parallèle, retour au calme
    await game('ic', false); o.reserve = await st(p, () => { const A = __S, S = A.s; ['cyber', 'desinfo', 'sar'].forEach(k => A.startCrisis(k)); const h0 = S.hr; let exp = 0; for (let i = 0; i < 100; i++) { const n = S.crises.filter(c => !c.closed && !c.silent && !c.choice).length; exp += .06 * Math.max(0, n - 1) * .1; A.step(.1) } const h1 = S.hr; S.crises.forEach(c => { c.closed = true }); for (let i = 0; i < 300; i++) A.step(.1); return [h0, +h1.toFixed(2), +S.hr.toFixed(2), +exp.toFixed(2), S.cmdW.par > 0] });
    need(o.reserve[3] > .3 && Math.abs((o.reserve[0] - o.reserve[1]) - o.reserve[3]) < .02 && o.reserve[2] > o.reserve[1], tag + ' réserve qui baisse puis remonte : ' + o.reserve);
    // 3. dette et réserve allongent l'autorisation et les ordres
    await game('ic', false); o.delais = await st(p, () => { const A = __S, S = A.s; S.tokens = 4; S.debt = 0; A.setPosture(S.posture + 1); const d0 = S.postureAt - S.t; S.postureAt = 0; S.postureTo = 0; S.tokens = 4; S.debt = 4; A.setPosture(S.posture + 1); const d1 = S.postureAt - S.t; S.postureAt = 0; S.postureTo = 0; S.tokens = 4; S.hr = 40; A.setPosture(S.posture + 1); const d2 = S.postureAt - S.t; S.postureAt = 0; S.postureTo = 0; S.hr = 100; S.debt = 2; const u = S.units.find(x => A.UT[x.type].naval); const q0 = S.queue.length; A.orderMove(u, u.x + 40, u.y); const q = S.queue[S.queue.length - 1]; return [+d0.toFixed(1), +d1.toFixed(1), +d2.toFixed(1), S.queue.length - q0, q ? +(q.at - S.t).toFixed(1) : null] });
    need(Math.abs(o.delais[0] - 8) < .01 && Math.abs(o.delais[1] - 12.8) < .01 && Math.abs(o.delais[2] - 16.64) < .05 && o.delais[3] === 1 && Math.abs(o.delais[4] - 1) < .01, tag + ' délais d’autorisation et d’ordre : ' + o.delais);
    // 4. coupure du réseau : dette selon l'historique, retour qui n'efface rien, seconde coupure plus dure
    await game('ic', false); o.c2 = await st(p, () => { const A = __S, S = A.s; S.debt = 0; S.svc.c2.down = 3; A.step(.1); const a = [S.c2cuts, +S.debt.toFixed(2)]; S.tokens = 4; A.coord && 0; const u = S.units.find(x => A.UT[x.type].naval); const d0 = S.debt; A.orderMove(u, u.x + 30, u.y); a.push(+(S.debt - d0).toFixed(2)); for (let i = 0; i < 100; i++) A.step(.1); const hrC2 = S.hr; S.svc.c2.down = 0; A.step(.1); const back = S.log.slice(0, 3).map(l => l.m || l.t || l).join('|'); a.push(+S.debt.toFixed(2)); S.debt = 2; S.hr = 55; S.svc.c2.down = 3; A.step(.1); a.push(S.c2cuts, +S.debt.toFixed(2)); const h0 = S.hr; for (let i = 0; i < 100; i++) A.step(.1); a.push(+(h0 - S.hr).toFixed(2), +(100 - hrC2).toFixed(2)); return [a, /Liaisons rétablies|Links restored/.test(back)] });
    need(o.c2[0][0] === 1 && Math.abs(o.c2[0][1] - .5) < .01 && Math.abs(o.c2[0][2] - .1) < .01 && o.c2[0][3] > .5 && o.c2[0][4] === 2 && Math.abs(o.c2[0][5] - 3.5) < .01 && o.c2[0][6] > 1.8 * o.c2[0][7] && o.c2[1], tag + ' coupure, retour et seconde coupure : ' + JSON.stringify(o.c2));
    // 5. jetons : au-delà de 3 par tour, la réserve paie ; réserve épuisée, un jeton de moins
    await game('ic', false); o.jetons = await st(p, () => { const A = __S, S = A.s; S.tokens = 6; for (let i = 0; i < 5; i++) A.coord(); const h = S.hr; S.hr = 20; S.tTurn = 0; const t0 = S.turn; S.t = Math.ceil(S.t / 30) * 30 + 29.95; A.step(.1); return [+(100 - h).toFixed(1), S.turn > t0, S.tokens] });
    need(Math.abs(o.jetons[0] - 6) < .01 && o.jetons[1] && o.jetons[2] <= 3, tag + ' jetons au-delà de 3 et réserve épuisée : ' + o.jetons);
    // 6. barre haute : badge quand la réserve est entamée
    await game('ic', false); await st(p, () => { __S.s.hr = 40; __S.redraw() }); await p.waitForTimeout(400); const b1 = await st(p, () => { const e = document.getElementById('hSvc'); return />(EM|STAFF)</.test(e.innerHTML) && getComputedStyle(e).display !== 'none' }); await st(p, () => { __S.s.hr = 80; __S.redraw() }); await p.waitForTimeout(400); const b2 = await st(p, () => />(EM|STAFF)</.test(document.getElementById('hSvc').innerHTML)); o.badge = [b1, b2];
    need(o.badge[0] && !o.badge[1], tag + ' badge de la barre haute : ' + o.badge);
    await game('ic', false); await st(p, () => { const A = __S, S = A.s; S.hr = 38; S.debt = 2.4; A.startCrisis('cyber'); A.startCrisis('desinfo'); S.svc.c2.down = 2; A.step(.1); document.body.dataset.mv = 'crises'; A.redraw() }); if (mob) await p.locator('#mnav [data-v=crises]').click().catch(() => { }); await p.waitForTimeout(300);
    await st(p, () => { const e = document.querySelector('#leftC .cmdb'); if (e) e.scrollIntoView() }); await p.screenshot({ path: D + '/v39-etatmajor-' + tag + '.png' });
    // 7. une partie jouée jusqu'au bilan : courbes visible et latent, tours de stabilité fantôme
    await p.addScriptTag({ path: __dirname + '/bots.js' });
    o.partie = await st(p, () => { const g = playGame(60, 'd3', { contested: true, guided: false }, mkBot({})); const A = __S, S = A.s, h = A.cmdEnd(); const ph = S.cmdSeries.filter(A.phOf).length; return [g.done, S.cmdSeries.length, ph, /<svg class="cmdsvg"/.test(h), (h.match(/<rect /g) || []).length, h.includes(String(ph) + (document.documentElement.lang === 'en' ? ' of ' : ' sur ')) || h.includes('>' + ph + ' '), S.cmdSeries.every(q => q.lat >= 0 && q.lat <= 1 && q.vis >= 0 && q.vis <= 1.01)] });
    need(o.partie[0] === 1 && o.partie[1] >= 15 && o.partie[3] && o.partie[4] === o.partie[2] && o.partie[6], tag + ' bilan visible et latent : ' + o.partie);
    await st(p, () => { const A = __S; A.redraw(); const e = [...document.querySelectorAll('#over h3')].find(x => /VISIBLE/.test(x.textContent)); if (e) { const d = e.closest('details'); if (d) d.open = true; e.scrollIntoView() } }); await p.waitForTimeout(300); await p.screenshot({ path: D + '/v39-bilan-' + tag + '.png' });
    o.bilanVu = await st(p, () => !!document.querySelector('#over .cmdsvg')); need(o.bilanVu, tag + ' courbes affichées au bilan');
    // 8. reproductibilité : même tirage, même trajectoire
    o.repro = await st(p, () => { const r = []; for (let k = 0; k < 2; k++) { playGame(77, 'ic', { contested: true, guided: false }, mkBot({})); r.push(JSON.stringify(__S.s.cmdSeries)) } return r[0] === r[1] }); need(o.repro, tag + ' même tirage, même trajectoire');
    o.large = await st(p, () => [document.documentElement.scrollWidth, innerWidth]); need(o.large[0] <= o.large[1], tag + ' pas de défilement horizontal : ' + o.large);
    o.manq = await st(p, () => __S.missing()); need(!o.manq.length, tag + ' textes manquants : ' + o.manq);
    await p.close();
  }
  console.log(JSON.stringify(out)); console.log('errs', errs.slice(0, 4), bad ? 'ÉCHECS ' + bad : 'OK'); await b.close(); process.exit(bad || errs.length ? 1 : 0);
})();
