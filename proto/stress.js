// Banc d'essai. Usage : node stress.js [seeds] [partie...]  parties : inv exploit pair labo monkey deck
const { chromium } = require('playwright');
const fs = require('fs');
const seeds = +(process.argv[2] || 6), parts = process.argv.slice(3);
const want = k => !parts.length || parts.includes(k);
(async () => {
  const b = await chromium.launch();
  const errs = [];
  const mk = async (init) => { const p = await b.newPage({ viewport: { width: 1440, height: 860 } }); p.on('pageerror', e => errs.push(e.message + ' @ ' + (e.stack || '').split('\n')[1])); if (process.env.TIMER) await p.addInitScript(v => { window.__TIMER = v }, process.env.TIMER); if (process.env.SIMPLE) await p.addInitScript(() => { window.__GUIDED = 1 }); if (init) await p.addInitScript(init); await p.goto('file://' + __dirname + '/seuil-prototype.html'); await p.addScriptTag({ path: __dirname + '/bots.js' }); await p.waitForTimeout(300); return p; };
  const p = await mk();
  const OUT = {};
  if (want('inv')) {
    // contrôles d'état à chaque seconde simulée, pour toutes les stratégies et conditions
    const r = await p.evaluate((seeds) => {
      const A = __S, bad = {}, note = (k, sc) => { (bad[k] = bad[k] || { n: 0, sc: {} }).n++; bad[k].sc[sc] = 1; };
      const land = (x, y) => { try { return A.isDeep(x, y); } catch (_) { return false; } };
      const chk = (S, sc) => {
        ['se', 'cs', 'ri', 'tension', 'debt', 'tokens', 't', 'defense'].forEach(k => { if (!Number.isFinite(S[k])) note('nombre invalide ' + k, sc); });
        if (S.tokens < 0) note('jetons négatifs', sc); if (S.tokens > 7) note('jetons > 7', sc);
        A.assets.forEach(a => { if (!(a.hp >= 0 && a.hp <= 100)) note('hp hors bornes', sc); });
        S.units.forEach(u => { if (!Number.isFinite(u.x + u.y)) note('unité NaN', sc); if (u.x < -30 || u.x > 1470 || u.y < -30 || u.y > 930) note('unité hors carte', sc); if (!A.UT[u.type].air && land(u.x, u.y)) note('navire allié sur terre', sc); if (u.fuel < -1) note('carburant négatif', sc); if (u.buoys < 0) note('bouées négatives', sc); });
        S.ships.forEach(s => { if (!Number.isFinite(s.x + s.y)) note('navire NaN', sc); if (s.truth !== 'civil' && land(s.x, s.y)) note('navire hostile sur terre', sc); if (s.held && !s.distress && !S.units.some(u => u.board && u.board.s === s)) note('navire bloqué sans arraisonnement', sc); });
        S.crises.forEach(c => { if (!c.closed && !c.silent && S.t - c.start > 240) note('crise ouverte > 8 tours : ' + c.type, sc); if (c.choice && !c.closed && S.t - (c.resolveAt || 0) > 2) note('décision jamais résolue : ' + c.type, sc); });
        S.units.forEach(u => { if (u.assist && u.assist.closed) note('unité liée à une crise close', sc); });
        if (S.convoy && S.convoy.hp < 0) note('convoi hp < 0', sc);
      };
      let games = 0, nonfini = 0; const det = [];
      const bot = mkBot(), rash = (S) => { if (S.posture < 3 && !S.postureAt && S.tokens > 0) A.setPosture(3); for (const c of S.crises.filter(c => !c.closed && !c.silent && !c.choice)) { const ac = A.crisisActions(c).filter(a => a.kind === 'decide' && a.ok); if (ac[0]) A.doAct(ac[Math.floor(Math.random() * ac.length)]); } };
      for (const sc of Object.keys(A.SC)) for (let sd = 1; sd <= seeds; sd++) for (const [cfg, pol] of [[{ contested: true }, bot], [{ contested: true, ideal: true }, bot], [{ contested: true }, rash], [{ contested: false }, null]]) { const r = playGame(sd * 11 + 1, sc, cfg, pol, chk); games++; if (!r.done) nonfini++; }
      for (const sc of Object.keys(A.SC)) { const x = playGame(5, sc, { contested: true }, mkBot()), y = playGame(5, sc, { contested: true }, mkBot()); if (x.s !== y.s || x.lost !== y.lost) det.push(sc); }
      return { games, nonfini, bad, nonDet: det };
    }, seeds);
    OUT.inv = r; console.log('== INVARIANTS', r.games, 'parties, non finies', r.nonfini, 'non déterministes', r.nonDet.join(',') || 'aucun');
    Object.entries(r.bad).sort((a, b) => b[1].n - a[1].n).forEach(([k, v]) => console.log('  ', k, v.n, Object.keys(v.sc).join(',')));
  }
  if (want('exploit')) {
    const r = await p.evaluate((seeds) => {
      const A = __S, S0 = { ref: [{}, {}], oracle: [{ oracle: true }, {}], safe: [{ safe: true }, {}], commSpam: [{ commSpam: true }, {}], boardAll: [{ boardAll: true }, {}], noClass: [{ noClass: true }, {}], gachette: [{ trigger: true, posture: 4 }, {}], sansTir: [{ noFire: true }, {}], sansDiplo: [{ noDip: true }, {}], flatteur: [{ flatter: true }, {}], canal: [{ chanSpam: true }, {}], soutien: [{ support: true }, {}], rien: [null, {}], videDeck: [null, { deck: [] }], };
      const out = {};
      for (const [n, [o, cfg]] of Object.entries(S0)) { out[n] = {}; for (const sc of Object.keys(A.SC)) { const rows = []; for (let sd = 1; sd <= seeds; sd++) rows.push(playGame(sd * 13 + 2, sc, { contested: true, ...cfg }, o ? mkBot(o) : null)); out[n][sc] = rows; } }
      return out;
    }, seeds);
    OUT.exploit = r; const m = (a, k) => a.reduce((x, y) => x + y[k], 0) / a.length;
    console.log('== EXPLOITS (moyenne toutes missions) score / réussite / étoiles / CGC');
    for (const [n, v] of Object.entries(r)) { const all = Object.values(v).flat(); console.log('  ', n.padEnd(10), m(all, 's').toFixed(0), (m(all, 'ok') * 100).toFixed(0) + '%', m(all, 'st').toFixed(1), m(all, 'cgc').toFixed(0), 'seuil1', (m(all, 'se1') * 100).toFixed(0) + '%', 'faux', m(all, 'fe').toFixed(1)); }
    console.log('== OMNISCIENT PAR MISSION (borne haute) score/réussite/étoiles — objectifs manqués — référence');
    for (const sc of Object.keys(r.oracle)) { const a = r.oracle[sc], f = {}; a.forEach(x => x.failObj.forEach(k => f[k] = (f[k] || 0) + 1)); console.log('  ', sc.padEnd(4), m(a, 's').toFixed(0), (m(a, 'ok') * 100).toFixed(0) + '%', m(a, 'st').toFixed(1), 'opt<3', (m(a, 'opt') * 100).toFixed(0) + '%', 'inf<60', (m(a, 'cp_inf') * 100).toFixed(0) + '%', JSON.stringify(f), '| ref', m(r.ref[sc], 's').toFixed(0), (m(r.ref[sc], 'ok') * 100).toFixed(0) + '%'); }
  }
  if (want('pair')) {
    const r = await p.evaluate((seeds) => { const A = __S, out = {}; for (const sc of Object.keys(A.SC)) { const row = { fx: [], ct: [], id: [] }; for (let sd = 1; sd <= seeds; sd++) { const s = sd * 17 + 3; window.BOTCAD = 150; row.fx.push(playGame(s, sc, { contested: false }, mkBot())); row.ct.push(playGame(s, sc, { contested: true }, mkBot())); row.id.push(playGame(s, sc, { contested: true, ideal: true }, mkBot())); window.BOTCAD = 50; } out[sc] = row; } return out; }, seeds);
    OUT.pair = r; const m = (a, k) => a.reduce((x, y) => x + y[k], 0) / a.length;
    console.log('== MÊME TIRAGE : tenues / contestées / contestées horloge idéale'); let F = 0, C = 0, I = 0, neg = 0;
    for (const [sc, v] of Object.entries(r)) { const f = m(v.fx, 's'), c = m(v.ct, 's'), i = m(v.id, 's'); F += f; C += c; I += i; if (c > f) neg++; console.log('  ', sc.padEnd(4), f.toFixed(0), c.toFixed(0), i.toFixed(0), ' réussite', (m(v.fx, 'ok') * 100).toFixed(0), (m(v.ct, 'ok') * 100).toFixed(0), (m(v.id, 'ok') * 100).toFixed(0)); }
    const n = Object.keys(r).length; console.log('   MOYENNE', (F / n).toFixed(0), (C / n).toFixed(0), (I / n).toFixed(0), 'missions où contester aide :', neg);
    const eff = {}; Object.values(r).forEach(v => v.ct.forEach((x, i) => x.brk.forEach(id => { (eff[id] = eff[id] || []).push(x.s - v.fx[i].s); }))); console.log('   écart de score par hypothèse cédée :', Object.entries(eff).map(([k, a]) => k + ' ' + (a.reduce((x, y) => x + y, 0) / a.length).toFixed(0) + ' (' + a.length + ')').sort().join(' | '));
  }
  if (want('labo')) {
    // chaque mécanique isolée, sans le bruit du reste de la partie
    const r = await p.evaluate(() => {
      const A = __S, mean = a => a.reduce((x, y) => x + y, 0) / Math.max(1, a.length), R = {};
      const fresh = (sd, sc, deck) => { A.newGame(sd, { sc, deck, contested: false }); const S = A.s; S.sched = {}; S.pendingK = []; S.sc = { ...S.sc, dyn: 0 }; return S; };
      const run = (S, sec, f) => { for (let i = 0; i < sec * 10 && !S.over; i++) { A.step(.1); if (f) f(S, i); } };
      // 1. réparation contre sabotage sur la même liaison
      { const a = [], b = []; for (let sd = 1; sd <= 5; sd++) for (const rep of [0, 1]) { const S = fresh(sd, 'ia', rep ? ['repair'] : ['drone']); const c = A.startCrisis('sabotage'), s = c.ship; s.x = s.pt.x; s.y = s.pt.y; s.path = []; s.emit = 1e9; const tg = s.tgt; tg.hp = 50; /* le saboteur s'en va : la réparation est interdite tant qu'il attaque le câble */ S.ships = S.ships.filter(x => x !== s); c.closed = true; if (rep) { const u = S.units.find(x => x.type === 'repair'); u.x = s.pt.x + 5; u.y = s.pt.y; u.path = []; } run(S, 60); (rep ? b : a).push(tg.hp); } R.reparation = { sans: mean(a).toFixed(0), avec: mean(b).toFixed(0) }; }
      // 2. navire fantôme : peut-on le rattraper, et combien de temps reste-t-il sur zone
      { const d = [], cat = []; for (let sd = 1; sd <= 8; sd++) { const S = fresh(sd, 'ia', ['patrol']); const c = A.startCrisis('ghost'), s = c.ship; const L = (s.path || []).reduce((acc, p, i, arr) => acc + (i ? Math.hypot(p.x - arr[i - 1].x, p.y - arr[i - 1].y) : 0), 0); d.push(L / s.v); const u = S.units[0]; cat.push(Math.hypot(u.x - s.x, u.y - s.y) / (A.UT.patrol.speed - s.v)); } R.fantome = { dureeSurZone_s: mean(d).toFixed(0), rattrapageMoyen_s: mean(cat).toFixed(0) }; }
      // 3. essaim : part des pistes hostiles arrêtées selon le défenseur, autorisation donnée d'emblée
      for (const [nm, deck] of [['patrouilleur', ['patrol']], ['fregate', ['frigate']], ['patrouilleur_drone', ['patrol', 'drone']]]) for (const strict of [false, true]) { const res = [], fe = []; for (let sd = 1; sd <= 8; sd++) { const S = fresh(sd, 'i6', deck); S.posture = 2; const c = A.startCrisis('swarm'); c.authAt = .01; c.strict = strict; const u = S.units[0]; const dr = S.units.find(x => x.type === 'drone'); if (dr) { dr.x = u.x; dr.y = u.y; } run(S, 90, () => { }); res.push(c.closed ? c.out : -1); fe.push(S.falseEng); } R['essaim_' + nm + (strict ? '_strict' : '')] = { issue: mean(res).toFixed(2), faux: mean(fe).toFixed(1) }; }
      // 4. sous-marin : détection par une ligne de bouées lancée sur la zone annoncée
      { const hit = [], t = []; for (let sd = 1; sd <= 16; sd++) { const S = fresh(sd, 'i8', ['recon']); const c = A.startCrisis('sub'); if (c.truth !== 'sousmarin') continue; const u = S.units[0]; u.x = c.zone.x; u.y = c.zone.y; u.path = []; u.task = { kind: 'buoy', z: { x: c.zone.x, y: c.zone.y } }; let tl = -1; run(S, 60, (s, i) => { if (c.located && tl < 0) tl = i / 10; }); hit.push(tl >= 0 ? 1 : 0); if (tl >= 0) t.push(tl); } R.bouees = { detection: mean(hit).toFixed(2), delai_s: mean(t).toFixed(0), n: hit.length }; }
      // 5. spirale : à CGC bas, une gestion correcte permet-elle de remonter ?
      { const rec = []; for (let sd = 1; sd <= 8; sd++) { A.newGame(sd * 3, { sc: 'ia', deck: A.SC.ia.rec, contested: false }); const S = A.s; S.se = S.cs = S.ri = 30; const bot = mkBot(); let i = 0; for (; i < 1500 && !S.over; i++) { A.step(.1); if (i % 10 === 0) bot(S); } rec.push(A.pil()); } R.spirale = { depart: 30, apres50s_x3: mean(rec).toFixed(0) }; }
      // 6. réponse sûre : valeur attendue de chaque réponse d'après les tables, par crise
      return R;
    });
    OUT.labo = r; console.log('== MÉCANIQUES ISOLÉES'); Object.entries(r).forEach(([k, v]) => console.log('  ', k.padEnd(30), JSON.stringify(v)));
  }
  if (want('deck')) {
    const r = await p.evaluate((seeds) => { const A = __S, cards = ['armed', 'recon', 'drone', 'patrol', 'frigate', 'fighter', 'repair', 'team', 'analysis', 'comm'], cost = k => A.UT[k].cost, max = k => A.UT[k].max; let x = 12345; const rn = () => (x = (x * 16807) % 2147483647) / 2147483647; const out = {};
      for (const sc of Object.keys(A.SC)) { const B = A.SC[sc].budget, rows = []; for (let d = 0; d < 14; d++) { const deck = []; let left = B, tries = 0; while (tries++ < 30) { const k = cards[Math.floor(rn() * cards.length)]; if (cost(k) <= left && deck.filter(y => y === k).length < max(k)) { deck.push(k); left -= cost(k); } } let s = 0, ok = 0; for (let sd = 1; sd <= seeds; sd++) { const g = playGame(sd * 19 + d, sc, { contested: true, deck }, mkBot()); s += g.s; ok += g.ok; } rows.push({ deck, s: s / seeds, ok: ok / seeds }); } out[sc] = rows; } return out; }, Math.max(2, seeds >> 1));
    OUT.deck = r; const all = Object.values(r).flat(), cards = ['armed', 'recon', 'drone', 'patrol', 'frigate', 'fighter', 'repair', 'team', 'analysis', 'comm'];
    console.log('== CARTES : score moyen avec et sans, sur decks tirés au hasard'); cards.forEach(k => { const w = all.filter(x => x.deck.includes(k)), wo = all.filter(x => !x.deck.includes(k)), m = a => a.reduce((s, y) => s + y.s, 0) / Math.max(1, a.length); console.log('  ', k.padEnd(9), m(w).toFixed(0), m(wo).toFixed(0), 'écart', (m(w) - m(wo)).toFixed(0), 'n', w.length); });
  }
  if (want('monkey')) {
    // clics au hasard sur toute l'interface, dans les deux langues, avec la vraie boucle de rendu
    const q = await mk(() => { window.requestAnimationFrame = cb => { window.__raf = cb; return 1; }; });
    const r = await q.evaluate(async () => {
      const A = __S, tick = (t) => { const c = __raf; __raf = null; c && c(t); }; let ts = 1000, clicks = 0, stuck = 0; let x = 777; const rn = () => (x = (x * 16807) % 2147483647) / 2147483647;
      for (const lang of ['fr', 'en']) { A.setLang(lang); for (const sc of Object.keys(A.SC)) {
        window.__noEsc = false; A.newGame(rn() * 1e6 | 0, { sc, deck: A.SC[sc].rec, contested: true, guided: rn() < .5 }); A.startJams(); const S = A.s; S.running = true; S.speed = 4;
        for (let i = 0; i < 500 && !S.over; i++) { ts += 100; tick(ts);
          if (i % 2 === 0) { const bs = [...document.querySelectorAll('#app [data-a]:not([disabled])')].filter(e => !['mute','quit','coachquit'].includes(e.dataset.a)); const e = bs[Math.floor(rn() * bs.length)]; if (e) { e.click(); clicks++; } if (!S.running && e && e.dataset.a === 'speed') { } S.running = true; }
          if (i % 5 === 0) { const c = document.getElementById('c'), r = c.getBoundingClientRect(), o = { clientX: r.left + rn() * r.width, clientY: r.top + rn() * r.height, pointerId: 1, bubbles: true }; try { c.setPointerCapture = () => { }; } catch (_) { } c.dispatchEvent(new PointerEvent('pointerdown', o)); c.dispatchEvent(new PointerEvent('pointerup', o)); clicks++; }
        }
        for (let i = 0; i < 8000 && !S.over; i++) A.step(.1); ts += 100; tick(ts);
        const ov = document.getElementById('over'); if (S.over && !ov.querySelector('.go[data-a=again],.go[data-a=play]')) stuck++;
      } }
      return { clicks, stuck, missing: A.missing() };
    });
    OUT.monkey = r; console.log('== CLICS AU HASARD', JSON.stringify(r));
  }
  console.log('ERREURS PAGE', [...new Set(errs)].length); [...new Set(errs)].slice(0, 12).forEach(e => console.log('  ', e));
  fs.writeFileSync(__dirname + '/stress_' + (process.env.TAG || 'run') + '.json', JSON.stringify(OUT));
  await b.close();
})();
