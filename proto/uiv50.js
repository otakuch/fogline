// Version 50 : convoi humanitaire, seuil de 50 % des navires, bouées à l'unité, profondeur et couche acoustique.
// Cas d'acceptation du pack (H01 à H12, B01 à B09, S01 à S06, G02) et constats F01, F03, F05, F06 de l'audit V48.
const { chromium } = require('playwright'), path = require('path'), fs = require('fs');
(async () => {
  const b = await chromium.launch(); let fail = 0, n = 0; const ok = (id, c, d) => { n++; if (!c) fail++; console.log((c ? 'ok   ' : 'ÉCHEC') + ' ' + id + (d !== undefined ? ' · ' + (typeof d === 'string' ? d : JSON.stringify(d)) : '')); };
  const open = async (w, h, lang) => { const ctx = await b.newContext({ viewport: { width: w, height: h } }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); await p.addInitScript(l => { try { localStorage.setItem('seuil.lang', l) } catch (_) { } }, lang); await p.goto('file://' + path.join(__dirname, 't.html')); await p.addScriptTag({ path: path.join(__dirname, 'bots.js') }); await p.waitForTimeout(700); return { p, errs, ctx }; };
  const { p, errs } = await open(1440, 900, 'fr');
  const R = await p.evaluate(() => {
    const A = __S, V = A.v50, out = {}; const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    const start = (sc, cfg = {}, seed = 60) => { A.newGame(seed, Object.assign({ sc, deck: A.SC[sc].rec, guided: false, novar: true }, cfg)); A.startJams(); const S = A.s; S.running = false; return S; };
    const quiet = S => { S.sched = {}; S.pendingK = []; S.sc = Object.assign({}, S.sc, { dyn: 0 }); if (S.hc) S.hc.evs = []; };
    const cut = (S, k) => { const H = S.hc; H.ships.length = k; H.manifest.length = k; H.initialProtectedShipIds.length = k; };
    const nL = S => S.crises.filter(c => c.type === 'hcloss').length, thr = S => S.hc.events.filter(e => e.id === 'humanitarian-loss-threshold').length;
    // H01
    { const S = start('hc'); quiet(S); let land = 0, jump = 0, prev = S.hc.ships.map(s => ({ x: s.x, y: s.y })), t0 = S.hc.ships.map(s => ({ x: s.x, y: s.y })); for (let i = 0; i < 6600 && !S.hc.done && !S.over; i++) { A.step(.1); S.hc.ships.forEach((s, k) => { if (s.st !== 'underway') return; if (!V.seaAt(s.x, s.y)) land++; if (dist(s, prev[k]) > 3) jump++; prev[k] = { x: s.x, y: s.y }; }); }
      out.H01 = { arrived: S.hc.ships.filter(s => s.st === 'arrived').length, land, jump, state: S.hc.state, moved: Math.round(dist(S.hc.ships[0], t0[0])), t: Math.round(S.t), distinct: new Set(t0.map(q => Math.round(q.x) + ',' + Math.round(q.y))).size, obj: S.objs.find(o => o.k === 'convoy').st }; }
    // H02, H03
    { const S = start('hc'); quiet(S); cut(S, 4); const H = S.hc; V.hcLose(H.ships[0]); V.hcCheck(); V.hcDamage(H.ships[1], 30); V.hcDamage(H.ships[2], 45); H.ships[3].dis = S.t + 30; const a = nL(S); V.hcLose(H.ships[1]); V.hcCheck(); V.hcDamage(H.ships[2], 20); V.hcDamage(H.ships[2], 20); out.H02 = { before: a, after: nL(S), thr: thr(S) }; }
    // H04
    { const S = start('hc'); quiet(S); cut(S, 5); const H = S.hc; V.hcLose(H.ships[0]); V.hcLose(H.ships[1]); V.hcCheck(); const a = nL(S); V.hcLose(H.ships[2]); V.hcCheck(); out.H04 = { at2: a, at3: nL(S) }; }
    // H05, H09
    { const S = start('hc'); quiet(S); const H = S.hc; for (let i = 0; i < 4; i++)V.hcLose(H.ships[i]); V.hcCheck(); V.hcCheck(); const c = S.crises.find(x => x.type === 'hcloss'), acts = A.crisisActions(c).filter(x => x.kind === 'decide'); for (let i = 0; i < 100; i++)A.step(.1); out.H05 = { crises: nL(S), thr: thr(S), lost: H.lostIds.length }; out.H09 = { over: !!S.over, acts: acts.map(x => x.id + ':' + (x.ok ? 1 : 0)).join(' '), afloat: V.hcAfloat().length, state: H.state, objSt: S.objs.find(o => o.k === 'convoy').st }; }
    // H06
    { const S = start('hc'); quiet(S); const H = S.hc, u = S.units.find(x => A.UT[x.type].naval); A.hitUnit(u, 100); H.ships[4].st = 'arrived'; H.ships[5].st = 'arrived'; V.hcLose(H.ships[0]); V.hcLose(H.ships[1]); V.hcCheck(); const a = nL(S); V.hcLose(H.ships[2]); V.hcCheck(); out.H06 = { n: H.initialProtectedShipIds.length, at2: a, at3: nL(S), manifest: H.manifest.length, arrivedKept: H.ships.filter(s => s.st === 'arrived').length }; }
    // H07
    { const S0 = start('hc'); quiet(S0); for (let i = 0; i < 20; i++)A.step(.1); for (let i = 0; i < 3; i++)V.hcLose(S0.hc.ships[i]); V.hcCheck(); const s1 = A.saveGame(true); A.loadGame(); let S = A.s; S.running = false; for (let i = 0; i < 20; i++)A.step(.1); V.hcCheck(); const m1 = nL(S); A.saveGame(true); A.loadGame(); S = A.s; S.running = false; for (let i = 0; i < 20; i++)A.step(.1); V.hcCheck(); out.H07 = { saved: s1, m1, m2: nL(S), thr: thr(S), lost: S.hc.lostIds.length, n: S.hc.initialProtectedShipIds.length, err: window.__svErr || '' }; }
    // H08
    { const S = start('hc'); quiet(S); for (let i = 0; i < 20; i++)A.step(.1); A.startCrisis('desinfo'); A.startCrisis('alarm'); A.startCrisis('cyber'); const o0 = S.crises.filter(c => !c.closed).map(c => c.id); for (let i = 0; i < 3; i++)V.hcLose(S.hc.ships[i]); V.hcCheck(); const o1 = S.crises.filter(c => !c.closed); out.H08 = { maxA: S.sc.maxA, before: o0.length, after: o1.length, kept: o0.every(id => o1.some(c => c.id === id)), has: o1.some(c => c.type === 'hcloss') }; }
    // H10
    { const S = start('hc'); quiet(S); const H = S.hc; for (let i = 0; i < 20; i++)A.step(.1); H.ships.forEach(s => V.hcLose(s)); V.hcCheck(); for (let i = 0; i < 20; i++)A.step(.1); const c = S.crises.find(x => x.type === 'hcloss'); out.H10 = { thr: thr(S), crises: nL(S), state: H.state, lost: !!S.convoy.lost, afloat: V.hcAfloat().length, ships: H.ships.length, prot: c ? (A.crisisActions(c).find(x => x.id === 'prot') || {}).ok : null }; }
    // H11
    { const S = start('hc'); quiet(S); for (let i = 0; i < 300; i++)A.step(.1); const k0 = S.ships.length; A.startCrisis('sabotage', 'convoy'); const s = S.ships[S.ships.length - 1], c = S.crises[S.crises.length - 1]; out.H11 = { spawned: S.ships.length - k0, target: s && s.tgt === S.convoy, cls: s ? !!s.cls : null, txt: /Haren/.test((c.title || '') + (c.desc || '')), sea: s ? V.seaAt(s.x, s.y) : null, far: s ? Math.round(Math.min(...V.hcAfloat().map(q => dist(q, s)))) : null }; }
    // H12
    { const sig = () => { const r = playGame(113, 'hc', { esc: true }, mkBot({})), S = A.s; return JSON.stringify([r.s, r.ok, S.hc.events, S.hc.ships.map(s => s.st + Math.round(s.hp)), S.buoyN || 0, S.crises.map(c => c.type + c.out)]); }; const a = sig(), b2 = sig(); out.H12 = { same: a === b2, sig: a.slice(0, 90) }; }
    // dégâts physiques : un impact touche le navire le plus proche, pas un compteur de groupe
    { const S = start('hc'); quiet(S); const H = S.hc, tail = H.ships[5]; V.dmgA(S.convoy, 11, { x: tail.x, y: tail.y }); out.HIT = { tail: Math.round(tail.hp), others: H.ships.slice(0, 5).every(s => s.hp === 100) }; }
    // commandes : attente, reprise, déroutement
    { const S = start('hc'); quiet(S); const H = S.hc; for (let i = 0; i < 100; i++)A.step(.1); V.hcCmd('hold'); const q = { x: H.ships[0].x, y: H.ships[0].y }; for (let i = 0; i < 100; i++)A.step(.1); const held = dist(q, H.ships[0]) < .01 && H.state === 'holding'; V.hcCmd('resume'); for (let i = 0; i < 50; i++)A.step(.1); const moved = dist(q, H.ships[0]) > 1; const dv = V.hcCmd('divert'); let land = 0; for (let i = 0; i < 6600 && !H.done; i++) { A.step(.1); H.ships.forEach(s => { if (s.st === 'underway' && !V.seaAt(s.x, s.y)) land++; }); } out.CMD = { held, moved, dv, dest: H.dest, shel: H.ships.filter(s => s.st === 'sheltered').length, land, obj: S.objs.find(o => o.k === 'convoy').st }; }
    // B01
    { const r = {}; for (const g of [true, false]) { const S = start('asw', { guided: g }); const P = V.ASWP; r[g ? 'simple' : 'complet'] = P.pat + '/' + P.mode; const u = S.units.find(x => A.UT[x.type].buoys && x.x !== undefined) || S.units.find(x => A.UT[x.type].buoys); r['html' + (g ? 'S' : 'C')] = u ? /data-a="bgo"/.test(V.buoyHtml(u)) && /aria-pressed="true" data-a="bmode" data-v="a"/.test(V.buoyHtml(u)) : 'no unit'; }
      const S = start('ic', { guided: true }); const rc = S.units.find(x => x.type === 'recon'); A.startCrisis('sub'); const c = S.crises[S.crises.length - 1]; rc.x = c.zone.x; rc.y = c.zone.y; rc.path = []; rc.task = { kind: 'buoy', z: { x: c.zone.x, y: c.zone.y } }; const a0 = V.bStock(rc, 'a'); const k = V.buoyDrop(rc); r.dossier = { n: k, hw: S.buoys.filter(x => x.bid).map(x => x.hw).join(''), debit: a0 - V.bStock(rc, 'a') }; out.B01 = r; }
    // B02 à B07
    { const S = start('ic'); quiet(S); const u = S.units.find(x => x.type === 'recon'); const tot0 = u.buoys, a0 = V.bStock(u, 'a'), p0 = V.bStock(u, 'p'); let pt = null; for (let r = 30; r < 200 && !pt; r += 10)for (let a = 0; a < 6.3 && !pt; a += .5) { const x = u.x + Math.cos(a) * r, y = u.y + Math.sin(a) * r; if (V.seaAt(x, y) && V.seaAt(x + 40, y + 24) && V.seaAt(x - 40, y + 24) && V.seaAt(x, y - 46)) pt = { x, y }; }
      const fly = () => { for (let i = 0; i < 3000 && u.task && u.task.kind === 'buoy'; i++)A.step(.1); };
      const o1 = V.buoyOrder(u, pt.x, pt.y, { pat: 'one', mode: 'a', dep: 's' }); const mid = u.buoys; fly(); const n1 = S.buoys.filter(x => x.bid).length, s1 = u.buoys; const b1 = S.buoys.find(x => x.bid);
      const o2 = V.buoyOrder(u, pt.x, pt.y, { pat: 'tri', mode: 'p', dep: 'd' }); fly(); const ids = S.buoys.filter(x => x.bid).map(x => x.bid);
      out.B02 = { o1, o2, midFlight: mid === tot0, n1, debit1: tot0 - s1, n2: ids.length + (S.bSeq - ids.length), seq: S.bSeq, debitTot: tot0 - u.buoys, act: a0 - V.bStock(u, 'a'), pas: p0 - V.bStock(u, 'p'), uniq: new Set(ids).size === ids.length, by: b1 && b1.by === u.id };
      const sv = u.bA; u.bA = 0; const why = V.buoyWhy(u, { pat: 'one', mode: 'a' }), o3 = V.buoyOrder(u, pt.x, pt.y, { pat: 'one', mode: 'a' }), o3p = !V.buoyWhy(u, { pat: 'one', mode: 'p' }); const made0 = S.bSeq; out.B03 = { refused: o3 === false, why, passiveOk: o3p, noCreate: S.bSeq === made0 }; u.bA = sv;
      let lp = null; for (let x = 20; x < 1420 && !lp; x += 40)for (let y = 20; y < 880 && !lp; y += 40)if (!V.seaAt(x, y)) lp = { x, y }; const st0 = u.buoys, q0 = S.bSeq, o4 = V.buoyOrder(u, lp.x, lp.y, { pat: 'one', mode: 'a' }); const keep = u.buoys, ka = u.bA; u.buoys = 0; const o5 = V.buoyOrder(u, pt.x, pt.y, { pat: 'one', mode: 'a' }); u.buoys = keep; u.bA = ka; out.B04 = { land: o4 === false, empty: o5 === false, stock: u.buoys === st0, made: S.bSeq === q0 };
      u.x += 120; const o6 = V.buoyOrder(u, pt.x, pt.y, { pat: 'one', mode: 'a' }); for (let i = 0; i < 5; i++)A.step(.1); const c0 = u.buoys; u.task = null; u.path = []; for (let i = 0; i < 100; i++)A.step(.1); const c1 = u.buoys, q1 = S.bSeq; out.B05 = { o6, noDebitBefore: c0 === st0, afterCancel: c1 === st0, made: q1 === q0 };
      // B07 : dépôt fini, pas de recomplètement gratuit
      u.buoys = 10; u.bA = 5; S.depotB = 7; V.depotFill(u); const f1 = u.buoys, d1 = S.depotB; V.depotFill(u); out.B07 = { f1, d1, f2: u.buoys, d2: S.depotB }; }
    // B06 + S04 : capteur pas en service avant la mise à l'eau ; profondeurs réelles du capteur et de la cible
    { const mk = (dep, zt, cfg) => { const S = start('ic', Object.assign({ layer: 'std' }, cfg || {})); quiet(S); const u = S.units.find(x => x.type === 'recon'); S.units.forEach(x => { if (A.UT[x.type].naval) { x.x = 30; x.y = 30; x.path = []; } }); A.startCrisis('sub'); const c = S.crises[S.crises.length - 1], L = V.ENV().layer; let pt = null; for (let x = 300; x < 1200 && !pt; x += 20)for (let y = 200; y < 700 && !pt; y += 20)if (V.seaDepth(x, y) > 1500 && V.seaAt(x, y)) pt = { x, y }; c.truth = 'sousmarin'; c.hyp = c.hyp; c.sb.x = pt.x; c.sb.y = pt.y; c.sb.v = 0; c.sb.tgt = null; c.sb.path = []; c.sb.slow = false; c.sb.sdT = 1e9; c.sb.z = c.sb.zT = zt === 'below' ? L.base + 40 : Math.round(L.top * .5); c.deadline = 0; c.hold = 0; u.x = pt.x + 36; u.y = pt.y; u.path = []; u.task = { kind: 'buoy', z: { x: pt.x + 36, y: pt.y }, pat: 'one', mode: 'p', dep }; V.buoyDrop(u); u.x = 30; u.y = 60; return { S, c, L, bu: S.buoys.find(x => x.bid) }; };
      const a = mk('s', 'above'); for (let i = 0; i < 60; i++)A.step(.1); const early = a.c.hold, st = a.bu.st; for (let i = 0; i < 60; i++)A.step(.1); out.B06 = { state: st, holdBefore: early, holdAfter: Math.round(a.c.hold * 10) / 10, ready: a.bu.st };
      const run = (dep, zt) => { const q = mk(dep, zt); for (let i = 0; i < 200; i++)A.step(.1); return Math.round(q.c.hold * 10) / 10; };
      out.S04 = { sameAbove: run('s', 'above'), cross: run('s', 'below'), sameBelow: run('d', 'below'), fSame: V.layF(30, 30, a.c.sb), fCross: Math.round(V.layF(a.L.top - 5, a.L.base + 40, a.c.sb) * 100) / 100, fIn: Math.round(V.layF(a.L.top + 5, a.L.base + 40, a.c.sb) * 100) / 100 };
      // S05 : perte puis réacquisition, sans suivre la position vraie
      const q = mk('s', 'above'), S = q.S, c = q.c; for (let i = 0; i < 200; i++)A.step(.1); const loc1 = c.located; S.buoys.length = 0; c.sb.x += 0; const z0 = { x: c.zone.x, y: c.zone.y }; for (let i = 0; i < 300; i++) { c.sb.x += .25; A.step(.1); } const lostQ = { located: c.located, r: Math.round(c.zone.r), follows: Math.abs(c.zone.x - c.sb.x) < 5, age: c.lostAt > 0, seen: c.sb.seen }; const r1 = c.zone.r; for (let i = 0; i < 100; i++)A.step(.1); const grows = c.zone.r > r1;
      const u = S.units.find(x => x.type === 'recon'); u.x = c.sb.x + 20; u.y = c.sb.y; u.task = { kind: 'buoy', z: { x: c.sb.x + 20, y: c.sb.y }, pat: 'one', mode: 'p', dep: 's' }; V.buoyDrop(u); u.x = 30; u.y = 60; for (let i = 0; i < 250; i++)A.step(.1); out.S05 = { loc1, lost: lostQ, grows, back: c.located, lostN: S.trkLost, backN: S.trkBack, info: /class="sec trki"/.test(V.trkInfo(c)) }; }
    // S01 à S03, S06 : sous-marin allié
    { const S = start('asw', { layer: 'std', fleet: null }); quiet(S); let u = S.units.find(x => A.UT[x.type].sub); out.hasSsn = !!u;
      if (u) { const L = V.ENV().layer; let deep = null, sh = null; for (let x = 200; x < 1300; x += 15)for (let y = 150; y < 800; y += 15) { if (!V.seaAt(x, y)) continue; const d = V.seaDepth(x, y); if (!deep && d > 1500) deep = { x, y }; if (!sh && d > 40 && d < L.base + 40) sh = { x, y }; }
        u.x = deep.x; u.y = deep.y; u.path = []; V.uz(u); const z0 = u.z, okc = V.zCmd(u, 'below'); let mx = 0, pz = u.z, mono = true; const tr = []; for (let i = 0; i < 600; i++) { A.step(.1); mx = Math.max(mx, Math.abs(u.z - pz)); if (u.z < pz - 1e-9) mono = false; pz = u.z; if (i % 100 === 0) tr.push(Math.round(u.z)); } out.S01 = { okc, z0, target: u.zT, end: Math.round(u.z), maxStep: Math.round(mx * 100) / 100, mono, tr, side: V.laySide(u.z, u), html: /class="dcut"/.test(V.depHtml(u)) && /data-a="zcmd" data-v="above"/.test(V.depHtml(u)) };
        // S06 : surface et immergé superposés
        const sf = S.units.find(x => A.UT[x.type].naval && !A.UT[x.type].sub), sf2 = S.units.filter(x => A.UT[x.type].naval && !A.UT[x.type].sub)[1]; S.units.forEach(x => { if (x !== u && x !== sf && x.x !== undefined && dist(x, u) < 40) { x.x += 200; x.path = []; } }); sf.x = u.x; sf.y = u.y; sf.path = []; u.path = []; for (let i = 0; i < 30; i++)A.step(.1); const d1 = Math.round(dist(u, sf) * 10) / 10; if (sf2) { sf2.x = sf.x; sf2.y = sf.y; sf2.path = []; } for (let i = 0; i < 30; i++)A.step(.1); out.S06 = { subSurf: d1, surfSurf: sf2 ? Math.round(dist(sf, sf2) * 10) / 10 : null };
        // F03 : coïncidence exacte avec un contact visible
        const sh0 = S.ships.find(s => !s.gone); if (sh0) { sh0.visible = true; sh0.x = sf.x; sh0.y = sf.y; const hold = { x: sh0.x, y: sh0.y }; A.sepStep(.1); for (let i = 0; i < 9; i++) { sh0.x = hold.x; sh0.y = hold.y; sh0.visible = true; A.sepStep(.1); } out.F03 = Math.round(dist(sf, hold) * 10) / 10; }
        // S03 : fond insuffisant
        u.x = sh.x; u.y = sh.y; u.zT = u.z = 30; out.S03 = { depth: V.seaDepth(sh.x, sh.y), base: L.base, why: V.zWhy(u, 'below'), cmd: V.zCmd(u, 'below'), zT: u.zT }; u.zT = 250; for (let i = 0; i < 20; i++)A.step(.1); out.S03.bounded = u.zT <= V.seaDepth(u.x, u.y) - 30 + .01 || u.zT === 18; }
      const S2 = start('asw', { layer: 'none' }); const u2 = S2.units.find(x => A.UT[x.type].sub); out.S02 = { layer: V.ENV().layer, why: u2 ? V.zWhy(u2, 'below') : 'no ssn', cmd: u2 ? V.zCmd(u2, 'below') : null, html: u2 ? /data-a="zcmd" data-v="below" disabled/.test(V.depHtml(u2)) : null };
      const S3 = start('m6'); out.S02ml = V.ENV().layer; }
    // B08, B09
    out.B08 = { nm: V.ASW.NM, txt: /simulation/i.test(A.t ? A.t('buoy.rng.d') : 'simulation'), realField: Object.keys(V.ASW).filter(k => /real/i.test(k)) };
    out.B09 = { a: V.mi(44), b: V.mi(44), r: V.ASW.mode.a.r };
    // F05
    out.F05 = Object.keys(A.UT).filter(k => A.UT[k].naval && !A.UT[k].land && !V.inrOf(k));
    // G02 / F01 : régressions de l'audit
    { const g = (sc, seed) => { const r = playGame(seed, sc, { esc: true, guided: false }, null), S = A.s; return { ok: r.ok, s: r.s, ess: S.objs.filter(o => o.ess).map(o => o.key + '=' + o.st).join(' ') }; }; out.G02 = { m6: g('m6', 325), f2: g('f2', 272) }; }
    // jetons : toujours présents (décision de Naully), aucun coût nouveau sur les ordres au convoi
    { const S = start('hc'); quiet(S); for (let i = 0; i < 20; i++)A.step(.1); const t0 = S.tokens; V.hcCmd('hold'); V.hcCmd('resume'); V.hcCmd('wait'); out.TOK = { same: S.tokens === t0, tokens: t0 }; }
    out.missing = A.missing(); return out;
  });
  const j = x => JSON.stringify(x);
  ok('H01 route A → B sans ordre, en mer, sans saut', R.H01.arrived === 6 && R.H01.land === 0 && R.H01.jump === 0 && R.H01.distinct === 6 && R.H01.obj === 1, R.H01);
  ok('H02 seuil exact (4 navires, 2 pertes) : une seule crise', R.H02.before === 0 && R.H02.after === 1 && R.H02.thr === 1, R.H02);
  ok('H03 sous le seuil : 1 perte et des avaries, aucune crise', R.H02.before === 0);
  ok('H04 effectif impair : 3 pertes sur 5', R.H04.at2 === 0 && R.H04.at3 === 1, R.H04);
  ok('H05 pertes simultanées : un franchissement, une crise', R.H05.crises === 1 && R.H05.thr === 1 && R.H05.lost === 4, R.H05);
  ok('H06 dénominateur figé au manifeste initial', R.H06.n === 6 && R.H06.at2 === 0 && R.H06.at3 === 1 && R.H06.manifest === 6 && R.H06.arrivedKept === 2, R.H06);
  ok('H07 seuil persistant après deux rechargements', R.H07.saved === true && R.H07.m1 === 1 && R.H07.m2 === 1 && R.H07.thr === 1 && R.H07.lost === 3 && R.H07.n === 6, R.H07);
  ok('H08 crise prioritaire malgré le plafond, sans effacer les autres', R.H08.has && R.H08.kept && R.H08.after === R.H08.before + 1 && R.H08.before >= R.H08.maxA, R.H08);
  ok('H09 la partie continue après le seuil ; secours et déroutement jouables', !R.H09.over && /resc:1/.test(R.H09.acts) && /divert:1/.test(R.H09.acts) && R.H09.afloat === 2 && R.H09.objSt === 2, R.H09);
  ok('H10 destruction totale : un franchissement, état terminal, aucun faux survivant', R.H10.thr === 1 && R.H10.crises === 1 && R.H10.state === 'lost' && R.H10.lost && R.H10.afloat === 0 && R.H10.ships === 6 && R.H10.prot === false, R.H10);
  ok('H11 embarcation : statut incertain, pas d’attribution au seul spawn', R.H11.spawned === 1 && R.H11.target && R.H11.cls === false && !R.H11.txt && R.H11.sea && R.H11.far > 20, R.H11);
  ok('H12 même tirage, même déroulement', R.H12.same, R.H12.sig);
  ok('Impact physique sur le navire le plus proche', R.HIT.tail < 100 && R.HIT.others, R.HIT);
  ok('Attente, reprise et déroutement vers un port de repli, en mer', R.CMD.held && R.CMD.moved && R.CMD.dv && R.CMD.dest !== 'B' && R.CMD.shel === 6 && R.CMD.land === 0 && R.CMD.obj === 1, R.CMD);
  ok('B01 défaut « une bouée active » en Simple, en Complet et par le dossier', R.B01.simple === 'one/a' && R.B01.complet === 'one/a' && R.B01.htmlS === true && R.B01.htmlC === true && R.B01.dossier.n === 3 && R.B01.dossier.hw === 'aaa' && R.B01.dossier.debit === 3, R.B01);
  ok('B02 comptage individuel : 1 puis 3', R.B02.o1 && R.B02.o2 && R.B02.midFlight && R.B02.n1 === 1 && R.B02.debit1 === 1 && R.B02.seq === 4 && R.B02.debitTot === 4 && R.B02.act === 1 && R.B02.pas === 3 && R.B02.uniq && R.B02.by, R.B02);
  ok('B03 stock seulement passif : pose active refusée, alternative expliquée', R.B03.refused && R.B03.why.length > 10 && R.B03.passiveOk && R.B03.noCreate, R.B03);
  ok('B04 terre ou stock vide : rien de créé ni débité', R.B04.land && R.B04.empty && R.B04.stock && R.B04.made, R.B04);
  ok('B05 annulation avant largage : aucune consommation', R.B05.o6 && R.B05.noDebitBefore && R.B05.afterCancel && R.B05.made, R.B05);
  ok('B06 aucune détection avant la mise en service', R.B06.state === 'settling' && R.B06.holdBefore === 0 && R.B06.holdAfter > 0 && R.B06.ready === 'listening', R.B06);
  ok('B07 pas de recomplètement gratuit : dépôt fini', R.B07.f1 === 17 && R.B07.d1 === 0 && R.B07.f2 === 17 && R.B07.d2 === 0, R.B07);
  ok('B08 aucune portée réelle inventée', R.B08.nm === 1852 && R.B08.txt && R.B08.realField.length === 0, R.B08);
  ok('B09 conversion constante', R.B09.a === R.B09.b && Math.abs(R.B09.a - 44 * 1.7) < .51, R.B09);
  ok('S01 changement de profondeur progressif', R.hasSsn && R.S01.okc && R.S01.maxStep <= .31 && R.S01.mono && R.S01.end === R.S01.target && R.S01.side === 2 && R.S01.html, R.S01);
  ok('S02 couche absente : commande expliquée et désactivée', R.S02.layer === null && R.S02.why.length > 5 && R.S02.cmd === false && R.S02.html === true && R.S02ml === null, R.S02);
  ok('S03 fond insuffisant : ordre refusé, profondeur bornée', R.S03.why.length > 5 && R.S03.cmd === false && R.S03.bounded, R.S03);
  ok('S04 profondeurs réelles du capteur et de la cible', R.S04.fSame === 1 && R.S04.fCross < 1 && R.S04.fCross > 0 && R.S04.fIn > R.S04.fCross && R.S04.sameAbove > R.S04.cross && R.S04.sameBelow > R.S04.cross, R.S04);
  ok('S05 perte puis réacquisition sans fuite de position', R.S05.loc1 && !R.S05.lost.located && !R.S05.lost.follows && R.S05.lost.age && !R.S05.lost.seen && R.S05.grows && R.S05.back && R.S05.lostN >= 1 && R.S05.backN >= 1 && R.S05.info, R.S05);
  ok('S06 surface et sous-marin immergé : pas de répulsion ; deux navires de surface se séparent', R.S06.subSurf < .5 && (R.S06.surfSurf === null || R.S06.surfSurf > 3), R.S06);
  ok('F03 coïncidence exacte avec un contact : séparation', R.F03 === undefined || R.F03 > 1, R.F03);
  ok('F05 toutes les classes navales ont un profil d’inertie', R.F05.length === 0, R.F05);
  ok('G02 objectif essentiel manqué : pas de victoire (m6/325, f2/272)', R.G02.m6.ok === 0 && R.G02.f2.ok === 0, R.G02);
  ok('Ordres au convoi sans coût', R.TOK.same, R.TOK);
  ok('Aucun texte manquant (moteur)', R.missing.length === 0, R.missing.slice(0, 8));
  ok('Aucune erreur de page (moteur)', errs.length === 0, errs.slice(0, 3));
  // écrans réels
  for (const [w, h, lang] of [[1440, 900, 'fr'], [390, 844, 'en']]) {
    const o = await open(w, h, lang), q = o.p, tag = lang + ' ' + w;
    const cards = await q.evaluate(() => { __S.missions(); return [...document.querySelectorAll('.ms-card')].map(c => c.textContent).filter(x => /humanitaire|Humanitarian/.test(x)).length; });
    ok(tag + ' · la mission figure à l’écran des missions', cards === 1);
    await q.evaluate(() => { const A = __S; A.newGame(60, { sc: 'hc', deck: A.SC.hc.rec, guided: true, novar: true }); A.startJams(); const S = A.s; S.running = false; for (let i = 0; i < 150; i++)A.step(.1); S.sel = S.convoy; A.D ? A.D() : 0; document.getElementById('over').hidden = true; });
    await q.evaluate(() => { const S = __S.s; S.sel = S.convoy; if (__S.D) __S.D(); });
    await q.waitForTimeout(400);
    let d = await q.evaluate(() => ({ dos: !!document.querySelector('.hcdos'), btn: [...document.querySelectorAll('.hcdos [data-a="hccmd"]')].map(b => b.dataset.v + ':' + Math.round(b.getBoundingClientRect().height)), sw: document.documentElement.scrollWidth, iw: innerWidth, rows: document.querySelectorAll('.hcdos .row').length }));
    ok(tag + ' · dossier du convoi : état, manifeste, commandes', d.dos && d.btn.length === 4 && d.rows >= 20, d);
    if (d.dos) { await q.evaluate(() => { const b = document.querySelector('.hcdos [data-a="hccmd"][data-v="hold"]'); b.scrollIntoView({ block: 'center' }); }); await q.click('.hcdos [data-a="hccmd"][data-v="hold"]'); await q.waitForTimeout(200); const st = await q.evaluate(() => ({ hold: __S.s.hc.hold, sel: __S.s.sel === __S.s.convoy, paths: __S.s.units.filter(u => u.path && u.path.length).length })); ok(tag + ' · « Faire attendre » par un vrai clic, sans ordre de mouvement', st.hold === true && st.sel, st); }
    ok(tag + ' · boutons de 44 px au tactile', w > 980 || d.btn.every(x => +x.split(':')[1] >= 44), d.btn);
    ok(tag + ' · pas de défilement horizontal', d.sw <= d.iw + 1, [d.sw, d.iw]);
    const crisis = await q.evaluate(() => { const A = __S, S = A.s, V = A.v50; for (let i = 0; i < 3; i++)V.hcLose(S.hc.ships[i]); V.hcCheck(); const c = S.crises.find(x => x.type === 'hcloss'); S.sel = c; if (A.D) A.D(); return { has: !!c, t: c && c.title }; });
    await q.waitForTimeout(300);
    const cd = await q.evaluate(() => ({ txt: document.getElementById('rightC') ? document.getElementById('rightC').textContent.slice(0, 4000) : document.body.textContent.slice(0, 100), acts: [...document.querySelectorAll('#rightC [data-a="act"],#rightC [data-a^="act"]')].length }));
    ok(tag + ' · crise « Convoi humanitaire en péril » ouverte avec ses décisions', crisis.has && /péril|peril/.test(cd.txt) && /Haren/.test(cd.txt), { t: crisis.t, acts: cd.acts });
    const bu = await q.evaluate(() => { const A = __S, V = A.v50; A.newGame(60, { sc: 'ic', deck: A.SC.ic.rec, guided: true, novar: true }); A.startJams(); const S = A.s; S.running = false; A.step(.1); const u = S.units.find(x => x.type === 'recon'); document.getElementById('over').hidden = true; S.sel = u; if (A.D) A.D(); return u.id; });
    await q.waitForTimeout(300);
    const bh = await q.evaluate(() => { const e = document.querySelector('details.ubuoy'); if (!e) return null; e.open = true; return { go: (e.querySelector('[data-a="bgo"]') || {}).textContent, on: [...e.querySelectorAll('[aria-pressed="true"]')].map(x => x.dataset.a + '=' + x.dataset.v).join(' '), sw: document.documentElement.scrollWidth, iw: innerWidth }; });
    ok(tag + ' · fiche du porteur en niveau Simple : une bouée active par défaut', bh && /bmode=a/.test(bh.on) && /bpat=one/.test(bh.on) && /1/.test(bh.go) && bh.sw <= bh.iw + 1, bh);
    const miss = await q.evaluate(() => __S.missing());
    ok(tag + ' · aucun texte manquant', miss.length === 0, miss.slice(0, 6)); ok(tag + ' · aucune erreur', o.errs.length === 0, o.errs.slice(0, 3));
    await q.screenshot({ path: path.join(__dirname, `v50-${lang}-${w}.png`) }); await o.ctx.close();
  }
  console.log(`\n${n - fail}/${n} contrôles réussis`); await b.close(); process.exit(fail ? 1 : 0);
})();
