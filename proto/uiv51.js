// Version 51 : plus de jetons, allure lente unique, force spéciale embarquée, fenêtre de crise illustrée, clic droit.
// Usage : node uiv51.js   (FR 1440 et EN 390, vrais écrans)
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); let fails = 0, n = 0; const need = (c, m) => { n++; if (!c) { fails++; console.log('ÉCHEC ' + m) } };
  for (const [lang, w, h] of [['fr', 1440, 900], ['en', 390, 844]]) {
    const tag = lang + w, ctx = await b.newContext({ viewport: { width: w, height: h } }), p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.addInitScript(l => { try { localStorage.setItem('seuil.lang', l) } catch (_) { } }, lang);
    await p.goto('file://' + __dirname + '/t.html'); await p.waitForTimeout(700);
    const st = (f, a) => p.evaluate(f, a);
    const game = (sc, guided, cw) => st(([sc, guided, cw, l]) => { const A = __S; window.__noCW = cw ? 0 : 1; A.setLang(l); A.home(false); document.getElementById('over').hidden = true; A.newGame(11, { sc, deck: A.SC[sc].rec, contested: false, guided, timer: 'easy', novar: true }); const S = A.s; S.running = false; S.sched = {}; S.pendingK = []; S.sc = { ...S.sc, dyn: 0 }; A.redraw(); return S.units.map(u => u.id) }, [sc, guided, cw, lang]);

    // 1. plus de jetons
    await game('la', false); await p.waitForTimeout(300);
    const tok = await st(() => { const A = __S, S = A.s, c = A.startCrisis('cyber'), L = A.crisisActions(c), words = []; for (const l of ['fr', 'en']) for (const [k, v] of Object.entries(A.I18N[l])) if (typeof v === 'string' && /jeton|token/i.test(v) && k !== 'how.2') words.push(l + ':' + k); return { und: S.tokens === undefined, hud: !!document.getElementById('hTok') || !!document.getElementById('gTok'), tok: L.filter(a => a.tok).length, words, page: /jeton|token/i.test(document.getElementById('app').innerText) } });
    need(tok.und && !tok.hud && tok.tok === 0, tag + ' aucun jeton dans l’état, la barre haute ni les actions ' + JSON.stringify(tok));
    need(tok.words.length === 0 && !tok.page, tag + ' aucun texte ne parle de jetons ' + JSON.stringify(tok.words.slice(0, 8)));
    const act = await st(() => { const A = __S, S = A.s, c = S.crises[S.crises.length - 1], r = []; for (let i = 0; i < 12; i++) { const a = A.crisisActions(c).find(x => x.kind === 'decide' && x.ok && !x.escTo); if (!a) break; r.push(A.doAct(a)); if (c.choice || c.closed) break } return { done: r.length, ordN: S.ordN } }); need(act.done >= 1 && act.ordN >= 1, tag + ' une action part sans solde ' + JSON.stringify(act));
    // analystes : plafond de vérifications simultanées, avec son motif
    const ana = await st(() => { const A = __S, S = A.s; const cs = ['desinfo', 'incursion', 'alarm', 'cyber'].map(k => A.startCrisis(k)).filter(Boolean); let run = 0, why = null; for (const c of cs) for (const a of A.crisisActions(c).filter(x => x.kind === 'collect' && /osint|radar|src|log|trace|sig/.test(x.id))) { if (a.ok) { A.doAct(a); run++ } else if (a.why && !why && S.jobs.length >= 1) why = a.why } return { jobs: S.jobs.length, run, why } });
    need(ana.jobs <= 2 && ana.jobs >= 1 && !!ana.why, tag + ' vérifications simultanées plafonnées, motif affiché ' + JSON.stringify(ana));
    const wait = await st(() => { const A = __S, S = A.s; S.debt = 3; A.coord(); const d1 = S.debt; A.coord(); const d2 = S.debt; for (let i = 0; i < 320; i++)A.step(.1); S.debt = 3; A.coord(); return [d1, d2, S.debt] }); need(wait[0] === 1.5 && wait[1] === 1.5 && wait[2] === 1.5, tag + ' coordonner : une fois, puis attente ' + wait);

    // 2. allure lente unique
    await game('la', false); const u0 = (await st(() => __S.s.units.filter(u => __S.UT[u.type].naval).map(u => u.id)))[0];
    const spd = await st(id => { const A = __S, S = A.s, u = S.units.find(x => x.id === id); S.sel = u; A.redraw(); const q = A.nearSea(u.x + 140, u.y), tx = q[0] * 4 + 2, ty = q[1] * 4 + 2; u.path = A.route(u.x, u.y, tx, ty) || []; let d = 0, px = u.x, py = u.y; for (let i = 0; i < 80; i++) { A.step(.1); d += Math.hypot(u.x - px, u.y - py); px = u.x; py = u.y } const s = A.addShip({ kindI: 1, x: tx, y: ty, path: [], v: 10 }, 'civil', true); return { v: +(d / 8).toFixed(2), max: +(A.UT[u.type].speed * A.SLOW).toFixed(2), thr: u.thr, set: typeof A.setThr, ship: +s.v.toFixed(2) } }, u0);
    need(spd.v <= spd.max + .05 && spd.v > spd.max * .5 && spd.thr === undefined && spd.set === 'undefined', tag + ' une seule allure, lente ' + JSON.stringify(spd));
    need(spd.ship < 10 * .4, tag + ' navires créés à l’allure lente ' + spd.ship);
    await p.waitForTimeout(300); need(await p.locator('[data-a=thr]').count() === 0, tag + ' plus de sélecteur d’allure');

    // 3. force spéciale embarquée
    await game('g3', false); await p.waitForTimeout(300);
    const sof = await st(() => { const A = __S, S = A.s, sf = S.units.find(u => u.type === 'sof'), h = A.sofHost(sf); S.posture = 3; const c = A.startCrisis('seize'), far = [-420, 420, -300, 300].map(d => A.nearSea(c.zone.x + d, c.zone.y)).map(q => ({ x: q[0] * 4 + 2, y: q[1] * 4 + 2 })).sort((a, b) => Math.hypot(b.x - c.zone.x, b.y - c.zone.y) - Math.hypot(a.x - c.zone.x, a.y - c.zone.y))[0]; h.x = far.x; h.y = far.y; h.path = []; A.step(.1);
      const a1 = A.crisisActions(c).find(x => x.id === 'da'), shown = A.fzItems(1).some(i => i.o === sf); const x0 = sf.x; A.orderMove(sf, sf.x + 80, sf.y); A.step(.1); const moved = sf.path.length > 0;
      const near = A.nearSea(c.zone.x + 60, c.zone.y); h.x = near[0] * 4 + 2; h.y = near[1] * 4 + 2; A.step(.1); const a2 = A.crisisActions(c).find(x => x.id === 'da'); const ok2 = a2.ok; A.doAct(a2); const out = !sf.aboard, shown2 = A.fzItems(1).some(i => i.o === sf);
      for (let i = 0; i < 900 && !sf.aboard; i++)A.step(.1); return { host: h.id, war: A.sofWar(h), aboard0: true, a1: [a1.ok, a1.why], shown, moved, ok2, out, shown2, back: sf.aboard, at: Math.hypot(sf.x - h.x, sf.y - h.y) < 1, n: [S.sofOutN, S.sofBackN] } });
    need(sof.war && !sof.a1[0] && !!sof.a1[1] && !sof.shown && !sof.moved, tag + ' embarquée : cachée, sans ordre direct, refusée si le bâtiment est loin ' + JSON.stringify(sof));
    need(sof.ok2 && sof.out && sof.shown2 && sof.back && sof.at, tag + ' déployée depuis le bâtiment, puis rembarquée ' + JSON.stringify(sof));
    const strand = await st(() => { const A = __S, S = A.s, sf = S.units.find(u => u.type === 'sof'); const h = A.sofHost(sf); S.units = S.units.filter(u => !A.sofWar(u)); A.step(.1); const c = A.startCrisis('seize'), a = A.crisisActions(c).find(x => x.id === 'da'); return { aboard: sf.aboard, host: sf.host, ok: a && a.ok, why: a && a.why } });
    need(!strand.aboard && strand.host === null && !strand.ok && !!strand.why, tag + ' sans navire de guerre compatible : aucune insertion, motif donné ' + JSON.stringify(strand));
    await game('g3', false); await st(() => { const S = __S.s; S.sel = S.units.find(u => u.type === 'sof'); document.body.dataset.mv = 'dos'; __S.redraw() }); await p.waitForTimeout(400);
    need(await p.locator('#right .sofc').count() === 1, tag + ' fiche : ligne d’embarquement');

    // 4. fenêtre de crise
    await game('g3', true, true); await st(() => { const A = __S, S = A.s; S.running = true; S.pauseLeft = 90; window.__k1 = A.startCrisis('desinfo'); window.__k2 = A.startCrisis('seize') }); await p.waitForTimeout(900);
    const cw1 = await st(() => { const d = document.getElementById('cw'), S = __S.s, im = d.querySelector('img'); return { open: d.open, modal: d.matches(':modal'), run: S.running, cur: __S.CW.cur && __S.CW.cur.type, sev: d.dataset.sev, img: im ? im.naturalWidth : 0, alt: im && im.alt, lab: !!d.querySelector('.cwi small'), title: d.querySelector('h2').textContent, btn: [...d.querySelectorAll('[data-cw]')].map(x => Math.round(x.getBoundingClientRect().height)), focus: document.activeElement && document.activeElement.dataset.cw, sw: document.documentElement.scrollWidth <= innerWidth + 1, truth: d.innerText.includes(__S.CW.cur.truth), t: S.t, pl: S.pauseLeft } });
    need(cw1.open && cw1.modal && !cw1.run && cw1.cur === 'seize' && cw1.sev === '3', tag + ' fenêtre modale, temps arrêté, crise la plus grave d’abord ' + JSON.stringify(cw1));
    need(cw1.img > 0 && cw1.lab && cw1.btn.every(x => x >= 44) && cw1.focus === 'dos' && cw1.sw, tag + ' illustration chargée et signalée comme ambiance, boutons de 44 px, focus, pas de défilement ' + JSON.stringify(cw1));
    await p.waitForTimeout(600); const cw2 = await st(() => ({ t: __S.s.t, pl: __S.s.pauseLeft })); need(cw2.t === cw1.t && cw2.pl === cw1.pl, tag + ' le temps ne coule pas et la réserve de pause n’est pas consommée');
    await p.keyboard.press('Escape'); await p.waitForTimeout(700);
    const cw3 = await st(() => { const d = document.getElementById('cw'); return { open: d.open, cur: __S.CW.cur && __S.CW.cur.type, sev: d.dataset.sev, seen: [window.__k1.cwSeen, window.__k2.cwSeen] } }); need(cw3.open && cw3.cur === 'desinfo' && cw3.seen[1], tag + ' Échap ferme, la crise suivante s’ouvre ' + JSON.stringify(cw3));
    await p.click('#cw [data-cw=dos]'); await p.waitForTimeout(500);
    const cw4 = await st(() => { const d = document.getElementById('cw'), S = __S.s; return { open: d.open, sel: S.sel === window.__k1, run: S.running, q: __S.cwList().length } }); need(!cw4.open && cw4.sel && cw4.q === 0, tag + ' « Ouvrir le dossier » ferme et sélectionne la crise ' + JSON.stringify(cw4));
    await p.waitForTimeout(500); need(!(await st(() => document.getElementById('cw').open)), tag + ' une crise déjà présentée ne se rouvre pas');
    // sauvegarde : l'état « présentée » suit la partie
    const sv = await st(() => { const A = __S, raw = JSON.stringify(A.s.crises.map(c => !!c.cwSeen)); return raw }); need(/true/.test(sv), tag + ' état présenté gardé dans la partie');
    // image manquante : repli, la crise reste jouable
    await game('la', false, true); await st(() => { window.__cwBase = 'nulle-part/'; __S.s.running = true; __S.startCrisis('cyber') }); await p.waitForTimeout(1100);
    const fb = await st(() => { const d = document.getElementById('cw'); return { open: d.open, img: !!d.querySelector('img'), txt: d.querySelector('.cwi span') && !d.querySelector('.cwi span').hidden, btn: d.querySelectorAll('[data-cw]').length } }); need(fb.open && !fb.img && fb.txt && fb.btn === 4, tag + ' image manquante : panneau neutre, boutons présents ' + JSON.stringify(fb));
    need(await p.locator('#cw [data-cw=go]').count() === 1, tag + ' bouton de reprise explicite'); await p.click('#cw [data-cw=x]'); await p.waitForTimeout(300); need(await st(() => __S.s.running === false && !document.getElementById('cw').open), tag + ' « Fermer » laisse le temps arrêté'); await st(() => { __S.s.running = true; __S.startCrisis('desinfo') }); await p.waitForTimeout(900); await p.click('#cw [data-cw=go]'); await p.waitForTimeout(300); need(await st(() => __S.s.running === true && !document.getElementById('cw').open), tag + ' « Reprendre le temps » relance le temps');
    await st(() => { window.__cwBase = undefined });
    // tutoriel : pas de fenêtre
    await st(() => { const A = __S; window.__noCW = 0; A.newGame(3, { sc: 'tuto', deck: A.SC.tuto.rec }); A.s.running = true; A.startCrisis('desinfo') }); await p.waitForTimeout(700); need(!(await st(() => document.getElementById('cw').open)), tag + ' pas de fenêtre au tutoriel');

    // 5. clic droit : menu contextuel, aucun ordre
    if (w > 1000) { await game('la', false); await st(() => { const S = __S.s; S.sel = S.units.find(u => __S.UT[u.type].naval); __S.redraw() }); await p.waitForTimeout(300); const box = await p.locator('#c').boundingBox(), x = box.x + box.width * .5, y = box.y + box.height * .55;
      await p.mouse.click(x, y, { button: 'right' }); await p.waitForTimeout(300); const rc = await st(() => { const S = __S.s, u = S.sel, m = document.getElementById('ctxm'); return { path: u ? u.path.length : -1, q: S.queue.length, menu: !!m && !m.hidden, sel: !!u } }); need(rc.sel && rc.path === 0 && rc.q === 0 && rc.menu, tag + ' clic droit : menu ouvert, aucun déplacement ' + JSON.stringify(rc)); await p.keyboard.press('Escape') }
    const miss = await st(() => __S.missing()); need(miss.length === 0, tag + ' aucun texte manquant ' + JSON.stringify(miss)); need(errs.length === 0, tag + ' aucune erreur ' + errs.slice(0, 3).join(' | '));
    await ctx.close();
  }
  console.log(fails ? fails + ' ÉCHEC(S) sur ' + n : 'uiv51 : ' + n + ' contrôles réussis'); await b.close(); process.exit(fails ? 1 : 0);
})();
