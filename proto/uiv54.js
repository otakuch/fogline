// Version 54 : chasse sous-marine retravaillée. Ordre de chasse (dossier, fiche d'unité, niveau Simple), écho affiché dès qu'un capteur entend,
// marqueur qui reste et se date, sous-marin qui guette la route du convoi, premier contact réel, faux écho non compté comme une crise perdue.
// Usage : node uiv54.js   (FR 1440 et EN 390)
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); let fails = 0, n = 0; const need = (c, m) => { n++; if (!c) { fails++; console.log('ÉCHEC ' + m) } };
  for (const [lang, w, h] of [['fr', 1440, 900], ['en', 390, 844]]) {
    const tag = lang + w, ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: w < 500, isMobile: w < 500 }), p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.addInitScript(l => { try { localStorage.setItem('seuil.lang', l) } catch (_) { } }, lang);
    await p.goto('file://' + __dirname + '/t.html'); await p.waitForTimeout(700);
    const st = (f, a) => p.evaluate(f, a);
    // 1. parcours réel au niveau Simple (défaut) : accueil, mission, briefing, partie
    await p.click('[data-a=play]'); await p.click('.ms-card[data-a=sc][data-v=asw]'); await p.click('[data-a=todeck]'); await p.waitForTimeout(150); await p.click('[data-a=tobrief]'); await p.click('[data-a=begin]'); await p.waitForTimeout(200); const ack = await p.$('[data-a=ack]'); if (ack) await ack.click(); await p.waitForTimeout(300);
    const s0 = await st(() => { const A = __S, S = A.s; S.running = false; let i = 0; while (!S.crises.some(c => c.type === 'sub') && i++ < 3000) A.step(.1); const c = S.crises.find(c => c.type === 'sub'); S.sel = c; if (window.innerWidth < 980 && A.setMV) A.setMV('dos'); A.redraw(); return { guided: S.guided, truth: c.truth, t: Math.round(S.t), d: Math.round(Math.hypot(c.sb.x - c.zone.x, c.sb.y - c.zone.y)), r: Math.round(c.zone.r), tgt: c.sb.tgt && (c.sb.tgt.wait ? 'wait' : c.sb.tgt.id || 'cv'), shown: A.fzItems(1).some(x => x.kd === 'c'), v: c.sb.v } });
    need(s0.guided === true, tag + ' niveau Simple par défaut');
    need(s0.truth === 'sousmarin', tag + ' premier contact : un vrai sous-marin ' + JSON.stringify(s0));
    need(s0.tgt === 'wait' && s0.v <= 3.3, tag + ' il guette la route du convoi, à allure lente ' + JSON.stringify(s0));
    need(s0.d <= 70 && s0.r <= 150, tag + ' estimation de départ resserrée ' + JSON.stringify(s0));
    need(s0.shown === false, tag + ' aucun écho affiché avant qu’un capteur entende');
    await p.waitForTimeout(250);
    const btn = await p.$('#rightC [data-a=act][data-v=seekall]'); need(!!btn, tag + ' dossier : bouton « Lancer la chasse » au niveau Simple');
    const lab = btn ? await btn.innerText() : ''; need(/chasse|hunt/i.test(lab) && !/Vérifier$|^Verify$/.test(lab.trim()), tag + ' libellé explicite ' + JSON.stringify(lab.slice(0, 60)));
    if (btn) { await btn.scrollIntoViewIfNeeded(); await btn.click() } await p.waitForTimeout(200);
    const s1 = await st(() => { const A = __S, S = A.s, c = S.crises.find(c => c.type === 'sub'); const hunters = S.units.filter(u => u.seek === c.id).map(u => u.id); let i = 0, heard = null, mk = null; while (i++ < 1500 && !c.closed) { A.step(.1); if (heard === null && c.seenT) heard = Math.round(S.t - c.start); if (mk === null && A.fzItems(1).some(x => x.kd === 'c' && x.o === c)) mk = Math.round(S.t - c.start); if (mk !== null && i % 10 === 0 && S.t - c.start > mk + 6) break } A.redraw(); const it = A.fzItems(1).find(x => x.kd === 'c' && x.o === c); return { hunters, heard, mk, at: it && [Math.round(it.x), Math.round(it.y)], zone: [Math.round(c.zone.x), Math.round(c.zone.y)], sub: [Math.round(c.sb.x), Math.round(c.sb.y)], buoys: S.buoyN || 0, pings: S.pingN || 0, again: A.crisisActions(c).find(a => a.id === 'seekall').ok } });
    need(s1.hunters.length >= 3, tag + ' un clic engage plusieurs unités ' + JSON.stringify(s1.hunters));
    need(s1.heard !== null && s1.heard <= 120, tag + ' un capteur entend le contact en moins de deux minutes ' + JSON.stringify(s1));
    need(s1.mk !== null && s1.mk === s1.heard || (s1.mk !== null && s1.mk - s1.heard <= 2), tag + ' l’écho apparaît dès le premier contact ' + JSON.stringify(s1));
    need(s1.at && s1.at[0] === s1.zone[0] && s1.at[1] === s1.zone[1], tag + ' écho placé sur l’estimation, pas sur la position vraie ' + JSON.stringify(s1));
    need(s1.buoys + s1.pings > 0, tag + ' les unités ont employé leurs capteurs seules ' + JSON.stringify(s1));
    await p.waitForTimeout(400); if (w < 980) await st(() => { __S.setMV && __S.setMV('map'); __S.redraw() }); await p.waitForTimeout(300);
    const dom = await st(() => [...document.querySelectorAll('#fzl button')].some(e => /Écho|Echo/.test(e.getAttribute('aria-label') || e.textContent || ''))); need(dom, tag + ' marqueur de l’écho présent sur la carte');
    await p.screenshot({ path: 'v54-chasse-' + tag + '.png' });
    // 2. le marqueur reste et se date quand le contact se tait ; un ordre de route arrête la chasse
    const s2 = await st(() => { const A = __S, S = A.s, c = S.crises.find(c => c.type === 'sub'); S.units.forEach(u => { if (u.seek) A.orderMove(u, u.x + 1, u.y + 1) }); const left = S.units.filter(u => u.seek).length; S.buoys = []; S.units.forEach(u => { if (u.x !== undefined) { u.x = 20; u.y = 20; u.path = [] } }); let i = 0; while (i++ < 250) A.step(.1); const it = A.fzItems(1).find(x => x.kd === 'c' && x.o === c); return { left, it: it && { lab: it.lab, dim: it.dim }, closed: c.closed } });
    need(s2.left === 0, tag + ' un ordre de route arrête la chasse');
    need(s2.closed || (s2.it && s2.it.dim && /\d+ s/.test(s2.it.lab)), tag + ' contact muet : l’écho reste, estompé et daté ' + JSON.stringify(s2));
    // 3. fiche d'unité au niveau Simple : ordre de chasse seulement
    const s3 = await st(() => { const A = __S, S = A.s; A.newGame(21, { sc: 'asw', deck: A.SC.asw.rec, contested: false, guided: true, timer: 'easy', novar: true }); const T = A.s; T.running = false; const c = A.startCrisis('sub', 'sousmarin'); const u = T.units.find(u => u.type === 'recon'); const acts = A.crisisActions(c).filter(a => a.unit === u.id).map(a => a.id); T.sel = u; A.redraw(); return { acts, uid: u.id } }); await p.waitForTimeout(300); if (w < 980) { await st(() => { __S.setMV && __S.setMV('dos'); __S.redraw() }); await p.waitForTimeout(200) }
    s3.html = await st(id => document.getElementById('rightC').innerHTML.includes('seek:' + id), s3.uid);
    need(s3.html, tag + ' fiche de l’avion au niveau Simple : ordre de chasse proposé');
    const ub = await st(id => { const e = document.querySelector('#rightC [data-a=uact][data-v$="seek:' + id + '"]'); if (!e) return false; e.click(); return true }, s3.uid); await p.waitForTimeout(150);
    const s3b = await st(id => { const A = __S, S = A.s, u = S.units.find(x => x.id === id); let i = 0; while (i++ < 600 && !(S.buoyN > 0)) A.step(.1); return { seek: u.seek, buoys: S.buoyN || 0 } }, s3.uid);
    need(!!ub && s3b.seek && s3b.buoys >= 1, tag + ' clic sur la fiche : l’avion chasse et largue ses bouées ' + JSON.stringify(s3b));
    // 4. faux écho : imposé par le scénario ; laissé sans réponse, il n'est jamais une crise perdue avec pénalités : éclairci (entendu) il compte comme traité, jamais entendu il reste « non éclairci »
    const s4 = await st(() => { const A = __S; A.newGame(33, { sc: 'asw', deck: A.SC.asw.rec, contested: false, guided: false, timer: 'easy', novar: true }); const S = A.s; S.running = false; S.sched = {}; S.pendingK = []; S.sc = { ...S.sc, dyn: 0 }; S.units.forEach(u => { if (u.x !== undefined) { u.x = 30; u.y = 30; u.path = [] } }); for (let k = 0; k < 50; k++) A.step(.1); const cs = [0, 1, 2, 3].map(() => A.startCrisis('sub', 'faux')); const kinds = cs.map(c => c.truth); let pil = '', i = 0; while (i++ < 1900 && cs.some(c => !c.closed)) { if (i % 20 === 0 && !cs[0].closed) S.buoys.push({ x: cs[0].sb.x, y: cs[0].sb.y, r: 52, until: S.t + 3, dip: 1 }); if (S.t > cs[1].deadline - .3 && !pil) pil = [S.se, S.cs, S.ri, S.tension].join(); A.step(.1) } return { kinds, outs: cs.map(c => c.out), same: !!pil && pil === [S.se, S.cs, S.ri, S.tension].join(), script: A.SC.asw.script.slice(0, 2).map(e => e[2]) } });
    need(s4.kinds.every(k => k === 'bio' || k === 'epave'), tag + ' écho imposé faux ' + JSON.stringify(s4.kinds));
    need(s4.outs[0] >= .5 && s4.outs.includes(.4) && s4.outs.every(o => o >= .4) && s4.same, tag + ' faux écho sans réponse : traité s’il a été entendu, « non éclairci » sinon, sans pénalité ' + JSON.stringify(s4));
    need(s4.script[0] === 'sousmarin' && s4.script[1] === 'faux', tag + ' scénario : un vrai sous-marin, puis un faux écho ' + JSON.stringify(s4.script));
    // 5. le sous-marin reste une menace : sans ordre, il attaque le convoi
    const s5 = await st(() => { const A = __S; let hit = 0; for (const seed of [7, 60, 113, 166]) { A.newGame(seed, { sc: 'asw', deck: A.SC.asw.rec, contested: false, guided: false, timer: 'easy' }); const S = A.s; S.running = false; let i = 0; while (!S.over && i++ < 16000) A.step(.1); if (!S.convoy || S.convoy.hp < 100) hit++ } return hit });
    need(s5 >= 3, tag + ' sans aucun ordre, le convoi est attaqué dans au moins trois parties sur quatre (' + s5 + ')');
    const ov = await st(() => document.documentElement.scrollWidth > window.innerWidth + 1); need(!ov, tag + ' pas de défilement horizontal');
    const miss = await st(() => __S.missing()); need(miss.length === 0, tag + ' aucun texte manquant ' + JSON.stringify(miss)); need(errs.length === 0, tag + ' aucune erreur ' + errs.slice(0, 3).join(' | '));
    await ctx.close();
  }
  console.log(fails ? fails + ' ÉCHEC(S) sur ' + n : 'uiv54 : ' + n + ' contrôles réussis'); await b.close(); process.exit(fails ? 1 : 0);
})();
