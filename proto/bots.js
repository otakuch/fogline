// Stratégies injectées dans la page. o : options qui modifient la stratégie de référence.
window.mkBot = (o = {}) => (S) => {
  const A = window.__S, dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const bestOf = f => o.oracle ? f.truth : Object.entries(A.posterior(f)).sort((x, y) => y[1] - x[1])[0][0];
  if (o.commSpam) { while (99 > 0) { const t0 = 99; A.comm(); if (99 === t0) break; } return; }
  if (S.dip && !o.noDip) {
    if (o.flatter) { for (const x of A.dipActions().filter(z => z.id.startsWith('c:'))) if (x.ok) A.doAct(x); }
    if (o.chanSpam) { const x = A.dipActions().find(z => z.id === 'chan'); if (x && x.ok) A.doAct(x); }
    if (S.dip.req) { const q = A.dipBest(); if (q) A.doAct(q); }
    const lo = A.dipL().slice().sort((a, b) => a.rel - b.rel)[0], cs = A.dipActions().find(z => z.id === 'c:' + lo.k); if (lo.rel < 30 && 99 > 2 && cs && cs.ok) A.doAct(cs);
    if (o.support) for (const x of A.dipActions().filter(z => z.id.startsWith('s:'))) if (x.ok && 99 > 2) A.doAct(x);
  }
  { const d = o.doc || (o.trigger ? 'free' : null); if (d && S.doc !== d && A.setDoc) A.setDoc(d); }
  // version 35 : cyberattaque (o.cyb) ou brouillage (o.jam) d'un contact qui a tiré
  if (o.cyb || o.jam) for (const z of S.ships.filter(z => z.visible && !z.ais && z.hact)) { const L = A.shipActions(z), f = id => L.find(a => a.id === id); if (o.cyb && f('blind') && f('blind').ok && 99 >= f('blind').tok) A.doAct(f('blind')); if (o.jam && f('jam') && f('jam').ok && 99 >= f('jam').tok) A.doAct(f('jam')); }
  if (S.debt > 1.5 && !o.noCoord) A.coord();
  if (S.posture < (o.posture || 2) && !S.postureAt) A.setPosture(o.posture || 2);
  if (o.grp && !S.units.some(u => u.grpL) && (S._gT || 0) <= S.t) { const L = S.units.find(u => u.type === 'frigate' && !u.grp) || S.units.find(u => A.UT[u.type].naval && !u.grp); if (L && A.grpCands(L).length) A.grpForm(L); S._gT = S.t + 30; }
  for (const ob of S.objs.filter(x => x.k === 'identify' && !x.st)) { const need = ob.n - A.s.ships.concat(A.s.gone || []).filter(z => !z.ais && z.ev && z.ev.some(e => e.t >= (ob.turn0 || 0) && e.kind !== 'ais')).length; let k = 0; for (const z of S.ships.filter(z => z.seen && !z.ais && !z.gone && !z.ev.some(e => e.kind !== 'ais')).slice(0, Math.max(0, need))) { const a = A.shipActions(z).find(q => q.id === 'traj'); if (a && a.ok && k++ < 1) A.doAct(a) } }
  const navs = S.units.filter(u => A.UT[u.type].naval && !u.board && !u.assist && !u.pressing && u.ready <= S.t && !(o.grp && u.grp));
  const pz = S.objs.find(x => x.k === 'patrol' && !x.st);
  if (o.patrol && pz && navs[0] && !navs[0].patrol && !navs[0].chase && !navs[0].escort) { const u = navs[0], R = pz.zone.r + A.sensorR(u) * .5, pts = [0, 2.1, 4.2].map(k => ({ x: pz.zone.x + Math.cos(k) * R, y: pz.zone.y + Math.sin(k) * R })); A.patrolStart(u, pts); }
  else if (pz && navs[0] && !navs[0].patrol && !navs[0].chase && !navs[0].path.length && !navs[0].escort && !A.covers(navs[0], pz)) A.orderMove(navs[0], pz.zone.x, pz.zone.y);
  if (S.convoy && !S.convoy.arrived && !S.convoy.lost && navs.length) { const e = navs[navs.length - 1]; if (!e.escort && !e.chase) { e.escort = true; e.task = null; } }
  for (const c of S.crises.filter(c => c.type === 'swarm' && !c.closed)) { const au = A.crisisActions(c).find(a => a.id === 'auth'); if (au && au.ok) A.doAct(au); const nv = navs[0], pr = c.prot; if (nv && pr.hp !== undefined && !nv.path.length && dist(nv, pr) > 90) A.orderMove(nv, pr.x, pr.y); }
  for (const c of S.crises.filter(c => c.type === 'sub' && !c.closed)) {
    const acts = A.crisisActions(c), act = id => acts.find(a => a.id === id);
    if (o.safe) { if (act('dismiss')) { if (!c.cls) A.classify(c, 'bio'); A.doAct(act('dismiss')); } continue; }
    if (o.oracle && c.truth !== 'sousmarin') { if (!c.cls) A.classify(c, c.truth); if (act('dismiss')) A.doAct(act('dismiss')); continue; }
    if (c.found === false) { /* v55 : aucune zone de départ. Le script fouille autour de ce que l'alerte désigne, avec les mêmes ordres que le joueur ; l'omniscient va droit au contact. */
      let h = o.oracle ? { x: c.sb.x, y: c.sb.y } : A.subPub(c); if (!h) continue;
      if (!o.oracle && c.hint.k === 'convoy' && S.convoy && S.convoy.path && S.convoy.path.length) { let left = 185, a = { x: S.convoy.x, y: S.convoy.y }; for (const w of S.convoy.path) { const d = dist(a, w); if (d >= left) { a = { x: a.x + (w.x - a.x) * left / d, y: a.y + (w.y - a.y) * left / d }; left = 0; break } left -= d; a = w } h = a }
      for (const u of S.units.filter(u => (u.type === 'recon' || u.type === 'helo') && A.usable(u) && !u.rtb && !u.task && (u.buoys || 0) >= 3 && !(u.ready > S.t) && !(u.dep > S.t))) { if (S.t - (u._bT || -99) < 22) continue; const k = c._bk = (c._bk || 0) + 1, an = k * 2.4, rr = k === 1 || o.oracle ? 0 : 40 + 22 * ((k - 2) % 3); if (A.buoyOrder(u, h.x + Math.cos(an) * rr, h.y + Math.sin(an) * rr, { pat: 'tri', mode: 'a', dep: k % 2 ? 's' : 'd' })) u._bT = S.t; }
      S.units.filter(u => A.UT[u.type].naval && A.usable(u) && A.sonR(u) >= 40 && !u.pressing && !u.escort && !u.board && !u.assist).forEach((u, i) => { if (!u.path.length && dist(u, h) > 55) { const an = i * 3.1 + 1; A.orderMove(u, h.x + Math.cos(an) * 30, h.y + Math.sin(an) * 30) } });
      const ls = act('ssn'); if (ls && ls.ok) A.doAct(ls);
      const pg = acts.find(a => a.id.startsWith('ping:') && a.ok && S.units.some(u => u.id === a.unit && A.UT[u.type].naval && dist(u, h) < 70)); if (pg) A.doAct(pg);
      continue;
    }
    if (!S.buoys.length && act('buoy') && act('buoy').ok && !S.units.some(u => u.task && u.task.kind === 'buoy')) A.doAct(act('buoy'));
    else if (act('dip') && act('dip').ok && !S.buoys.length) A.doAct(act('dip'));
    else if (!S.buoys.length && !c.located) { const pg = acts.find(a => a.id.startsWith('ping:') && a.ok); if (pg) A.doAct(pg); }
    const best = bestOf(c);
    if (c.ev.length && !c.cls) A.classify(c, best);
    if (o.torp && c.located && best === 'sousmarin' && act('kill') && act('kill').ok) A.doAct(act('kill'));
    else if (act('press') && act('press').ok) A.doAct(act('press'));
    if (o.oracle && !c.pressU && navs[0] && c.located === undefined) { /* attend le contact */ }
    if (c.ev.length && best !== 'sousmarin' && act('dismiss')) A.doAct(act('dismiss'));
  }
  for (const c of S.crises.filter(c => ['mine', 'evac', 'seabed', 'mirror', 'alarm', 'expose'].includes(c.type) && !c.closed && !c.choice)) {
    const acts = A.crisisActions(c), col = acts.find(a => a.kind === 'collect' && a.ok), left = c.deadline - S.t;
    if (!o.safe && !o.oracle && col && !c.ev.length && left > 25) { A.doAct(col); continue; }
    if (S.jobs.some(j => j.f === c) && left > 12) continue;
    const q = A.deepPick(c, bestOf(c)); if (q && 99 >= (q.tok || 0)) A.doAct(q);
  }
  for (const c of S.crises.filter(c => c.type === 'seize' && !c.closed && !c.choice)) {
    const acts = A.crisisActions(c), act = id => acts.find(a => a.id === id), col = acts.find(a => a.kind === 'collect' && a.ok), left = c.deadline - S.t;
    if (!o.safe && !o.oracle && col && !c.ev.length && left > 25) { A.doAct(col); continue; }
    if (S.jobs.some(j => j.f === c) && left > 12) continue;
    if (act('iso2') && act('iso2').ok && left > 35) A.doAct(act('iso2'));
    const best = bestOf(c); if (c.ev.length && !c.cls) A.classify(c, best);
    if (best === 'revend' && act('neg')) { A.doAct(act('neg')); continue; }
    const sfU = S.units.find(u => u.type === 'sof'), sfH = sfU && A.sofHost && A.sofHost(sfU), sfFar = !!(sfH && sfU.aboard && Math.hypot(sfH.x - c.zone.x, sfH.y - c.zone.y) > A.SOF_R - 8); if (sfFar && !sfH.path.length && !sfH.board && !sfH.da) A.orderMove(sfH, c.zone.x, c.zone.y); /* v51 : rapprocher le bâtiment porteur */
    const da = act('da'); if (da) { if (S.posture < 3 && !S.postureAt) A.setPosture(3); else if (da.ok) A.doAct(da); else if (!da.ok && !sfFar && S.posture >= 3 && act('neg')) A.doAct(act('neg')); }
  }
  for (const c of S.crises.filter(c => !c.closed && !c.silent && !c.choice && c.type !== 'sub' && c.type !== 'swarm' && c.type !== 'seize' && !['mine', 'evac', 'seabed', 'mirror', 'alarm', 'expose'].includes(c.type))) {
    const acts = A.crisisActions(c), act = id => acts.find(a => a.id === id), col = acts.find(a => a.kind === 'collect' && a.ok), left = c.deadline ? c.deadline - S.t : 99;
    if (!o.safe && (!o.oracle || c.type === 'cyber') && c.hyp && col && !c.ev.length && left > 15 && c.type !== 'jam') { A.doAct(col); continue; }
    if (S.jobs.some(j => j.f === c) && left > 8) continue;
    const best = c.hyp ? bestOf(c) : null;
    if (c.hyp && !c.cls && best && !o.noClass) A.classify(c, best);
    if (o.safe) {
      if (c.type === 'incursion') A.doAct(act('C'));
      if (c.type === 'cyber') A.doAct(act('iso'));
      if (c.type === 'desinfo') A.doAct(act('facts'));
    } else {
      if (c.type === 'incursion') { const k = o.oracle ? ({ sondage: 'A', erreur: 'C', feinte: 'C' }[c.truth]) : (c.sig === 'sondage' ? 'A' : 'C'); A.doAct(act(k) && act(k).ok ? act(k) : act('C')); }
      if (c.type === 'cyber') { const k = act('hunt') && act('hunt').ok && best !== 'faux' ? 'hunt' : (best === 'faux' ? null : 'iso'); if (k) A.doAct(act(k)); }
      if (c.type === 'desinfo') A.doAct(act(best === 'manip' ? 'refute' : 'facts'));
    }
    if (c.type === 'sar') { if (!c.assistU && act('assist') && act('assist').ok) A.doAct(act('assist')); else if (!c.assistU) A.doAct(act('deleg')); }
    if (c.type === 'site' && !c.secU && act('secure')) A.doAct(act('secure'));
    if (c.type === 'jam' && act('repli') && act('repli').ok) A.doAct(act('repli'));
  }
  if (o.oracle) { // triche : connaît la position et la nature des navires hostiles
    for (const s of S.ships.filter(s => (s.truth === 'rouge' || s.truth === 'fantome') && !s.stopped && !s.boarded && !s.gone2)) {
      s.seen = true; s.located = true; s.visible = true; s.last = { x: s.x, y: s.y, t: S.t };
      if (!s.cls) A.classify(s, s.truth);
      const acts = A.shipActions(s), fl = acts.find(a => a.id === 'flag'); if (s.truth === 'fantome' && fl.ok) A.doAct(fl);
      const go = acts.find(a => a.id === 'sail' || a.id === 'board'); if (go && (go.id === 'sail' ? !S.units.some(u => u.chase === s) : 99 > 0)) A.doAct(go);
    }
  } else {
    for (const c of S.crises.filter(c => c.type === 'ghost' && !c.closed)) {
      const acts = A.crisisActions(c), z = acts.find(a => a.id === 'zone'), rr = S.units.find(u => u.type === 'recon');
      if (z && rr && !rr.path.length && !rr.task && dist(rr, c.zone) > 60) A.doAct(z);
      for (const f of acts.filter(a => a.id.startsWith('focus:'))) { const s = S.ships.find(x => x.id === f.id.slice(6)); if (!s) continue; const fl = A.shipActions(s).find(a => a.id === 'flag'); if (fl.ok) A.doAct(fl); if (s.flagBad && !s.cls) A.classify(s, 'fantome'); }
    }
    const r = S.units.find(u => u.type === 'recon');
    if (r && !r.task && !r.rtb && r.ready <= S.t) { const g = S.signals.find(z => !z.lock); if (g) A.orderTrack(r, g); }
    for (const s of S.ships) {
      if (!s.seen || s.distress || s.boarded || (s.ais && !s.located)) continue;
      const acts = A.shipActions(s), act = id => acts.find(a => a.id === id);
      if (s.located && !s.ev.some(e => e.kind === 'flag') && act('flag').ok) A.doAct(act('flag'));
      const q = A.posterior(s), best = Object.keys(q).sort((a, b) => q[b] - q[a])[0];
      if (!s.cls && s.ev.length >= 2 && !o.noClass) A.classify(s, best);
      if (o.boardAll || (s.cls && (s.cls.h === 'rouge' || s.cls.h === 'fantome') && !s.stopped && (s.flagBad || q.rouge > .75))) { const go = act('sail') || act('board'); if (go && (go.id === 'sail' || 99 > 0)) A.doAct(go); }
    }
  }
  // combat : feu sur ce qui est estimé hostile armé, défense autorisée
  for (const c of S.crises.filter(c => c.type === 'salvo' && !c.closed)) { const au = A.crisisActions(c).find(a => a.id === 'auth'); if (au && au.ok) A.doAct(au); const nv = navs[0]; if (nv && !nv.path.length && dist(nv, c.prot) > 90) A.orderMove(nv, c.prot.x, c.prot.y); const fg = S.units.find(u => u.type === 'fighter' && u.ready <= S.t && !u.task && !u.rtb); if (fg && dist(fg, c.prot) > 90 && !fg.path.length) A.orderMove(fg, c.prot.x, c.prot.y); }
  if (!o.noFire) {
    const raids = S.crises.filter(c => c.type === 'raid' && !c.closed);
    if (raids.length && S.posture < 4 && !S.postureAt && (S.fired || o.trigger || o.oracle)) A.setPosture(4);
    if (!raids.length && S.posture === 4 && !S.postureAt && !o.trigger) A.setPosture(2);
    for (const c of raids) { const z = A.crisisActions(c).find(a => a.id === 'zone'), rr = S.units.find(u => u.type === 'recon'); if (z && rr && !rr.path.length && !rr.task && dist(rr, c.zone) > 60 && !c.raiders.some(r => r.visible)) A.doAct(z); }
    for (const s of S.ships) { if (!s.visible || s.stopped) continue; const hostile = o.trigger ? !s.ais : (o.oracle ? s.truth === 'raider' : (s.cr && s.located) || (s.cls && s.cls.h === 'raider')); if (!hostile) continue; if (!s.cls && s.ev.length && !o.noClass) A.classify(s, o.oracle ? s.truth : 'raider'); const go = A.shipActions(s).find(a => a.id === 'fire' || a.id === 'closein'); if (go && (go.id === 'closein' || 99 > 0)) A.doAct(go); }
  }
  const e = S.units.find(u => u.type === 'repair');
  if (e && !e.path.length) { const c = [...A.assets].sort((a, b) => a.hp - b.hp)[0]; if (c.hp < 85) { const q = c.pts ? nearestOn(c, e) : c; /* v46 : point du câble le plus proche du câblier */ if (dist(e, q) > 30) A.orderMove(e, q.x, q.y); } }
};
window.playGame = (seed, sc, cfg, pol, chk) => {
  window.__noEsc = !cfg.esc; window.__subZone = cfg.subzone ? 1 : 0; /* v55 : les scripts jouent le jeu réel, sans zone de départ */ const A = window.__S; A.newGame(seed, { sc, deck: cfg.deck || A.SC[sc].rec, contested: !!cfg.contested, ideal: !!cfg.ideal, guided: cfg.guided !== undefined ? !!cfg.guided : !!window.__GUIDED, timer: cfg.timer || window.__TIMER, qx: cfg.qx || null, real: !!(cfg.real || window.__REAL), fleet: cfg.fleet || null, novar: !!cfg.novar }); A.startJams(); if (cfg.evade === false) A.s.evade = false; if (cfg.wstate) A.s.wstate = cfg.wstate;
  const S = A.s; S.running = false; let i = 0;
  for (; i < 16000 && !S.over; i++) { A.step(.1); if (i % (window.BOTCAD || 50) === 0 && pol) pol(S); if (i % 10 === 0 && chk) chk(S, sc); }
  const r = A.score();
  return { s: r.s, ok: r.ok ? 1 : 0, st: r.stars, oo: r.doneO / r.allO, lost: S.crises.filter(c => c.closed && c.out < .5).length, n: S.crises.length, fe: S.falseEng + S.falseBoard, done: S.over ? 1 : 0, cgc: r.cgc, se1: S.seuil1 ? 1 : 0, infra: A.infra(), ul: S.unitsLost, shots: S.shots, cps: S.checks.filter(c => !c.ok).length, opt: S.checks.some(c => c.opt < 3) ? 1 : 0, cp_inf: S.checks.some(c => c.infra < 60) ? 1 : 0,
    failObj: S.objs.filter(x => x.st !== 1).map(x => { const t_ = x.c || x.k; return x.key + (x.c && !S.crises.some(c => c.type === x.c) ? '!absent' : ''); }), brk: S.asm.filter(x => x.state === 'broken').map(x => x.id) };
};

// joueur qui ne fait que suivre le conseil affiché, comme un débutant qui clique sur le bouton
window.mkAdvisor = () => S => { const A = window.__S; for (let k = 0; k < 3; k++) { const o = A.advise(); if (!o || o.wait || !A.applyAdvice(o)) break; } };
