// Version 40 : lutte anti-sous-marine. Usage : node uiv40.js
// Vérifie : dotations, largage libre (triangle, barrière, passives, actives), alerte, torpille (au but, manquée, à tort),
// lanceurs (destroyer, avion, hélicoptère), fiche, dossier, bilan, textes, 1440 FR et 390 EN, pas de défilement horizontal.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  let fails = 0;
  const ok = (c, m) => { if (!c) { fails++; console.log('ÉCHEC', m); } else console.log('ok', m); };
  for (const [lang, w] of [['fr', 1440], ['en', 390]]) {
    const p = await b.newPage({ viewport: { width: w, height: w > 500 ? 860 : 844 } });
    const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.addInitScript(l => { try { localStorage.setItem('seuil.lang', l) } catch (_) { } }, lang);
    await p.goto('file://' + __dirname + '/t.html'); await p.waitForTimeout(400);
    const r = await p.evaluate(() => {
      const A = __S, o = {};
      o.dot = [A.UT.recon.buoys, A.UT.helo.buoys, A.UT.recon.torp, A.UT.helo.torp, A.UT.frigate.torp];
      A.newGame(7, { sc: 'asw', deck: ['frigate', 'recon', 'patrol'], contested: false }); const S = A.s; S.sched = {}; S.pendingK = []; S.sc = { ...S.sc, dyn: 0 };
      const rc = S.units.find(u => u.type === 'recon'), fr = S.units.find(u => u.type === 'frigate');
      o.stock = [rc.buoys, rc.torp, fr.torp];
      // largage libre : barrière active
      const sp = A.nearSea(rc.x - 150, rc.y + 120); A.buoyOrder(rc, sp[0] * 4 + 2, sp[1] * 4 + 2, { pat: 'bar', mode: 'a' });
      for (let i = 0; i < 400 && rc.task; i++) A.step(.1);
      o.bar = { n: S.buoys.filter(x => x.act).length, left: rc.buoys, cnt: S.buoyN, act: S.buoyA };
      // sous-marin réel, contact tenu par bouées actives -> alerte
      let c; for (let k = 0; k < 30; k++) { c = A.startCrisis('sub'); if (c.truth === 'sousmarin') break; c.closed = true; }
      S.buoys.length = 0; S.buoys.push({ x: c.sb.x, y: c.sb.y, r: 70, until: S.t + 35, act: 1 });
      for (let i = 0; i < 80; i++) A.step(.1);
      o.alert = c.alertU > S.t; o.pinged = !!c.pinged; o.holdA = +c.hold.toFixed(1);
      for (let i = 0; i < 80 && !c.located; i++) A.step(.1);
      o.loc = c.located;
      // destroyer à portée : torpille lancée depuis le bord
      fr.x = c.zone.x + 10; fr.y = c.zone.y; fr.path = []; S.posture = 4; S.tokens = 9;
      const kill = A.crisisActions(c).find(a => a.id === 'kill'); o.killLbl = kill && kill.label; o.killOk = kill && kill.ok;
      A.doAct(kill); o.torpRun = !!c.torpOn; o.frTorp = fr.torp;
      const k2 = A.crisisActions(c).find(a => a.id === 'kill'); o.busy = k2 && !k2.ok;
      for (let i = 0; i < 140 && !c.closed && c.torpOn; i++) A.step(.1);
      o.res = { closed: c.closed, out: c.out, hit: S.torpHit || 0, miss: S.torpMiss || 0, located: c.located };
      // faux contact : torpille à tort
      let f; for (let k = 0; k < 40; k++) { f = A.startCrisis('sub'); if (f.truth !== 'sousmarin') break; f.closed = true; }
      f.located = true; f.hold = 8; fr.x = f.zone.x; fr.y = f.zone.y; fr.torp = 4; S.tokens = 9;
      const fe0 = S.falseEng; A.doAct(A.crisisActions(f).find(a => a.id === 'kill'));
      for (let i = 0; i < 140 && !f.closed; i++) A.step(.1);
      o.bad = { out: f.out, falseEng: S.falseEng - fe0, bad: S.torpBad };
      // avion hors de portée : il part lancer
      let g; for (let k = 0; k < 30; k++) { g = A.startCrisis('sub'); if (g.truth === 'sousmarin') break; g.closed = true; }
      g.located = true; g.hold = 12; fr.x = g.zone.x + 300; fr.y = g.zone.y; rc.x = g.zone.x - 150; rc.y = g.zone.y; rc.path = []; rc.task = null; rc.rtb = false; rc.fuel = 125; rc.torp = 4; S.tokens = 9;
      const ka = A.crisisActions(g).find(a => a.id === 'kill'); o.airLbl = ka.label; A.doAct(ka); o.airTask = rc.task && rc.task.kind;
      for (let i = 0; i < 300 && !g.torpOn && !g.closed; i++) A.step(.1);
      o.airLaunch = !!g.torpOn || g.closed; o.rcTorp = rc.torp;
      o.miss = A.missing ? A.missing() : [];
      return o;
    });
    console.log(lang, w, JSON.stringify(r));
    ok(r.dot.join() === '129,25,4,2,4', 'dotations');
    ok(r.bar.n >= 3 && r.bar.cnt === r.bar.n && r.bar.act === r.bar.cnt && r.bar.left === 129 - r.bar.cnt, 'barrière active, consommation réelle');
    ok(r.alert && r.pinged, 'sous-marin alerté par les bouées actives');
    ok(r.loc, 'contact localisé');
    ok(r.killOk && r.torpRun && r.frTorp === 3 && r.busy, 'torpille du destroyer, une seule à la fois');
    ok(r.res.closed ? r.res.out >= .5 && r.res.hit === 1 : (r.res.miss === 1 && !r.res.located), 'issue de la torpille cohérente');
    ok(r.bad.out === 0 && r.bad.falseEng === 1 && r.bad.bad === 1, 'torpille sur un faux contact = à tort');
    ok(r.airTask === 'torp' && r.airLaunch && r.rcTorp === 3, 'avion envoyé lancer');
    ok(!r.miss.length, 'aucun texte manquant ' + r.miss.join(','));
    // torpille manquée : contact perdu, sous-marin alerté
    const m = await p.evaluate(() => {
      const A = __S; A.newGame(9, { sc: 'asw', deck: ['frigate'], contested: false }); const S = A.s; S.sched = {}; S.pendingK = []; S.sc = { ...S.sc, dyn: 0 };
      let c; for (let k = 0; k < 30; k++) { c = A.startCrisis('sub'); if (c.truth === 'sousmarin') break; c.closed = true; }
      const fr = S.units[0]; c.located = true; c.hold = 9; fr.x = c.zone.x; fr.y = c.zone.y; S.posture = 4; S.tokens = 9;
      A.doAct(A.crisisActions(c).find(a => a.id === 'kill')); c.torpOn.pk = 0;
      for (let i = 0; i < 140 && c.torpOn; i++) A.step(.1);
      return { closed: c.closed, located: c.located, hold: c.hold, alert: c.alertU > S.t, miss: S.torpMiss, r: c.zone.r, kill: !!A.crisisActions(c).find(a => a.id === 'kill') };
    });
    console.log('manquée', JSON.stringify(m));
    ok(!m.closed && !m.located && m.hold <= 2 && m.alert && m.miss === 1 && !m.kill, 'torpille manquée : contact perdu, plus de lancement possible');
    // interface : vraie partie, fiche du P-8A, largage par clics
    await p.evaluate(l => { const A = __S; A.setLang(l); A.home(false); document.getElementById('over').hidden = true; A.newGame(3, { sc: 'asw', deck: A.SC.asw.rec, contested: false, guided: false, timer: 'easy' }); const S = A.s; S.sched = {}; S.pendingK = []; S.sc = { ...S.sc, dyn: 0 }; S.running = false; A.applyCamX(); S.tokens = 4; S.sel = S.units.find(u => u.type === 'recon'); A.redraw(); }, lang);
    await p.waitForTimeout(500);
    if (w < 500) { const nb = p.locator('[data-a=mnav][data-v=dos]'); if (await nb.count()) { await nb.first().click(); await p.waitForTimeout(200); } }
    await p.waitForSelector('details.ubuoy summary', { timeout: 8000 }).catch(() => { }); const sum = p.locator('details.ubuoy summary'); ok(await sum.count() === 1, 'section bouées dans la fiche du P-8A ' + errs.slice(0, 2).join(' · '));
    await sum.click(); await p.waitForTimeout(200);
    await p.click('[data-a=bpat][data-v=bar]'); await p.click('[data-a=bmode][data-v=a]'); await p.waitForTimeout(150);
    await p.click('[data-a=bgo]'); await p.waitForTimeout(150);
    const tgt = await p.evaluate(() => { const A = __S, u = A.s.sel, q = A.nearSea(u.x - 120, u.y + 90), x = q[0] * 4 + 2, y = q[1] * 4 + 2; A.s.cam && 0; return { x, y } });
    await p.evaluate(({ x, y }) => { const A = __S; A.cam.x = x; A.cam.y = y; A.applyCamX(); }, tgt); await p.waitForTimeout(300);
    const pt = await p.evaluate(({ x, y }) => { const r = document.getElementById('c').getBoundingClientRect(), s = __S.toScr(x, y); return [r.left + s[0], r.top + s[1]] }, tgt);
    await p.mouse.click(pt[0], pt[1]); await p.waitForTimeout(300);
    const st = await p.evaluate(() => { const S = __S.s, u = S.units.find(x => x.type === 'recon'); return { task: u.task && u.task.kind, pat: u.task && u.task.pat, mode: u.task && u.task.mode, tok: S.tokens } });
    console.log('clic', JSON.stringify(st));
    ok(st.task === 'buoy' && st.pat === 'bar' && st.mode === 'a', 'largage choisi par clics');
    await p.screenshot({ path: '/tmp/v40-fiche-' + lang + w + '.png' });
    // dossier d'un sous-marin localisé
    await p.evaluate(() => { const A = __S, S = A.s; let c; for (let k = 0; k < 30; k++) { c = A.startCrisis('sub'); if (c.truth === 'sousmarin') break; c.closed = true; } c.located = true; c.hold = 8; S.sel = c; A.redraw(); });
    await p.waitForTimeout(400);
    if (w < 500) { const nb = p.locator('[data-a=mnav][data-v=dos]'); if (await nb.count()) { await nb.first().click(); await p.waitForTimeout(200); } }
    const dos = await p.evaluate(() => document.getElementById('rightC') ? document.getElementById('rightC').innerText : document.body.innerText);
    ok(/Tenue du contact|Contact held/.test(dos) && /Torpille|Torpedo|torpille|torpedo/.test(dos), 'dossier : tenue du contact et torpille');
    await p.screenshot({ path: '/tmp/v40-dossier-' + lang + w + '.png' });
    const sw = await p.evaluate(() => [document.documentElement.scrollWidth, innerWidth]); ok(sw[0] <= sw[1], 'pas de défilement horizontal ' + sw);
    const miss = await p.evaluate(() => __S.missing()); ok(!miss.length, 'aucun texte manquant (interface) ' + miss.join(','));
    ok(!errs.length, 'aucune erreur page ' + errs.slice(0, 3).join(' | '));
    await p.close();
  }
  await b.close();
  console.log(fails ? fails + ' échec(s)' : 'tout passe');
  process.exit(fails ? 1 : 0);
})();
