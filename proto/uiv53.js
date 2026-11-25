// Version 53 : les options ne comptent plus (ni score, ni contrôle de phase) ; actions sans plafond ni attente ni emplois comptés.
// Usage : node uiv53.js   (FR 1440 et EN 390)
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); let fails = 0, n = 0; const need = (c, m) => { n++; if (!c) { fails++; console.log('ÉCHEC ' + m) } };
  for (const [lang, w, h] of [['fr', 1440, 900], ['en', 390, 844]]) {
    const tag = lang + w, ctx = await b.newContext({ viewport: { width: w, height: h } }), p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.addInitScript(l => { try { localStorage.setItem('seuil.lang', l) } catch (_) { } }, lang);
    await p.goto('file://' + __dirname + '/t.html'); await p.waitForTimeout(700);
    await p.evaluate(l => { const A = __S; A.setLang(l); A.home(false); document.getElementById('over').hidden = true; window.G = (sc, guided) => { A.newGame(7, { sc, deck: A.SC[sc].rec, contested: false, guided: !!guided, timer: 'easy', novar: true }); const S = A.s; S.running = false; S.sched = {}; S.pendingK = []; S.sc = { ...S.sc, dyn: 0 }; return S } }, lang);
    const st = f => p.evaluate(f);
    // options : plus de condition au contrôle de phase
    const cp = await st(() => { const A = __S, S = G('d3'); S.units = S.units.filter(u => A.UT[u.type].naval).slice(0, 1); S.cap.team = 0; S.se = 10; const opt = A.options(); S.turn = S.sc.cps[0]; A.newTurn(); const k = S.checks[S.checks.length - 1]; return { opt, ok: k && k.ok, infra: Math.round(A.infra()) } });
    need(cp.opt < 3 && cp.infra >= 60 && cp.ok === true, tag + ' contrôle de phase tenu avec moins de 3 options ' + JSON.stringify(cp));
    // options : plus d'axe dans le score
    const sc = await st(() => { const A = __S, S = G('la'); for (let i = 0; i < 600; i++)A.step(.1); const a = A.score(); S.optSeries = S.optSeries.map(() => 0); S.checks.forEach(c => c.opt = 0); const b2 = A.score(); return { a: a.s, b: b2.s, same: a.s === b2.s && a.ok === b2.ok } });
    need(sc.same, tag + ' score identique quel que soit le nombre d’options ' + JSON.stringify(sc));
    // écran : ni jauge, ni condition, ni ligne de bilan
    await st(() => { const A = __S; G('la', false); A.redraw() }); await p.waitForTimeout(300);
    const ui = await st(() => { const hud = document.querySelector('.st[data-k=opt]'), op = document.querySelector('.opord'); return { hud: !hud || hud.hidden || getComputedStyle(hud).display === 'none', cond: op ? /Options ≥ 3/.test(op.textContent) : null, sw: document.documentElement.scrollWidth <= innerWidth + 1 } });
    need(ui.hud && ui.cond === false && ui.sw, tag + ' ni jauge « Options », ni condition à l’ordre d’opération ' + JSON.stringify(ui));
    // actions : vérifications, coordination, parole
    const act = await st(() => { const A = __S, S = G('la'); const cs = ['desinfo', 'incursion', 'alarm', 'cyber'].map(k => A.startCrisis(k)).filter(Boolean); let run = 0, refused = 0; for (const c of cs) for (const a of A.crisisActions(c).filter(x => x.kind === 'collect')) { if (a.ok) { A.doAct(a); run++ } else if (/analyst|Analystes/.test(a.why || '')) refused++ } S.debt = 4.5; A.coord(); A.coord(); A.coord(); const n0 = S.commN || 0; A.comm(); A.comm(); return { run, jobs: S.jobs.length, refused, debt: S.debt, comm: (S.commN || 0) - n0, cw: A.coordWait ? A.coordWait() : 0 } });
    need(act.run >= 4 && act.jobs === act.run && act.refused === 0, tag + ' vérifications simultanées sans plafond ' + JSON.stringify(act));
    need(act.debt === 0 && act.comm === 2, tag + ' coordonner et prendre la parole sans attente ' + JSON.stringify(act));
    // emplois : force spéciale, équipe cyber, sorties
    const use = await st(() => { const A = __S, S = G('d3'); const sf = S.units.find(u => u.type === 'sof'), o = { sof: sf && [sf.uses > 1e6, sf.usesMax === undefined], team: [S.teamUses > 1e6, S.teamUsesMax === 0], air: S.units.filter(u => ['fighter', 'recon'].includes(u.type)).every(u => u.usesMax === undefined) }; for (let k = 0; k < 12; k++) { S.units.filter(u => ['fighter', 'recon'].includes(u.type)).forEach(u => A.spendSortie && A.spendSortie(u)); A.useTeam && A.useTeam(0) } o.after = [S.teamUses > 0, S.units.filter(u => ['fighter', 'recon'].includes(u.type)).every(u => u.uses > 0 && u.ready !== 1e9)]; const j = JSON.parse(JSON.stringify({ u: sf && sf.uses, t: S.teamUses })); o.save = (!sf || j.u > 1e6) && j.t > 1e6; return o });
    need((!use.sof || (use.sof[0] && use.sof[1])) && use.team[0] && use.team[1] && use.air, tag + ' emplois non comptés ' + JSON.stringify(use));
    need(use.after[0] && use.after[1] && use.save, tag + ' douze emplois de suite : rien n’est épuisé ; valeur conservée par la sauvegarde ' + JSON.stringify(use));
    await st(() => { const A = __S, S = A.s; S.leftTab = 'forces'; A.redraw() }); await p.waitForTimeout(200);
    const txt = await st(() => /999999|1000000000|Infinity|NaN/.test(document.body.innerText)); need(!txt, tag + ' aucun compteur géant à l’écran');
    const miss = await st(() => __S.missing()); need(miss.length === 0, tag + ' aucun texte manquant ' + JSON.stringify(miss)); need(errs.length === 0, tag + ' aucune erreur ' + errs.slice(0, 3).join(' | '));
    await ctx.close();
  }
  console.log(fails ? fails + ' ÉCHEC(S) sur ' + n : 'uiv53 : ' + n + ' contrôles réussis'); await b.close(); process.exit(fails ? 1 : 0);
})();
