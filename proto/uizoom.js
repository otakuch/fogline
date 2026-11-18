// Vitesse du jeu indépendante du zoom : le temps simulé doit suivre l'horloge réelle en vue large comme en vue rapprochée,
// y compris sur un ordinateur lent (processeur ralenti 4 fois). Défaut corrigé le 17 novembre 2026 : le plafond de 0,1 s par image
// jetait le temps des images lentes (carte entière), et le jeu semblait accélérer quand on zoomait.
// Usage : node uizoom.js [ralentissement, 4 par défaut]
const { chromium } = require('playwright');
(async () => {
  const thr = +(process.argv[2] || 4), b = await chromium.launch(), errs = []; let bad = 0;
  const need = (ok, m) => { if (!ok) { bad++; console.log('ÉCHEC', m); } };
  const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  await p.route(/fonts\.g/, r => r.abort()); p.on('pageerror', e => errs.push(e.message));
  if (thr > 1) { const c = await p.context().newCDPSession(p); await c.send('Emulation.setCPUThrottlingRate', { rate: thr }); }
  await p.goto('file://' + __dirname + '/t.html'); await p.waitForTimeout(800);
  const r = await p.evaluate(async () => {
    const A = __S; A.home(false); A.newGame(11, { sc: 'ia', deck: A.SC.ia.rec, contested: false, timer: 'easy' });
    const S = A.s; S.sched = {}; S.pendingK = []; S.tmode = 'rt'; S.speed = 1; const o = {};
    const wait = ms => new Promise(r => setTimeout(r, ms));
    for (const z of [1, 8]) {
      A.cam.z = A.minZ() * z; A.cam.x = 700; A.cam.y = 450; A.fitCam(); S.running = true; await wait(400);
      // mesure entre deux images : le temps simulé est lu après la boucle du jeu, à la même image que l'horodatage
      const fr = [], st = performance.now(); let t0 = null, t1 = null;
      await new Promise(res => { const tick = ts => { fr.push(ts); if (t0 === null) t0 = S.t; t1 = S.t; if (performance.now() - st < 4000) requestAnimationFrame(tick); else res(); }; requestAnimationFrame(tick); });
      const real = (fr[fr.length - 1] - fr[0]) / 1000, d = []; for (let i = 1; i < fr.length; i++) d.push(fr[i] - fr[i - 1]); d.sort((a, b) => a - b);
      o['z' + z] = { images_s: +((fr.length - 1) / real).toFixed(1), image_med_ms: Math.round(d[d.length >> 1]), sim_par_reel: +((t1 - t0) / real).toFixed(2) }; S.running = false;
    }
    return o;
  });
  console.log(JSON.stringify({ ralenti: thr, ...r }));
  need(r.z1.sim_par_reel > 0.85 && r.z8.sim_par_reel > 0.85, 'le temps de jeu prend du retard sur l’horloge réelle');
  need(Math.abs(r.z1.sim_par_reel - r.z8.sim_par_reel) < 0.2, 'la vitesse du jeu change avec le zoom');
  need(!errs.length, 'erreurs de page : ' + errs.slice(0, 3).join(' | '));
  console.log(bad ? bad + ' échec(s)' : 'OK'); await b.close(); process.exit(bad ? 1 : 0);
})();
