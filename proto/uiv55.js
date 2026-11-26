// Version 55 : catalogue naval retiré, plus aucun compteur ni texte de jeton, contact sous-marin sans zone de départ (le joueur le trouve lui-même),
// portée du sonar tracée et chiffrée, suivi de cible à distance et annulable. La page de test garde la zone de départ (window.__subZone) : ce test la retire.
// Usage : node uiv55.js   (FR 1440 et EN 390)
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); let fails = 0, n = 0; const need = (c, m) => { n++; if (!c) { fails++; console.log('ÉCHEC ' + m) } };
  for (const [lang, w, h] of [['fr', 1440, 900], ['en', 390, 844]]) {
    const tag = lang + w, ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: w < 500, isMobile: w < 500 }), p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.addInitScript(l => { try { localStorage.setItem('seuil.lang', l) } catch (_) { } }, lang);
    await p.goto('file://' + __dirname + '/t.html'); await p.waitForTimeout(700); await p.evaluate(() => { window.__subZone = 0 });
    const st = (f, a) => p.evaluate(f, a);
    // 1. catalogue retiré, aucun jeton
    need(!(await p.$('[data-a=navcat]')), tag + ' accueil : plus de bouton du catalogue');
    const how = await st(l => __S.I18N[l]['how.2'], lang); need(!/jeton|token/i.test(how), tag + ' aide : plus de mention de jeton');
    await p.click('[data-a=play]'); await p.click('.ms-card[data-a=sc][data-v=asw]'); await p.waitForTimeout(150);
    const prep = await p.$('[data-a=toprep]'); if (prep) { await prep.click(); await p.waitForTimeout(200); need(!(await p.$('[data-a=navcat]')) && !(await p.$('[data-a=nvfiche]')), tag + ' préparation : ni catalogue ni fiche de catalogue'); const back = await p.$('[data-a=tobrief]'); if (back) await back.click(); await p.waitForTimeout(150) }
    need(!(await p.$('[data-a=navcat]')), tag + ' briefing : plus de bouton du catalogue');
    // 2. partie réelle au niveau Simple : contact sans zone de départ
    const td = await p.$('[data-a=todeck]'); if (td) { await td.click(); await p.waitForTimeout(150); await p.click('[data-a=tobrief]') } await p.click('[data-a=begin]'); await p.waitForTimeout(200); const ack = await p.$('[data-a=ack]'); if (ack) await ack.click(); await p.waitForTimeout(300);
    const s0 = await st(() => { const A = __S, S = A.s; S.running = false; let i = 0; while (!S.crises.some(c => c.type === 'sub') && i++ < 3000) A.step(.1); const c = S.crises.find(c => c.type === 'sub'); S.sel = c; if (window.innerWidth < 980 && A.setMV) A.setMV('dos'); A.redraw(); const acts = A.crisisActions(c), g = id => acts.find(a => a.id === id) || {}; return { guided: S.guided, found: c.found, hid: A.hid(c), hint: A.hintName(c), desc: c.desc, marker: A.fzItems(1).some(x => x.kd === 'c'), seek: g('seekall').ok, seekWhy: g('seekall').why || '', buoy: g('buoy').ok, dip: g('dip').ok, units: acts.filter(a => a.unit).map(a => a.id.split(':')[0]).filter((v, i, a) => a.indexOf(v) === i), pub: A.subPub(c), zone: [c.zone.x, c.zone.y], hudTok: /jeton|token/i.test(document.getElementById('hud') ? document.getElementById('hud').innerText : '') } });
    need(s0.guided && s0.found === false && s0.hid, tag + ' contact ouvert sans zone de départ ' + JSON.stringify({ f: s0.found, h: s0.hid }));
    need(s0.hint.length > 3 && s0.desc.includes(s0.hint), tag + ' l’alerte nomme ce que le contact menace : ' + s0.hint);
    need(!s0.marker && s0.seek === false && s0.buoy === false && !s0.dip && s0.seekWhy.includes(s0.hint), tag + ' rien ne désigne la zone : pas d’écho, chasse et bouées du dossier refusées avec la raison ' + JSON.stringify({ m: s0.marker, s: s0.seek, b: s0.buoy, d: s0.dip }));
    need(s0.units.includes('ping') && !s0.units.includes('seek'), tag + ' niveau Simple : sonar actif par unité disponible, pas de chasse par unité avant un écho ' + JSON.stringify(s0.units));
    need(!s0.hudTok, tag + ' barre haute : aucun compteur de jetons');
    await p.waitForTimeout(300); const dos = await st(() => document.getElementById('rightC').innerText); need(/Position inconnue|Position unknown/.test(dos) && dos.includes(s0.hint), tag + ' dossier : position inconnue et indice');
    if (w < 980) await st(() => { __S.setMV && __S.setMV('map'); __S.redraw() }); await p.waitForTimeout(250); await p.screenshot({ path: 'v55-sans-zone-' + tag + '.png' });
    // 3. portée du sonar : même valeur pour le moteur, la fiche et la carte
    const s1 = await st(() => { const A = __S, S = A.s, u = S.units.find(u => A.UT[u.type].sub); S.sel = u; if (window.innerWidth < 980 && A.setMV) A.setMV('dos'); A.redraw(); return { id: u.id, son: A.sonR(u), ping: A.pingR ? A.pingR(u) : null, mi: Math.round(A.sonR(u) * 1.7 / 5) * 5 } }); await p.waitForTimeout(300);
    const fiche = await st(() => { const d = document.querySelector('#rightC details.uasw'); if (d) d.open = true; return document.getElementById('rightC').innerText });
    need(s1.son === 60 && fiche.includes('≈ ' + s1.mi), tag + ' fiche du sous-marin : portée d’écoute chiffrée (≈ ' + s1.mi + ') ' + JSON.stringify(s1));
    if (w < 980) await st(() => { __S.setMV && __S.setMV('map'); __S.redraw() }); await p.waitForTimeout(250); await p.screenshot({ path: 'v55-sonar-' + tag + '.png' });
    // 4. le joueur trouve le contact avec son sous-marin : écho, puis chasse et suivi possibles
    const s2 = await st(id => { const A = __S, S = A.s, c = S.crises.find(c => c.type === 'sub'), u = S.units.find(x => x.id === id); u.x = c.sb.x + 150; u.y = c.sb.y; u.path = []; let i = 0; while (i++ < 100) A.step(.1); const far = c.found; A.orderMove(u, c.sb.x + 25, c.sb.y); i = 0; while (i++ < 3000 && c.found === false) A.step(.1); const acts = A.crisisActions(c), g = k => acts.find(a => a.id === k) || {}; return { far, found: c.found, d: Math.round(Math.hypot(u.x - c.sb.x, u.y - c.sb.y)), marker: A.fzItems(1).some(x => x.kd === 'c' && x.o === c), seek: g('seekall').ok, fol: g('follow:' + id).ok, folLab: g('follow:' + id).label || '', log: S.log.slice(-12).some(l => /Premier écho|First echo/.test(l.m || l.t || l.text || JSON.stringify(l))) } }, s1.id);
    need(s2.far === false, tag + ' hors de portée d’écoute : toujours rien');
    need(s2.found === true && s2.d <= 62 && s2.marker, tag + ' entré dans le cercle d’écoute : premier écho et marqueur ' + JSON.stringify(s2));
    need(s2.seek === true && s2.fol === true && /\d/.test(s2.folLab), tag + ' après l’écho : chasse et suivi à distance proposés ' + JSON.stringify(s2.folLab));
    // 5. suivi de cible : il garde ses distances, et s'annule
    const s3 = await st(id => { const A = __S, S = A.s, c = S.crises.find(c => c.type === 'sub'), u = S.units.find(x => x.id === id), act = () => A.crisisActions(c).find(a => a.id === 'follow:' + id); A.dtFocus(c, 8); /* estimation stabilisée, comme après une série d'échos */ A.doAct(act()); const on = u.follow === c.id, D = []; let i = 0; while (i++ < 900 && !c.closed) { A.step(.1); if (i > 250 && i % 50 === 0) D.push(Math.round(Math.hypot(u.x - c.zone.x, u.y - c.zone.y))) } u.x = c.zone.x + 6; u.y = c.zone.y; u.path = []; i = 0; while (i++ < 200 && !c.closed) A.step(.1); const back = Math.round(Math.hypot(u.x - c.zone.x, u.y - c.zone.y)); const lab = act() ? act().label : ''; S.sel = u; A.redraw(); return { on, D, min: Math.min(...D), max: Math.max(...D), back, lab, listen: u.listen === c.id, closed: c.closed, fol: A.ASW.fol } }, s1.id);
    need(s3.on && s3.listen, tag + ' suivi lancé, écoute sans émettre');
    { const D = s3.D.slice().sort((a, b) => a - b), med = D[D.length >> 1], inb = D.filter(d => d >= 18 && d <= 55).length / Math.max(1, D.length); /* l'estimation saute parfois d'un lobe à l'autre : le sous-marin met alors quelques secondes à reprendre sa distance */ need(s3.closed || (med >= 24 && med <= 46 && inb >= .5), tag + ' le sous-marin reste à distance du contact (médiane ' + med + ') ' + JSON.stringify(s3.D)) }
    need(s3.closed || s3.back >= 16, tag + ' placé trop près, il s’écarte (' + s3.back + ')');
    await p.waitForTimeout(300); if (w < 980) { await st(() => { __S.setMV && __S.setMV('dos'); __S.redraw() }); await p.waitForTimeout(200) }
    const cancel = await st(id => { const d = document.querySelector('#rightC details.uasw'); if (d) d.open = true; const e = document.querySelector('#rightC [data-a=uact][data-v$="follow:' + id + '"]'); if (!e) return null; const txt = e.innerText; e.click(); return txt }, s1.id); await p.waitForTimeout(200);
    const s4 = await st(id => { const A = __S, S = A.s, u = S.units.find(x => x.id === id), c = S.crises.find(c => c.type === 'sub'); const off = !u.follow; if (!c.closed) { A.followSet(u, c); A.orderMove(u, u.x + 30, u.y) } return { off, byMove: !u.follow } }, s1.id);
    need(s3.closed || (cancel && /Annuler|Cancel/.test(cancel) && s4.off), tag + ' fiche au niveau Simple : bouton d’annulation du suivi ' + JSON.stringify(cancel));
    need(s4.byMove, tag + ' un ordre de route annule aussi le suivi');
    // 6. sur toute une partie sans capteur, le contact ne se montre jamais ; s'il attaque, il se dévoile
    const s5 = await st(() => { const A = __S; window.__subZone = 0; A.newGame(7, { sc: 'asw', deck: A.SC.asw.rec, contested: false, guided: true, timer: 'easy' }); const S = A.s; S.running = false; S.units.forEach(u => { if (u.x !== undefined) { u.x = 20; u.y = 20; u.path = [] } }); let i = 0, shown = 0, c = null; while (i++ < 2500) { A.step(.1); c = c || S.crises.find(x => x.type === 'sub' && x.truth === 'sousmarin'); if (c && c.found === false && A.fzItems(1).some(x => x.kd === 'c' && x.o === c)) shown++; S.units.forEach(u => { if (u.x !== undefined && !A.UT[u.type].air) { u.x = 20; u.y = 20; u.path = [] } }) } return { had: !!c, shown, found: c && c.found } });
    need(s5.had && s5.shown === 0, tag + ' sans capteur à portée, aucun marqueur ' + JSON.stringify(s5));
    // 7. la page de test peut garder la zone de départ pour les anciens contrôles
    const s6 = await st(() => { const A = __S; window.__subZone = 1; A.newGame(9, { sc: 'asw', deck: A.SC.asw.rec, guided: false, timer: 'easy', novar: true }); const c = A.startCrisis('sub'); window.__subZone = 0; return c.found }); need(s6 === true, tag + ' option de test : zone de départ conservée');
    const ov = await st(() => document.documentElement.scrollWidth > window.innerWidth + 1); need(!ov, tag + ' pas de défilement horizontal');
    const miss = await st(() => __S.missing()); need(miss.length === 0, tag + ' aucun texte manquant ' + JSON.stringify(miss)); need(errs.length === 0, tag + ' aucune erreur ' + errs.slice(0, 3).join(' | '));
    await ctx.close();
  }
  console.log(fails ? fails + ' ÉCHEC(S) sur ' + n : 'uiv55 : ' + n + ' contrôles réussis'); await b.close(); process.exit(fails ? 1 : 0);
})();
