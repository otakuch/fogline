// Version 56 : système sonore complet. Contrôles sur le vrai jeu, servi en HTTP (les fichiers audio ne se chargent pas depuis le disque).
// Chaque décision de présentation est relevée dans un journal de test (window.__audLog) : ce test lit ce journal, il n'écoute rien.
// Cas du pack (assets/audio/cas-verification-audio.json) : AUDIO-01 à 17 et COMBINED-01 à 04. AUDIO-18 (écoute humaine) n'est pas exécutable ici.
// Usage : node uiaud.js
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const ROOT = path.join(__dirname, '..'), MIME = { '.html': 'text/html; charset=utf-8', '.mp3': 'audio/mpeg', '.webp': 'image/webp', '.json': 'application/json', '.png': 'image/png', '.js': 'text/javascript' };
(async () => {
  const srv = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); r.end(); return } r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r) });
  await new Promise(ok => srv.listen(0, '127.0.0.1', ok)); const URL0 = 'http://127.0.0.1:' + srv.address().port + '/proto/t.html';
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] }); let fails = 0, n = 0; const need = (c, m) => { n++; if (!c) { fails++; console.log('ÉCHEC ' + m) } };
  // COMBINED-04 : le pack fusionné, depuis son dossier final
  let chk = ''; try { chk = execFileSync('python3', [path.join(ROOT, 'tools/audio/optimise.py'), '--check']).toString() } catch (e) { chk = String(e.stdout || e) } need(/170 · défauts : 0/.test(chk), 'COMBINED-04 170 fichiers d’origine présents, empreintes du catalogue : ' + chk.trim());
  const lib = JSON.parse(fs.readFileSync(path.join(__dirname, 'audio-lib.json'))), web = p => fs.existsSync(path.join(ROOT, 'assets/audio/web', p));
  need(Object.keys(lib.env).every(k => web('env/' + k + '.mp3')) && lib.sfx.every(k => web('sfx/' + k + '.mp3')) && lib.vo.every(k => web('vo/en/' + k + '.mp3')) && Object.keys(lib.env).length + lib.sfx.length + lib.vo.length === 170, 'COMBINED-04 170 dérivés servis par le jeu, sans collision');
  need(Object.keys(lib.profiles).length === 12 && Object.keys(lib.ph).length === 100 && Object.keys(lib.radio).length === 18, 'COMBINED-04 12 profils, 100 répliques, 18 scripts de mission');
  for (const [lang, w, h] of [['fr', 1440, 900], ['en', 390, 844]]) {
    const tag = lang + w, ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: w < 500, isMobile: w < 500 }), p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.addInitScript(l => { try { localStorage.setItem('seuil.lang', l); localStorage.removeItem('seuil.aud'); localStorage.removeItem('seuil.snd') } catch (_) { } window.__audLog = 1 }, lang);
    await p.route(/fonts\.g/, r => r.abort()); await p.goto(URL0); await p.waitForTimeout(600);
    const st = (f, a) => p.evaluate(f, a), log = k => st(k => __S.audLog().filter(e => !k || e.k === k), k), clr = () => st(() => { __S.audLog().length = 0 }), wait = ms => p.waitForTimeout(ms);
    // AUDIO-01 : rien avant une interaction
    const a0 = await st(() => __S.audState()); need(a0.ctx === 'none' && !a0.on, tag + ' AUDIO-01 aucun contexte audio avant une action du joueur ' + JSON.stringify(a0.ctx));
    await p.click('[data-a=play]'); await wait(300);
    await st(() => { __S.brief('asw', false) }); await wait(200); await p.click('[data-a=begin]'); await wait(300); const ack = await p.$('[data-a=ack]'); if (ack) await ack.click();
    let a1 = null; for (let i = 0; i < 80; i++) { a1 = await st(() => __S.audState()); if (a1.load >= 3) break; await wait(250) }
    need(a1.on && a1.load === 3 && a1.buf >= 66 && a1.amb.length === 4 && a1.ctx === 'running', tag + ' AUDIO-01 son activé après le clic, signaux, signatures et quatre fonds chargés ' + JSON.stringify({ on: a1.on, load: a1.load, buf: a1.buf, amb: a1.amb.length, ctx: a1.ctx }));
    await st(() => { const S = __S.s; S.running = false; if (window.innerWidth < 980 && __S.setMV) __S.setMV('map'); __S.redraw() }); await wait(700); await clr();
    // sélection explicite : signature du profil après stabilisation, clic générique supprimé ; pas de réponse au survol
    const pos = await st(() => { const A = __S, S = A.s, u = S.units.find(u => u.type === 'frigate'); A.cam.x = u.x; A.cam.y = u.y; A.cam.z = A.minZ() * 2.2; A.redraw(); return u.id }); await wait(400);
    const pt = async id => st(id => { const A = __S, u = A.s.units.find(u => u.id === id), q = A.toScr(u.x + (u._dx || 0) / A.cam.z, u.y + (u._dy || 0) / A.cam.z), r = document.getElementById('c').getBoundingClientRect(); return [r.left + q[0], r.top + q[1]] }, id);
    const c0 = await pt(pos); await p.mouse.move(c0[0], c0[1]); await wait(400); need((await log()).filter(e => e.k === 'say' || e.k === 'play').length === 0, tag + ' AUDIO-03 survol d’une unité : aucun son');
    await st(id => { const A = __S; A.s.sel = null; A.redraw() }, pos); if (w < 500) await p.touchscreen.tap(c0[0], c0[1]); else await p.mouse.click(c0[0], c0[1]); await wait(600);
    let L = await log(); const sel = await st(() => __S.s.sel && __S.s.sel.id);
    need(sel === pos && L.filter(e => e.k === 'say' && /^surface_selection/.test(e.sfx)).length === 1 && !L.some(e => e.k === 'play' && e.id === 'ui_select'), tag + ' sélection au clic : une signature du profil, clic générique supprimé ' + JSON.stringify(L.map(e => e.k + ':' + (e.sfx || e.id))));
    const say = L.find(e => e.k === 'say'); need(say && (lang === 'fr' ? say.spoke === '' && /écoute|ligne/.test(say.txt) : say.spoke === 'file:en' || say.spoke === ''), tag + ' COMBINED-03 par défaut : ' + (lang === 'fr' ? 'pas de voix anglaise pour du français, sous-titre français' : 'voix anglaise en anglais') + ' ' + JSON.stringify(say && [say.spoke, say.txt]));
    need(await st(() => !document.getElementById('subt').hidden && document.getElementById('subt').textContent.length > 4), tag + ' sous-titre affiché');
    // même unité dans les 5 s : pas de répétition, le clic générique revient
    await st(() => { __S.s.sel = null; if (window.innerWidth < 980 && __S.setMV) __S.setMV('map'); window.scrollTo(0, 0); __S.redraw() }); await wait(400); await clr(); const c1 = await pt(pos); if (w < 500) await p.touchscreen.tap(c1[0], c1[1]); else await p.mouse.click(c1[0], c1[1]); await wait(500); L = await log();
    need(!L.some(e => e.k === 'say') && L.some(e => e.k === 'play' && e.id === 'ui_select'), tag + ' même unité avant 5 s : pas de seconde réplique, clic d’interface ' + JSON.stringify(L.map(e => e.k + ':' + (e.sfx || e.id))));
    // clics rapides au clavier (touche N) : une seule réponse, pour la dernière sélection stabilisée
    await wait(800); await clr(); await p.keyboard.press('n'); await wait(40); await p.keyboard.press('n'); await wait(40); await p.keyboard.press('n'); await wait(700); L = await log();
    need(L.filter(e => e.k === 'say').length <= 1, tag + ' trois sélections rapides : une réponse au plus ' + L.filter(e => e.k === 'say').length);
    // une unité adverse ou inconnue ne répond pas
    await wait(5200); await clr(); await st(() => { const A = __S, S = A.s, s = S.ships.find(s => s.visible) || S.ships[0]; S.sel = s; A.audSel(); A.redraw() }); await wait(500); L = await log(); need(!L.some(e => e.k === 'say'), tag + ' contact sélectionné : aucune réponse');
    // COMBINED-01 : ordre reçu, une signature et une phase ; le tir reste un événement distinct
    await clr(); await st(id => { const A = __S, S = A.s, u = S.units.find(u => u.id === id); S.sel = u; A.orderMove(u, u.x + 30, u.y); A.audSfx('order') }, pos); await wait(900); L = await log();
    need(L.filter(e => e.k === 'say' && /^surface_accepted/.test(e.sfx)).length === 1 && !L.some(e => e.k === 'play' && e.id === 'ui_order_ack'), tag + ' COMBINED-01 ordre reçu : un accusé du profil, pas d’accusé d’interface en double ' + JSON.stringify(L.map(e => e.k + ':' + (e.sfx || e.id) + (e.why ? '(' + e.why + ')' : ''))));
    await clr(); await st(id => { const A = __S, S = A.s, u = S.units.find(u => u.id === id), s = S.ships.find(s => s.visible) || S.ships[0]; A.fxEv('fire', { u, tg: s, m: { x: u.x, y: u.y, tg: s } }) }, pos); await wait(300); L = await log();
    need(L.filter(e => e.k === 'play' && e.id === 'missile_launch').length === 1, tag + ' COMBINED-01 le départ réel garde son propre signal');
    // ordre retardé puis reçu ; ordre refusé
    await wait(5200); await clr(); const dl = await st(id => { const A = __S, S = A.s, u = S.units.find(u => u.id === id); S.m.orderDelay = 1; S.svc.c2.down = 3; S.svc.c2.rep = false; const q0 = S.queue.length; A.orderMove(u, u.x - 20, u.y + 10); const q = S.queue.length > q0; return q }, pos); await wait(700); L = await log();
    need(dl && L.some(e => e.k === 'say' && e.ph === 'status.queued') && !L.some(e => e.k === 'say' && /accepted/.test(e.sfx)), tag + ' ordre retardé : « en attente de transmission », pas d’accusé de l’unité ' + JSON.stringify(L.filter(e => e.k === 'say').map(e => e.ph)));
    await wait(4600); await st(() => { const A = __S; for (let i = 0; i < 130; i++)A.step(.1) }); await wait(3800); L = await log(); need(L.filter(e => e.k === 'say' && /^surface_accepted/.test(e.sfx)).length === 1, tag + ' ordre retardé : un seul accusé à la réception ' + JSON.stringify(L.filter(e => e.k === 'say').map(e => e.ph)));
    await st(() => { const S = __S.s; S.running = false; S.m.orderDelay = 0; S.svc.c2.down = 0 }); await wait(5200); await clr();
    await st(() => { __S.doAct({ id: 'x', ok: false, why: 'Motif de test', run() { } }) }); await wait(300); L = await log(); need(L.some(e => e.k === 'play' && e.id === 'ui_unavailable') && L.some(e => e.k === 'sub' && e.id === 'Motif de test') && !L.some(e => e.k === 'say'), tag + ' ordre refusé : signal distinct et motif visible');
    // groupe : une réponse par ordre logique
    await clr(); const gr = await st(() => { const A = __S, S = A.s; S.sel = null; const c = A.startCrisis('alarm'); return [A.domOrder('sea', 'rally') || A.domOrder('sea', 'hold'), S.units.filter(u => A.UT[u.type].naval).length] }); await wait(900); L = await log();
    need(L.filter(e => e.k === 'say' && /accepted|command_pending/.test(e.sfx)).length <= 1, tag + ' ordre de domaine (' + JSON.stringify(gr) + ') : une réponse au plus ' + JSON.stringify(L.filter(e => e.k === 'say').map(e => e.sfx)));
    // AUDIO-06 : une crise, un signal ; ni rendu ni chargement ne le rejouent
    await wait(3500); await clr(); await st(() => { const A = __S; A.startCrisis('alarm'); for (let i = 0; i < 30; i++)A.redraw() }); await wait(600); L = await log();
    need(L.filter(e => e.k === 'play' && e.id === 'crisis_attention').length === 1, tag + ' AUDIO-06 nouvelle crise : un seul signal ' + L.filter(e => e.k === 'play').map(e => e.id));
    need(L.some(e => e.k === 'q' && /radio:new_crisis/.test(e.id)), tag + ' AUDIO-06 compte rendu « nouvelle crise » en file');
    await wait(3300); await clr(); const sv = await st(() => { const A = __S; if (!A.saveGame || !A.loadGame) return 'absent'; const ok = A.saveGame(true); const r = ok && A.loadGame(); return ok ? (r === false ? 'refus' : 'ok') : 'non' }); await wait(1200); L = await log();
    need(sv !== 'ok' || !L.some(e => e.k === 'play' && /crisis|missile|torpedo|sonar/.test(e.id)), tag + ' AUDIO-06 et 10 sauvegarde chargée (' + sv + ') : rien n’est rejoué ' + JSON.stringify(L.filter(e => e.k === 'play').map(e => e.id)));
    need((await st(() => __S.audState().amb.length)) === 4, tag + ' AUDIO-10 fonds toujours au nombre de quatre après le chargement');
    // AUDIO-03, 04, 02 : émission réelle, écho neutre, même sortie quelle que soit la vérité
    await st(() => { __S.s.running = false }); await clr();
    const sn = { out: [] }; for (const tr of ['sousmarin', 'bio']) { await wait(2600); sn.out.push(await st(tr => { const A = __S, S = A.s, c = S.crises.find(c => c.type === 'sub' && !c.closed) || A.startCrisis('sub'), u = S.units.find(u => A.UT[u.type].sub) || S.units.find(u => u.type === 'frigate'); __S.audLog().length = 0; A.AUD.cool = {}; A.AUD.q.length = 0; A.AUD.cur = null; c.truth = tr; A.fxEv('ping', { u, r: 60, echo: true }); A.fxEv('echo', { c }); return __S.audLog().map(e => e.k + ':' + e.id + ':' + (e.why || '')) }, tr)) }
    need(sn.out[0].join('|') === sn.out[1].join('|') && sn.out[0].some(x => /play:sonar_emit/.test(x)) && sn.out[0].some(x => /play:sonar_contact/.test(x)), tag + ' AUDIO-02 et 04 même sortie pour un sous-marin et un banc de poissons, écho au motif neutre ' + JSON.stringify(sn.out[0]));
    await wait(1200); await clr(); await st(() => { const A = __S; A.AUD.cool = {}; const T = { pid: 'T-777', tx: 0, ty: 0, dur: 5 }, u = A.s.units.find(u => u.type === 'frigate'); A.s.torps = A.s.torps || []; A.fxEv('torp', { u, T, c: {} }); A.fxEv('torp', { u, T, c: {} }) }); await wait(200); L = await log();
    need(L.filter(e => e.k === 'play' && e.id === 'torpedo_release').length === 1, tag + ' AUDIO-03 même identifiant de torpille émis deux fois : un seul signal de largage');
    // AUDIO-05 : phrase hostile en file, puis classement neutre : retirée avant lecture
    await wait(2500); await clr(); await st(() => { const A = __S, f = { id: 'Z1', cls: { h: 'rouge' } }; A.AUD.q.length = 0; A.AUD.cur = { id: 'occupe', pri: 0 }; A.AUD.busy = performance.now() / 1000 + .6; A.fxEv('cls', { f, h: 'rouge' }); f.cls.h = 'civil' }); await wait(1300); L = await log();
    need(L.some(e => e.k === 'drop' && /classified_hostile/.test(e.id) && e.why === 'plus valable') && !L.some(e => e.k === 'say' && /classified_hostile/.test(e.id)), tag + ' AUDIO-05 phrase « hostile » périmée retirée avant lecture ' + JSON.stringify(L.map(e => e.k + ':' + e.id)));
    // AUDIO-13 et COMBINED-02 : plusieurs messages, une voix à la fois, alerte d'abord, sélection retirée
    await wait(600); await clr(); await st(id => { const A = __S, S = A.s, u = S.units.find(u => u.id === id); A.AUD.q.length = 0; A.AUD.cur = null; A.AUD.cool = {}; A.AUD.mem.last.clear(); A.AUD.mem.selAt = -1e9; const now = performance.now() / 1000; A.AUD.cur = { id: 'occupe', pri: 0 }; A.AUD.busy = now + .5; S.sel = u; A.audSel(); A.AUD.selPend.at = now; A.audTick(.016); A.fxEv('trkLost', { c: { id: 'K9', trkSt: 'lost' } }); A.fxEv('svc', { k: 'sat' }); A.fxEv('crisis', { c: { id: 'HC', type: 'hcloss' } }); A.fxEv('hit', { u }) }, pos); await wait(6500); L = await log();
    const says = L.filter(e => e.k === 'say'), order = says.map(e => e.id);
    need(says.length >= 2 && /humanitarian_crisis/.test(order[0]) && !order.some(x => /^selection/.test(x)), tag + ' COMBINED-02 la crise critique passe d’abord, la sélection en attente est retirée ' + JSON.stringify(order));
    need(says.every((e, i) => i === 0 || e.t - says[i - 1].t >= .85) && L.some(e => e.k === 'drop'), tag + ' AUDIO-13 une voix à la fois, deux messages en attente au plus, les autres retirés ' + JSON.stringify(L.filter(e => e.k === 'drop').map(e => e.id + ':' + e.why)));
    need(L.filter(e => e.k === 'play' && e.id === 'crisis_critical').length === 1, tag + ' crise humanitaire : alerte critique, une fois');
    // AUDIO-07 : en pause, la présentation d'une crise est permise, aucun nouvel événement physique
    await clr(); await st(() => { const A = __S, S = A.s; S.running = false; A.AUD.cool = {}; const u = S.units.find(u => A.UT[u.type].sub); if (u) u.pingAuto = true }); await wait(2500); L = await log(); need(!L.some(e => e.k === 'play' && e.id === 'sonar_emit'), tag + ' AUDIO-07 en pause : aucun ping programmé');
    // AUDIO-08 : en accéléré, la densité reste bornée
    await clr(); await st(() => { const A = __S, S = A.s; A.AUD.cool = {}; for (let i = 0; i < 40; i++)A.fxEv('bping', { b: { x: A.cam.x, y: A.cam.y, r: 40 } }) }); await wait(200); L = await log(); need(L.filter(e => e.k === 'play' && e.id === 'sonar_emit').length === 1, tag + ' AUDIO-08 quarante impulsions de bouée dans la même image : un seul son');
    // AUDIO-15 : « Écouter un exemple » ne crée rien dans le jeu
    await clr(); const ex = await st(() => { const A = __S, S = A.s, snap = () => JSON.stringify([S.t, S.units.map(u => [u.x, u.y, u.buoys, u.torp, u.pingT]), S.buoys.length, S.mis.length, (S.torps || []).length, S.crises.length, S.log.length, A.score().s, S.tension]); const a = snap(); A.audExample(); return [a, snap()] }); await wait(2600); L = await log();
    need(ex[0] === ex[1] && L.filter(e => e.k === 'play' && e.ex).length >= 1, tag + ' AUDIO-15 exemple joué, aucun ping, projectile, stock ni score modifié');
    // AUDIO-14 : silence, mono, voix coupées : l'information reste à l'écran
    await wait(3000); await clr(); await p.click('[data-a=menu]'); await wait(200); const mn = await st(() => { const d = document.querySelector('details.audm'); if (d) d.open = true; return { rows: document.querySelectorAll('.audset input[type=range]').length, btn: [...document.querySelectorAll('[data-a=audset]')].length, test: !!document.querySelector('[data-a=audtest]'), sw: document.documentElement.scrollWidth, iw: window.innerWidth } });
    need(mn.rows === 8 && mn.btn >= 16 && mn.test && mn.sw <= mn.iw + 1, tag + ' menu : huit niveaux, réglages de voix, sous-titres, mono, confort, onglet masqué, exemple ; pas de défilement horizontal ' + JSON.stringify(mn));
    await p.click('[data-a=audset][data-v="mono:1"]'); await p.click('[data-a=audset][data-v="comfort:1"]'); await p.click('[data-a=audset][data-v="voice:off"]'); await st(() => { const r = document.querySelector('.audset input[data-aud=sonar]'); r.value = 40; r.dispatchEvent(new Event('input', { bubbles: true })) }); await wait(200);
    const s2 = await st(() => { const a = __S.audState(); let saved = null; try { saved = JSON.parse(localStorage.getItem('seuil.aud')) } catch (_) { } return { set: a.set, saved } }); need(s2.set.mono === 1 && s2.set.comfort === 1 && s2.set.voice === 'off' && Math.abs(s2.set.sonar - .4) < .01 && s2.saved && s2.saved.mono === 1, tag + ' réglages appliqués et mémorisés ' + JSON.stringify(s2.set));
    await p.click('[data-a=mset][data-v="snd:2"]'); await wait(200); await p.click('[data-a=mclose]'); await wait(300); await clr();
    await st(() => { const A = __S; A.AUD.cool = {}; A.fxEv('svc', { k: 'pnt' }) }); await wait(700); L = await log(); const subv = await st(() => !document.getElementById('subt').hidden && document.getElementById('subt').textContent);
    need(!L.some(e => e.k === 'play') && subv && subv.length > 5, tag + ' AUDIO-14 silence : aucun son, le sous-titre reste affiché : ' + subv);
    await p.click('[data-a=menu]'); await wait(150); await p.click('[data-a=mset][data-v="snd:0"]'); await p.click('[data-a=audset][data-v="voice:en"]'); await p.click('[data-a=audset][data-v="sub:fr"]'); await p.click('[data-a=audset][data-v="mono:0"]'); await p.click('[data-a=audset][data-v="comfort:0"]'); await p.click('[data-a=mclose]'); await wait(5200); await clr();
    // COMBINED-03 : voix anglaises choisies, sous-titres français
    await st(id => { const A = __S, S = A.s, u = S.units.find(u => u.id === id); A.AUD.q.length = 0; A.AUD.cur = null; A.AUD.mem.last.clear(); A.AUD.mem.selAt = -1e9; S.sel = u; A.audSel() }, pos); await wait(1500); await clr(); await wait(4000);
    await st(id => { const A = __S, S = A.s, u = S.units.find(u => u.id === id); A.AUD.mem.last.clear(); A.AUD.mem.selAt = -1e9; S.sel = u; A.audSel() }, pos); await wait(900); L = await log(); const sy = L.find(e => e.k === 'say');
    need(sy && sy.spoke === 'file:en' && /écoute|ligne/.test(sy.txt), tag + ' COMBINED-03 voix anglaises choisies explicitement, sous-titre français de la même réplique ' + JSON.stringify(sy && [sy.spoke, sy.ph, sy.txt]));
    // AUDIO-09 : onglet masqué puis retour : la vieille file n'est pas lue
    await clr(); await st(() => { const A = __S; A.AUD.q.length = 0; A.AUD.cur = { id: 'occupe', pri: 0 }; A.AUD.busy = performance.now() / 1000 + 60; A.fxEv('svc', { k: 'sat2' }); A.AUD.q.forEach(x => x.exp = performance.now() / 1000 + .5); Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); A.audHidden(true) }); await wait(1300);
    const hid = await st(() => { const A = __S, c = A.audState().ctx; Object.defineProperty(document, 'hidden', { configurable: true, get: () => false }); A.audHidden(false); A.AUD.cur = null; A.AUD.busy = 0; return c }); await wait(900); L = await log();
    need(hid === 'suspended' && !L.some(e => e.k === 'say' && /comms_degraded/.test(e.id)) && (await st(() => __S.audState().ctx)) === 'running', tag + ' AUDIO-09 onglet masqué : son suspendu ; au retour, reprise sans lecture de l’ancienne file (' + hid + ')');
    // AUDIO-17 : changements de mission, fonds non doublés, compteurs bornés
    for (const id of ['c1', 'hc', 'asw']) { await st(id => { const A = __S; A.newGame(7, { sc: id, deck: A.SC[id].rec, guided: true }); A.s.running = true; A.s.speed = 4 }, id); await wait(900) }
    const a17 = await st(() => { const a = __S.audState(); return { amb: a.amb.length, q: a.q.length, n: a.n } }); need(a17.amb === 4 && a17.q <= 2 && Object.values(a17.n).every(v => v <= 4), tag + ' AUDIO-17 trois changements de mission : quatre fonds, file et sources bornées ' + JSON.stringify(a17));
    const mm = await st(() => { const g = __S.audState().gains; return g }); need(Object.keys(mm).length === 4, tag + ' fonds pilotés par l’état connu ' + JSON.stringify(mm));
    need((await st(() => __S.missing())).length === 0, tag + ' aucun texte manquant ' + JSON.stringify(await st(() => __S.missing())));
    need(errs.length === 0, tag + ' aucune erreur de page ' + JSON.stringify(errs.slice(0, 3)));
    await ctx.close();
  }
  // AUDIO-11 : même tirage avec le son complet et en silence
  { const p = await b.newPage(); await p.goto(URL0); await p.addScriptTag({ path: __dirname + '/bots.js' }); await p.click('[data-a=play]'); await p.waitForTimeout(1500);
    const r = await p.evaluate(() => { const out = []; for (const m of [0, 2]) { if (m) { document.querySelector('[data-a=mute]').click(); document.querySelector('[data-a=mute]').click() } const g = playGame(33, 'l12', { guided: false }, mkBot({})); out.push([g.s, g.ok, g.lost, g.n, g.shots, g.ul, g.infra]) } return out });
    need(JSON.stringify(r[0]) === JSON.stringify(r[1]), 'AUDIO-11 même tirage, son complet puis silence : mêmes crises, tirs, pertes et score ' + JSON.stringify(r)); await p.close() }
  // AUDIO-16 : un fichier ne charge pas : repli propre, jeu fonctionnel
  { const p = await b.newPage(), errs = []; p.on('pageerror', e => errs.push(e.message)); await p.addInitScript(() => { window.__audLog = 1 }); await p.route(/ui_select\.mp3|crisis_attention\.mp3|amb_open_sea\.mp3/, r => r.abort()); await p.goto(URL0); await p.click('[data-a=play]'); await p.waitForTimeout(300); await p.evaluate(() => { __S.brief('c1', true) }); await p.click('[data-a=begin]'); await p.waitForTimeout(300); const ack = await p.$('[data-a=ack]'); if (ack) await ack.click();
    let a = null; for (let i = 0; i < 80; i++) { a = await p.evaluate(() => __S.audState()); if (a.load >= 3) break; await p.waitForTimeout(250) }
    const r = await p.evaluate(() => { const A = __S; A.audLog().length = 0; const h1 = A.audSfx('click'), h2 = A.audSfx('alarm'); A.startCrisis('alarm'); let i = 0; while (i++ < 300) A.step(.1); return { h1, h2, amb: A.audState().amb.length, t: A.s.t, log: A.audLog().filter(e => e.k === 'nobuf' || e.k === 'miss').map(e => e.id) } });
    need(a.load === 3 && r.h1 === false && r.h2 === false && r.amb === 3 && r.t > 20 && errs.length === 0, 'AUDIO-16 trois fichiers absents : sons synthétisés de repli, trois fonds sur quatre, partie jouable ' + JSON.stringify(r)); await p.close() }
  console.log(fails ? `ÉCHEC : ${fails} sur ${n}` : `uiaud : ${n} contrôles, tous réussis`); console.log('AUDIO-18 (écoute humaine au casque, sur haut-parleurs et sur téléphone) : non exécuté, à faire par une personne.');
  await b.close(); srv.close(); process.exit(fails ? 1 : 0);
})();
