// Version 35 : vue d'ensemble et vue tactique, ordres par domaine, brouillage, cyberattaque sur un contact, crise « cyberattaque révélée ».
// Vrais clics, français à 1440 px puis anglais à 390 px. Usage : node uiv35.js [dossier captures]
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), errs = [], out = {}, D = process.argv[2] || '/tmp'; let bad = 0;
  const need = (ok, m) => { if (!ok) { bad++; console.log('ÉCHEC', m); } };
  const DECK = ['frigate', 'patrol', 'fighter', 'recon', 'team', 'guard', 'battery', 'sof'];
  const page = async (vw, mob, lang, simple) => {
    const p = await (await b.newContext({ viewport: vw, isMobile: !!mob, hasTouch: !!mob, locale: lang })).newPage(); await p.route(/fonts\.g/, r => r.abort()); p.on('pageerror', e => errs.push(e.message));
    await p.goto('file://' + __dirname + '/t.html'); await p.waitForTimeout(500);
    await p.evaluate(([l, deck, simple]) => { const A = __S; performance.now = () => 0; A.setLang(l); A.home(false); document.getElementById('over').hidden = true; A.newGame(11, { sc: 'd3', deck, contested: false, guided: simple, timer: 'easy' }); const S = A.s; S.running = false; S.sched = {}; S.pendingK = []; S.sc = { ...S.sc, dyn: 0 }; A.applyCamX(); }, [lang, DECK, !!simple]); await p.waitForTimeout(400); return p;
  };
  const forces = async (p, mob) => { if (mob) await p.click('#mnav [data-v=forces]'); await p.click('[data-a=ltab][data-v=forces]'); await p.waitForTimeout(120); };
  const map = async (p, mob) => { if (mob) { await p.click('#mnav [data-v=map]'); await p.waitForTimeout(120); } };
  const st = (p, f) => p.evaluate(f);
  for (const [lang, vw, mob] of [['fr', { width: 1440, height: 900 }, 0], ['en', { width: 390, height: 844 }, 1]]) {
    const o = out[lang + ' ' + vw.width] = {}, tag = lang + vw.width;
    let p = await page(vw, mob, lang);
    // 1. vue d'ensemble : caméra au plus large, résumé par domaine, retour à la caméra d'avant
    await map(p, mob);
    const cam0 = await st(p, () => { const c = __S.cam; return [c.x, c.y, c.z].map(v => Math.round(v * 100) / 100); });
    await p.evaluate(() => { __S.cam.z *= 2; __S.fitCam(); }); const cam1 = await st(p, () => Math.round(__S.cam.z * 100) / 100);
    await p.click('#vMac'); await p.waitForTimeout(200);
    o.macro = await st(p, () => [__S.VIEW, Math.round(__S.cam.z * 100) / 100, Math.round(__S.minZ() * 100) / 100, !document.getElementById('macro').hidden, document.querySelectorAll('#macro [data-a=domtab]').length]);
    need(o.macro[0] === 'macro' && o.macro[1] === o.macro[2] && o.macro[3] && o.macro[4] === 3, tag + ' vue d’ensemble : ' + o.macro);
    await p.screenshot({ path: D + '/v35-macro-' + tag + '.png' });
    await p.click('#macro [data-a=domtab][data-v=sea]'); await p.waitForTimeout(200);
    o.domtab = await st(p, () => [__S.FTAB, document.querySelectorAll('#left .domo [data-a=domo]').length]); need(o.domtab[0] === 'sea' && o.domtab[1] === 3, tag + ' le résumé ouvre le domaine Mer : ' + o.domtab);
    await map(p, mob); await p.click('#vMac'); await p.waitForTimeout(150);
    o.retour = await st(p, () => [__S.VIEW, Math.round(__S.cam.z * 100) / 100]); need(o.retour[0] === 'std' && o.retour[1] === cam1, tag + ' retour à la caméra précédente : ' + o.retour + ' / ' + cam1);
    // 2. vue tactique : sans sélection elle s'explique, avec une unité elle se centre et suit
    await st(p, () => { __S.s.sel = null; __S.redraw(); }); await p.click('#vTac'); await p.waitForTimeout(150);
    o.tacVide = await st(p, () => __S.VIEW); need(o.tacVide === 'std', tag + ' vue tactique refusée sans sélection');
    await st(p, () => { const S = __S.s; S.sel = S.units.find(u => u.id === 'DDG-1'); __S.redraw(); }); await map(p, mob); await p.click('#vTac'); await p.waitForTimeout(250);
    o.tac = await st(p, () => { const S = __S.s, u = S.sel, c = __S.cam, q = __S.toScr(u.x, u.y), r = document.getElementById('c').getBoundingClientRect(); return [__S.VIEW, c.z > __S.minZ() * 1.5, q[0] > 0 && q[0] < r.width && q[1] > 0 && q[1] < r.height]; });
    need(o.tac[0] === 'tac' && o.tac[1] && o.tac[2], tag + ' vue tactique centrée : ' + o.tac);
    await p.waitForTimeout(200); await p.screenshot({ path: D + '/v35-tac-' + tag + '.png' });
    if (!mob) { await p.keyboard.press('v'); o.kV = await st(p, () => __S.VIEW); await p.keyboard.press('v'); await p.keyboard.press('t'); o.kT = await st(p, () => __S.VIEW); await p.keyboard.press('t'); need(o.kV === 'macro' && o.kT === 'tac', tag + ' touches V et T : ' + o.kV + ' ' + o.kT); }
    else await p.click('#vTac');
    // 3. ordres par domaine
    await forces(p, mob); await p.click('[data-a=ftab][data-v=sea]'); await p.waitForTimeout(120);
    await p.click('#left .domo [data-a=domo][data-v=sites]'); await p.waitForTimeout(200);
    o.sites = await st(p, () => { const S = __S.s; return [S.units.filter(u => __S.UT[u.type].naval && u.path.length).length, S.domN, S.domO.sea]; }); need(o.sites[0] >= 1 && o.sites[1] === 1 && o.sites[2] === 'sites', tag + ' Mer, protéger les sites : ' + o.sites);
    await forces(p, mob); await p.click('[data-a=ftab][data-v=sea]'); await p.click('#left .domo [data-a=domo][data-v=hold]'); await p.waitForTimeout(150);
    o.hold = await st(p, () => __S.s.units.filter(u => __S.UT[u.type].naval && u.path.length).length); need(o.hold === 0, tag + ' Mer, tenir la position : ' + o.hold);
    await st(p, () => { const A = __S; A.s.tokens = 4; window.__k = A.startCrisis('alarm'); A.s.running = false; A.s.sel = null; A.redraw(); }); await p.waitForTimeout(200);
    await forces(p, mob); await p.click('[data-a=ftab][data-v=air]'); await p.click('#left .domo [data-a=domo][data-v=crisis]'); await p.waitForTimeout(200);
    o.air = await st(p, () => { const S = __S.s, z = window.__k.zone; return S.units.filter(u => __S.UT[u.type].dom === 'air' && u.path.length && Math.hypot(u.path[u.path.length - 1].x - z.x, u.path[u.path.length - 1].y - z.y) < 5).length; }); need(o.air >= 1, tag + ' Air, rallier les crises : ' + o.air);
    if (!mob) await p.screenshot({ path: D + '/v35-domaine.png' });
    await st(p, () => { for (let i = 0; i < 80; i++) __S.step(.1); __S.s.running = false; }); await forces(p, mob); await p.click('[data-a=ftab][data-v=air]'); await p.click('#left .domo [data-a=domo][data-v=rtb]'); await p.waitForTimeout(150);
    o.rtb = await st(p, () => __S.s.units.filter(u => __S.UT[u.type].dom === 'air' && u.rtb).length); need(o.rtb >= 1, tag + ' Air, rappeler : ' + o.rtb);
    await p.close();
    // 4. brouillage et cyberattaque depuis le dossier d'un contact
    p = await page(vw, mob, lang);
    await st(p, () => { const A = __S, S = A.s, u = S.units.find(x => x.id === 'DDG-1'), q = A.nearSea(u.x + 90, u.y + 10), z = A.addShip({ kindI: 1, x: q[0] * 4 + 2, y: q[1] * 4 + 2, path: [], v: 4, life: 9999 }, 'rouge', false); z.visible = true; z.seen = true; z.cr = { start: S.t }; z.stopped = true; S.tokens = 6; S.posture = 3; S.sel = z; window.__z = z; A.redraw(); }); await p.waitForTimeout(300);
    if (mob) { await p.click('#mnav [data-v=dos]'); await p.waitForTimeout(150); }
    o.acts = await p.$$eval('#right [data-a=act]', L => L.map(x => x.dataset.v).join(',')); need(/jam/.test(o.acts) && /blind/.test(o.acts) && /cslow/.test(o.acts), tag + ' actions du contact : ' + o.acts);
    o.note = await p.locator('#right').innerText(); need(/repérée|spotted/.test(o.note), tag + ' note sur le risque de repérage'); delete o.note;
    await p.click('#right [data-a=act][data-v=jam]'); await p.waitForTimeout(200);
    o.jam = await st(p, () => { const S = __S.s, u = S.units.find(x => x.id === 'DDG-1'); return [window.__z.jam > S.t, u.jamT > S.t, u.active !== false, S.jamN, S.tokens]; }); need(o.jam[0] && o.jam[1] && o.jam[2] && o.jam[3] === 1 && o.jam[4] === 5, tag + ' brouillage : ' + o.jam);
    o.ew = /brouillé|jammed/.test(await p.locator('#right').innerText()); need(o.ew, tag + ' état « brouillé » dans le dossier');
    if (!mob) { await st(p, () => { __S.s.sel = __S.s.units.find(x => x.id === 'DDG-1'); __S.redraw(); __S.setView('tac'); }); await p.waitForTimeout(300); await p.screenshot({ path: D + '/v35-brouillage.png' }); await st(p, () => { __S.setView('tac'); __S.s.sel = window.__z; __S.redraw(); }); await p.waitForTimeout(200); }
    await p.click('#right [data-a=act][data-v=cslow]'); await p.waitForTimeout(200);
    o.cyb = await st(p, () => { const S = __S.s, z = window.__z; return [S.cybN, S.teamUses < S.teamUsesMax, z.slowT > S.t ? 'ralenti' : 'sans effet', S.cybDet || 0, S.cybQ || 0]; }); need(o.cyb[0] === 1 && o.cyb[1], tag + ' cyberattaque lancée : ' + o.cyb);
    // 5. crise « cyberattaque révélée » : ouverture, coût immédiat, réponses, bilan
    o.rev = await st(p, () => { const A = __S, S = A.s, cs = S.cs; S.tokens = 4; const c = A.startCrisis('expose'); S.running = false; S.sel = c; window.__c = c; A.redraw(); return [c.title, cs - S.cs, c.hyp.join(',')]; }); need(o.rev[1] === 4 && o.rev[2] === 'etaye,accus,tiers', tag + ' crise ouverte, opinion touchée : ' + o.rev);
    await p.waitForTimeout(300); if (mob) { await p.click('#mnav [data-v=dos]'); await p.waitForTimeout(150); }
    o.rep = await p.$$eval('#right [data-a=act]', L => L.map(x => x.dataset.v).join(',')); need(/own/.test(o.rep) && /deny/.test(o.rep) && /nocom/.test(o.rep) && /osint/.test(o.rep), tag + ' réponses : ' + o.rep);
    await p.screenshot({ path: D + '/v35-revelee-' + tag + '.png' });
    await p.click('#right [data-a=act][data-v=own]'); await p.waitForTimeout(150); await st(p, () => { for (let i = 0; i < 60; i++) __S.step(.1); __S.s.running = false; });
    o.clos = await st(p, () => [window.__c.closed, window.__c.key, window.__c.out]); need(o.clos[0] && o.clos[1] === 'own', tag + ' crise close : ' + o.clos);
    o.large = await st(p, () => [document.documentElement.scrollWidth, innerWidth]); need(o.large[0] <= o.large[1], tag + ' pas de défilement horizontal : ' + o.large);
    await st(p, () => { __S.endGame && __S.endGame(); }); 
    o.manq = await st(p, () => __S.missing()); need(!o.manq.length, tag + ' textes manquants : ' + o.manq);
    await p.close();
    // 6. niveau Simple : pas de brouillage ni de ralentissement, vues et ordres par domaine présents
    p = await page(vw, mob, lang, true);
    await st(p, () => { const A = __S, S = A.s, u = S.units.find(x => x.id === 'DDG-1'), q = A.nearSea(u.x + 90, u.y + 10), z = A.addShip({ kindI: 1, x: q[0] * 4 + 2, y: q[1] * 4 + 2, path: [], v: 4, life: 9999 }, 'rouge', false); z.visible = true; z.seen = true; z.cr = { start: S.t }; z.stopped = true; S.tokens = 6; S.sel = z; A.redraw(); }); await p.waitForTimeout(300);
    if (mob) { await p.click('#mnav [data-v=dos]'); await p.waitForTimeout(150); }
    o.simple = await p.$$eval('#right [data-a=act]', L => L.map(x => x.dataset.v).join(',')); need(!/jam|cslow/.test(o.simple), tag + ' niveau Simple sans brouillage : ' + o.simple);
    o.simpleV = await p.locator('#vMac, #vTac').count(); need(o.simpleV === 2, tag + ' vues au niveau Simple');
    o.manq2 = await st(p, () => __S.missing()); need(!o.manq2.length, tag + ' textes manquants (Simple) : ' + o.manq2);
    await p.close();
  }
  console.log(JSON.stringify(out, null, 1)); console.log('errs', errs.slice(0, 4), bad ? 'ÉCHECS ' + bad : 'OK'); await b.close(); process.exit(bad || errs.length ? 1 : 0);
})();
