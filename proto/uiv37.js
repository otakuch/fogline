// Version 37 : tour par tour, semi-réel, relief three.js et vue 3D. Vrais clics, français à 1440 px puis anglais à 390 px.
// Usage : node uiv37.js [dossier captures]
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), errs = [], out = {}, D = process.argv[2] || '/tmp'; let bad = 0;
  const need = (ok, m) => { if (!ok) { bad++; console.log('ÉCHEC', m); } };
  const st = (p, f, a) => p.evaluate(f, a);
  const until = async (p, f, ms = 9000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await p.evaluate(f)) return true; await p.waitForTimeout(120); } return false; };
  for (const [lang, vw, mob] of [['fr', { width: 1440, height: 900 }, 0], ['en', { width: 390, height: 844 }, 1]]) {
    const o = out[lang + ' ' + vw.width] = {}, tag = lang + vw.width;
    const p = await (await b.newContext({ viewport: vw, isMobile: !!mob, hasTouch: !!mob, locale: lang })).newPage(); await p.route(/fonts\.g/, r => r.abort()); p.on('pageerror', e => errs.push(e.message));
    await p.goto('file://' + __dirname + '/t.html'); await p.waitForTimeout(600);
    const game = (tm, simple) => st(p, ([l, tm, simple]) => { const A = __S; A.setLang(l); A.home(false); document.getElementById('over').hidden = true; A.newGame(11, { sc: 'd3', deck: A.SC.d3.rec, contested: false, guided: simple, timer: 'easy', tmode: tm }); const S = A.s; S.sched = {}; S.pendingK = []; S.sc = { ...S.sc, dyn: 0 }; S.running = true; A.applyCamX(); }, [lang, tm, !!simple]);
    // 1. briefing : trois déroulements, choix gardé, la partie démarre arrêtée au tour par tour
    await st(p, l => { __S.setLang(l); __S.brief('d3', false); }, lang); await p.waitForTimeout(300);
    o.brief = await p.locator('[data-a=exptm]').count(); need(o.brief === 3, tag + ' trois déroulements au briefing : ' + o.brief);
    await p.click('[data-a=exptm][data-v=turn]'); await p.waitForTimeout(150); await p.screenshot({ path: D + '/v37-briefing-' + tag + '.png' });
    await p.click('[data-a=begin]'); await p.waitForTimeout(400); if (await p.locator('[data-a=ack]').count()) await p.click('[data-a=ack]'); await p.waitForTimeout(700);
    o.depart = await st(p, () => { const S = __S.s; return [S.tmode, S.running, Math.round(S.t), localStorage.getItem('seuil.tmode')]; }); need(o.depart[0] === 'turn' && !o.depart[1] && o.depart[2] === 0 && o.depart[3] === 'turn', tag + ' départ arrêté au tour par tour : ' + o.depart);
    // 2. tour par tour : le temps n'avance qu'avec « Fin du tour », d'un tour exactement ; la réserve de pause ne baisse pas
    await game('turn'); await p.waitForTimeout(900);
    o.arret = await st(p, () => { const S = __S.s, v = id => { const e = document.getElementById(id); return !!e && !e.hidden && getComputedStyle(e).display !== 'none'; }; return [S.running, Math.round(S.t * 10) / 10, v('spgo'), v('sp1'), v('sp0'), S.pauseLeft === undefined ? 90 : Math.round(S.pauseLeft)]; });
    need(!o.arret[0] && o.arret[1] === 0 && o.arret[2] && !o.arret[3] && !o.arret[4] && o.arret[5] === 90, tag + ' temps arrêté, bouton de tour seul : ' + o.arret);
    await st(p, () => { const A = __S; A.s.tokens = 4; window.__k = A.startCrisis('alarm'); }); o.echeance = await st(p, () => [window.__k.deadline, window.__k.deadline % 30]); need(o.echeance[1] === 0 && o.echeance[0] >= 90, tag + ' échéance à une fin de tour : ' + o.echeance);
    await p.screenshot({ path: D + '/v37-tour-' + tag + '.png' });
    await p.click('#spgo'); o.tour = await until(p, () => __S.s.turn === 2 && !__S.s.running); o.tourT = await st(p, () => [__S.s.turn, Math.round(__S.s.t), __S.s.running, __S.s.twait]); need(o.tour && o.tourT[1] === 30 && o.tourT[3], tag + ' un tour joué puis arrêt : ' + o.tourT);
    if (!mob) { await p.keyboard.press('Space'); o.espace = await until(p, () => __S.s.turn === 3 && !__S.s.running); need(o.espace, tag + ' Espace joue le tour suivant'); await p.keyboard.press('2'); await p.waitForTimeout(300); need(!(await st(p, () => __S.s.running)), tag + ' touche de vitesse sans effet au tour par tour'); }
    // 3. semi-réel : arrêt à chaque tour et à chaque crise, reprise par le bouton
    await game('semi'); await st(p, () => { __S.s.speed = 16; }); o.semi = await until(p, () => __S.s.turn === 2 && !__S.s.running, 12000);
    o.semiV = await st(p, () => { const S = __S.s, e = document.getElementById('spgo'); return [S.turn, S.running, !e.hidden, e.textContent, S.speed]; }); need(o.semi && o.semiV[2] && o.semiV[4] === 1, tag + ' semi-réel, arrêt au tour : ' + o.semiV);
    await p.click('#spgo'); await p.waitForTimeout(300); o.semiGo = await st(p, () => __S.s.running); need(o.semiGo, tag + ' semi-réel, reprise');
    o.semiK = await st(p, () => { const A = __S; A.startCrisis('alarm'); return A.s.running; }); need(o.semiK === false, tag + ' semi-réel, arrêt à la crise : ' + o.semiK);
    // 4. temps réel inchangé
    await game('rt'); await p.waitForTimeout(700); o.rt = await st(p, () => [__S.s.running, __S.s.t > .3, document.getElementById('spgo').hidden]); need(o.rt[0] && o.rt[1] && o.rt[2], tag + ' temps réel inchangé : ' + o.rt);
    // 5. relief : couche calculée par three.js, posée sous les côtes
    await st(p, () => { __S.s.running = false; __S.setRelief(false); }); if (mob) await p.click('#mnav [data-v=map]'); await p.click('[data-a=laymenu]'); await p.waitForTimeout(150);
    o.gl = await st(p, () => __S.hasGL()); 
    if (o.gl) {
      await p.click('[data-a=relief]'); o.relief = await until(p, () => __S.RLF && __S.RL.th === 'natl' && !!__S.RL.cv, 15000); await p.waitForTimeout(900);
      o.couche = await st(p, () => [__S.baseOK, __S.baseLayer('relief'), __S.RL.cv && __S.RL.cv.width, (() => { const c = __S.RL.cv.getContext('2d').getImageData(600, 900, 1, 1).data; return [c[0], c[1], c[2]]; })()]);
      need(o.relief && (!o.couche[0] || o.couche[1]) && o.couche[3][2] > 5, tag + ' relief calculé et posé : ' + JSON.stringify(o.couche));
      await p.screenshot({ path: D + '/v37-relief-' + tag + '.png' });
      // 6. vue 3D
      await st(p, () => { const A = __S; A.s.tokens = 4; A.startCrisis('site'); A.s.running = false; A.s.sel = null; A.redraw(); }); await p.waitForTimeout(200);
      if (!(await p.locator('[data-a=r3d]').count())) await p.click('[data-a=laymenu]');
      await p.click('[data-a=r3d]'); o.r3 = await until(p, () => !!(__S.R3D && __S.R3D.frames > 3), 15000); await p.waitForTimeout(500);
      o.r3v = await st(p, () => { const c = document.querySelector('#r3box canvas'); return [!!c, c && c.width > 100, __S.s.running, __S.R3D && __S.R3D.G.children.length]; }); need(o.r3 && o.r3v[0] && o.r3v[1] && !o.r3v[2] && o.r3v[3] >= 4, tag + ' vue 3D : ' + o.r3v);
      await p.screenshot({ path: D + '/v37-3d-' + tag + '.png' });
      await p.click('[data-a=r3close]'); await p.waitForTimeout(200); o.r3f = await st(p, () => [__S.R3D === null, document.getElementById('over').hidden]); need(o.r3f[0] && o.r3f[1], tag + ' vue 3D refermée : ' + o.r3f);
      await st(p, () => __S.setRelief(false)); await p.waitForTimeout(400); o.off = await st(p, () => [__S.RLF, __S.baseLayer('relief')]); need(!o.off[0] && !o.off[1], tag + ' retour à la carte vectorielle : ' + o.off);
    } else console.log(tag + ' : WebGL indisponible, relief non testé');
    o.large = await st(p, () => [document.documentElement.scrollWidth, innerWidth]); need(o.large[0] <= o.large[1], tag + ' pas de défilement horizontal : ' + o.large);
    o.manq = await st(p, () => __S.missing()); need(!o.manq.length, tag + ' textes manquants : ' + o.manq);
    await p.close();
  }
  console.log(JSON.stringify(out)); console.log('errs', errs.slice(0, 4), bad ? 'ÉCHECS ' + bad : 'OK'); await b.close(); process.exit(bad || errs.length ? 1 : 0);
})();
