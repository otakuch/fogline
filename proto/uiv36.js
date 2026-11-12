// Version 36 : pistes de missile (dôme, cap, numéro), états tirés de la mécanique, liste des pistes au dossier, légende, bilan.
// Français à 1440 px puis anglais à 390 px. Usage : node uiv36.js [dossier captures]
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), errs = [], out = {}, D = process.argv[2] || '/tmp'; let bad = 0;
  const need = (ok, m) => { if (!ok) { bad++; console.log('ÉCHEC', m); } };
  const st = (p, f, a) => p.evaluate(f, a);
  for (const [lang, vw, mob] of [['fr', { width: 1440, height: 900 }, 0], ['en', { width: 390, height: 844 }, 1]]) {
    const o = out[lang + ' ' + vw.width] = {}, tag = lang + vw.width;
    const p = await (await b.newContext({ viewport: vw, isMobile: !!mob, hasTouch: !!mob, locale: lang })).newPage(); await p.route(/fonts\.g/, r => r.abort()); p.on('pageerror', e => errs.push(e.message));
    await p.goto('file://' + __dirname + '/t.html'); await p.waitForTimeout(500);
    await st(p, l => { const A = __S; performance.now = () => 0; A.setLang(l); A.home(false); document.getElementById('over').hidden = true; A.newGame(11, { sc: 'd3', deck: ['frigate', 'patrol', 'team', 'battery'], contested: false, guided: false, timer: 'easy' }); const S = A.s; S.running = false; S.sched = {}; S.pendingK = []; S.sc = { ...S.sc, dyn: 0 }; A.applyCamX(); }, lang); await p.waitForTimeout(300);
    // 1. raid : les tirs adverses deviennent des pistes numérotées
    o.vol = await st(p, () => { const A = __S, S = A.s, c = A.startCrisis('raid'); window.__c = c; let i = 0; while (i++ < 3000 && !S.mis.some(m => m.side === 'r')) A.step(.1); for (let k = 0; k < 12; k++) A.step(.1); S.running = false; S.sel = c; A.redraw(); const L = A.trkRows(c); return [S.mis.filter(m => m.side === 'r').length, L.map(r => r.n).join(','), L.every(r => /^\d{4}$/.test(r.n)), L[0] && L[0].st]; });
    need(o.vol[0] >= 2 && o.vol[2] && o.vol[3] === 'fly', tag + ' pistes adverses en vol, numérotées : ' + o.vol);
    await p.waitForTimeout(300); if (mob) { await p.click('#mnav [data-v=dos]'); await p.waitForTimeout(150); }
    o.liste = await st(p, () => [document.querySelectorAll('#right .trow:not(.tsum)').length, document.querySelectorAll('#right .trow svg.trk').length, !!document.querySelector('#right .trow .td')]); need(o.liste[0] >= 2 && o.liste[1] >= 5 && o.liste[2], tag + ' liste des pistes au dossier : ' + o.liste);
    if (!mob) { await st(p, () => { const S = __S.s, m = S.mis.find(x => x.side === 'r'); __S.cam.x = m.x; __S.cam.y = m.y; __S.cam.z = __S.minZ() * 3; __S.fitCam(); }); await p.waitForTimeout(250); }
    await p.screenshot({ path: D + '/v36-vol-' + tag + '.png' });
    // 2. piste incertaine quand le système de combat est compromis
    o.inc = await st(p, () => { const A = __S, S = A.s; S.combatDown = S.t + 60; const r = A.trkRows(window.__c)[0]; const v = r && r.st; S.combatDown = 0; return v; }); need(o.inc === 'unc', tag + ' piste incertaine : ' + o.inc);
    // 3. issue : chaque piste finit interceptée, arrivée ou perdue, et le compte tombe juste
    o.fin = await st(p, () => { const A = __S, S = A.s, c = window.__c; let fx = 0, i = 0; while (i++ < 4000 && !c.closed && !S.over) { A.step(.1); fx = Math.max(fx, (S.trkFx || []).length); } S.running = false; const k = S.tk || {}, q = c.tk || {}; return { tirs: c.nm - c.raiders.reduce((a, r) => a + Math.max(0, r.mag || 0), 0), int: k.int || 0, arr: k.arr || 0, lost: k.lost || 0, crise: (q.int || 0) + (q.arr || 0) + (q.lost || 0), fx, dmg: c.dmg || 0 }; });
    need(o.fin.int + o.fin.arr + o.fin.lost > 0 && o.fin.fx > 0 && o.fin.arr === o.fin.dmg && o.fin.crise === o.fin.int + o.fin.arr + o.fin.lost, tag + ' issues comptées : ' + JSON.stringify(o.fin));
    o.journal = await st(p, () => __S.s.log.filter(l => /\b0\d{3}\b/.test(l.m)).length); need(o.journal >= 1, tag + ' numéro de piste au journal : ' + o.journal);
    // 4. tir du joueur : piste amie, liste au dossier du contact
    o.tir = await st(p, () => { const A = __S, S = A.s, u = S.units.find(x => x.id === 'DDG-1'), q = A.nearSea(u.x + 120, u.y), z = A.addShip({ kindI: 1, x: q[0] * 4 + 2, y: q[1] * 4 + 2, path: [], v: 0, life: 9999, emit: 999 }, 'leurre', false); z.visible = true; z.seen = true; S.tokens = 4; S.posture = 4; S.doc = 'free'; S.sel = z; const a = A.shipActions(z).find(x => x.id === 'fire'); const ok = !!(a && a.ok); if (ok) A.doAct(a); A.step(.1); A.step(.1); S.running = false; A.redraw(); const m = S.mis.find(x => x.side === 'b'); return [ok, m && m.n, a && a.why]; }); need(o.tir[0] && /^\d{4}$/.test(o.tir[1] || ''), tag + ' tir ami numéroté : ' + o.tir);
    await p.waitForTimeout(300); if (mob) { await p.click('#mnav [data-v=dos]'); await p.waitForTimeout(150); }
    o.tirDos = await p.locator('#right .trow svg.trk[stroke="#80E0FF"]').count(); need(o.tirDos >= 1, tag + ' tir ami au dossier du contact : ' + o.tirDos);
    // 5. légende
    await st(p, () => __S.showLegend && __S.showLegend()); await p.waitForTimeout(200);
    o.leg = await p.locator('#over .lgt svg.trk').count(); if (!o.leg) { await p.keyboard.press('m'); await p.waitForTimeout(150); await p.click('[data-a=mlegend]'); await p.waitForTimeout(200); o.leg = await p.locator('#over .lgt svg.trk').count(); }
    need(o.leg === 7, tag + ' légende des pistes : ' + o.leg); await p.screenshot({ path: D + '/v36-legende-' + tag + '.png' });
    o.large = await st(p, () => [document.documentElement.scrollWidth, innerWidth]); need(o.large[0] <= o.large[1], tag + ' pas de défilement horizontal : ' + o.large);
    o.manq = await st(p, () => __S.missing()); need(!o.manq.length, tag + ' textes manquants : ' + o.manq);
    await p.close();
  }
  console.log(JSON.stringify(out)); console.log('errs', errs.slice(0, 4), bad ? 'ÉCHECS ' + bad : 'OK'); await b.close(); process.exit(bad || errs.length ? 1 : 0);
})();
