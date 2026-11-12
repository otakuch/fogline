// Version 34 : onglets de domaine, unités terrestres, emplois de la force spéciale, hélicoptère embarqué, étapes de classification, formations, temps élargi.
// Vrais clics, français à 1440 px puis anglais à 390 px. Usage : node uiv34.js [dossier captures]
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), errs = [], out = {}, D = process.argv[2] || '/tmp'; let bad = 0;
  const need = (ok, m) => { if (!ok) { bad++; console.log('ÉCHEC', m); } };
  const page = async (vw, mob, lang, sc, deck) => {
    const p = await (await b.newContext({ viewport: vw, isMobile: !!mob, hasTouch: !!mob, locale: lang })).newPage(); await p.route(/fonts\.g/, r => r.abort()); p.on('pageerror', e => errs.push(e.message));
    await p.goto('file://' + __dirname + '/t.html'); await p.waitForTimeout(500);
    await p.evaluate(([l, sc, deck]) => { const A = __S; A.setLang(l); A.home(false); document.getElementById('over').hidden = true; A.newGame(11, { sc, deck: deck || A.SC[sc].rec, contested: false, guided: false, timer: 'easy' }); const S = A.s; S.running = false; S.sched = {}; S.pendingK = []; S.sc = { ...S.sc, dyn: 0 }; A.applyCamX(); }, [lang, sc, deck]); await p.waitForTimeout(400); return p;
  };
  const forces = async (p, mob) => { if (mob) await p.click('#mnav [data-v=forces]'); await p.click('[data-a=ltab][data-v=forces]'); await p.waitForTimeout(120); };
  const sel = async (p, id, mob) => { await forces(p, mob); await p.click('[data-a=ftab][data-v=all]'); await p.click(`[data-a=selU][data-v="${id}"]`); await p.waitForTimeout(150); };
  const open = (p, cls) => p.evaluate(c => { const d = document.querySelector('#right details.' + c); if (d && !d.open) d.querySelector('summary').click(); return !!d; }, cls);
  const run = (p, sec) => p.evaluate(n => { for (let i = 0; i < n * 10; i++) __S.step(.1); }, sec);
  for (const [lang, vw, mob] of [['fr', { width: 1440, height: 900 }, 0], ['en', { width: 390, height: 844 }, 1]]) {
    const o = out[lang + ' ' + vw.width] = {}, tag = lang + vw.width;
    // 1. onglets de domaine et unités terrestres
    let p = await page(vw, mob, lang, 'd3');
    await forces(p, mob);
    o.onglets = await p.locator('#left .ftabs [data-a=ftab]').count(); need(o.onglets === 5, tag + ' cinq onglets de domaine');
    const ids = async () => p.$$eval('#left [data-a=selU]', L => L.map(x => x.dataset.v).join(','));
    await p.click('[data-a=ftab][data-v=land]'); await p.waitForTimeout(100); o.terre = await ids(); need(/NSW-1/.test(o.terre) && /FAST-1/.test(o.terre) && /MLR-1/.test(o.terre) && !/DDG/.test(o.terre), tag + ' onglet Terre : ' + o.terre);
    await p.click('[data-a=ftab][data-v=sea]'); await p.waitForTimeout(100); o.mer = await ids(); need(/DDG-1/.test(o.mer) && !/NSW|P8/.test(o.mer), tag + ' onglet Mer : ' + o.mer);
    await p.click('[data-a=ftab][data-v=air]'); await p.waitForTimeout(100); o.air = await ids(); need(/P8-1/.test(o.air) && !/DDG|NSW/.test(o.air), tag + ' onglet Air : ' + o.air);
    await p.click('[data-a=ftab][data-v=cyber]'); await p.waitForTimeout(100); o.cyber = await p.locator('#left .tabc .sec').first().locator('.row').count(); need(o.cyber >= 2 && (await ids()) === '', tag + ' onglet Cyber : ' + o.cyber);
    if (!mob) await p.screenshot({ path: D + '/v34-forces.png' });
    // 2. force spéciale : sous-menu des emplois, pas d'ordres incohérents
    await sel(p, 'NSW-1', mob); need(await open(p, 'uemp'), tag + ' sous-menu Emplois'); await open(p, 'uadv');
    o.sofIncoh = await p.locator('#right [data-a=emcon], #right [data-a=thr], #right [data-a=escort]').count(); need(o.sofIncoh === 0, tag + ' force spéciale sans silence radar, allure ni escorte');
    o.sofVide = await p.locator('#right .uemp [data-a=uact]').count(); need(o.sofVide === 0, tag + ' aucun emploi sans crise');
    await p.evaluate(() => { const A = __S, S = A.s; S.tokens = 4; S.posture = 3; const c = A.startCrisis('seize'); S.running = false; S.sel = S.units.find(u => u.id === 'NSW-1'); window.__c = c; }); await p.waitForTimeout(500);
    await sel(p, 'NSW-1', mob); await open(p, 'uemp'); await p.waitForTimeout(150);
    o.sofEmplois = await p.locator('#right .uemp [data-a=uact]').count(); need(o.sofEmplois >= 1, tag + ' emploi proposé pendant une prise');
    if (!mob) await p.screenshot({ path: D + '/v34-sof.png' });
    await p.click('#right .uemp [data-a=uact]'); await p.waitForTimeout(150);
    o.sofParti = await p.evaluate(() => { const u = __S.s.units.find(u => u.id === 'NSW-1'); return [!!u.da, u.uses, u.usesMax]; }); need(o.sofParti[0] && o.sofParti[1] === o.sofParti[2] - 1, tag + ' action directe lancée depuis la fiche : ' + o.sofParti);
    // 3. peloton de protection : redéploiement de site en site
    o.fast = await p.evaluate(() => { const A = __S, S = A.s, u = S.units.find(u => u.id === 'FAST-1'), st = A.thSites().filter(s => Math.hypot(s.x - u.x, s.y - u.y) > 10)[0]; if (!st) return 'un seul site'; A.orderMove(u, st.x + 9, st.y - 7); const p = u.path[0]; return p && Math.abs(p.x - st.x) < .01 && Math.abs(p.y - st.y) < .01 ? 'ok' : JSON.stringify(u.path); }); need(o.fast === 'ok' || o.fast === 'un seul site', tag + ' redéploiement vers un site : ' + o.fast);
    await p.close();
    // 4. hélicoptère embarqué et étapes de classification
    p = await page(vw, mob, lang, 'ia', ['frigate', 'patrol']);
    await sel(p, 'DDG-1', mob); need(await open(p, 'uemb'), tag + ' sous-menu Moyens embarqués'); await p.waitForTimeout(100);
    await p.click('#right [data-a=helo]'); await p.waitForTimeout(200);
    o.helo = await p.evaluate(() => { const S = __S.s, h = S.units.find(u => u.type === 'helo'); return h ? [h.id, h.par, S.sel === h] : null; }); need(o.helo && o.helo[0] === 'MH60-1' && o.helo[1] === 'DDG-1' && o.helo[2], tag + ' hélicoptère lancé et sélectionné : ' + o.helo);
    if (!mob) await p.screenshot({ path: D + '/v34-helo.png' });
    o.etapes = await p.evaluate(() => { const A = __S, S = A.s, f = S.units.find(u => u.id === 'DDG-1'), h = S.units.find(u => u.type === 'helo'); const c = A.startCrisis('ghost'), s = c.ship; S.running = false; const q = A.nearSea(f.x + 120, f.y); s.x = q[0] * 4 + 2; s.y = q[1] * 4 + 2; s.v = 0; s.path = [{ x: s.x + 60, y: s.y }]; s.seen = false; const st = [A.stgOf(s)]; S.tokens = 4; A.orderTrack(h, s); for (let i = 0; i < 80; i++) { A.step(.1); if (i === 12) st.push(A.stgOf(s)); } st.push(A.stgOf(s)); window.__s = s; return { st, vis: s.ev.some(e => e.kind === 'visual'), idd: !!s.idd }; });
    need(o.etapes.st[0] === 1 && o.etapes.st[2] === 3 && o.etapes.vis, tag + ' détecté puis identifié à vue par l’hélicoptère : ' + JSON.stringify(o.etapes));
    await p.evaluate(() => { __S.s.sel = window.__s; }); await p.waitForTimeout(500);
    o.etapeAff = await p.locator('#right .stg3').count(); need(o.etapeAff === 1, tag + ' étape affichée dans le dossier');
    if (!mob) await p.screenshot({ path: D + '/v34-etape.png' });
    await sel(p, 'MH60-1', mob); await p.click('#right [data-a=helorec]'); await run(p, 40); await p.waitForTimeout(200);
    o.retour = await p.evaluate(() => { const S = __S.s, f = S.units.find(u => u.id === 'DDG-1'); return [S.units.some(u => u.type === 'helo'), !!f.heloUp, f.heloAt > S.t - 1, !!f.heloLost]; }); need(!o.retour[0] && !o.retour[1] && !o.retour[3], tag + ' hélicoptère récupéré : ' + o.retour);
    // 5. formation du groupe
    await p.evaluate(() => { const A = __S, S = A.s, f = S.units[0], u = S.units[1], q = A.nearSea(f.x + 20, f.y + 8); u.x = q[0] * 4 + 2; u.y = q[1] * 4 + 2; S.sel = f; }); await sel(p, 'DDG-1', mob); await open(p, 'uadv'); await p.click('#right [data-a=grpform]'); await p.waitForTimeout(150);
    o.formes = await p.locator('#right [data-a=grpf]').count(); need(o.formes === 4, tag + ' quatre formations');
    await p.click('#right [data-a=grpf][data-v=screen]'); await p.waitForTimeout(120);
    o.ecran = await p.evaluate(() => { const A = __S, S = A.s, L = S.units[0], m = S.units[1]; L.hd = 0; const [x, y] = A.grpPost(L, m); return [L.form, Math.round(x), Math.round(y), A.postOf(L, m)]; }); need(o.ecran[0] === 'screen' && o.ecran[1] === 24 && o.ecran[3] === 'screen', tag + ' écran avant : ' + o.ecran);
    if (!mob) await p.screenshot({ path: D + '/v34-formation.png' });
    // 6. temps élargi, puis retour à x1 quand une crise à échéance s'ouvre
    if (mob) await p.click('#mnav [data-v=map]');
    await p.click('#sp8'); o.x8 = await p.evaluate(() => __S.s.speed); need(o.x8 === 8, tag + ' x8');
    if (!mob) { await p.click('#sp16'); o.x16 = await p.evaluate(() => __S.s.speed); need(o.x16 === 16, tag + ' x16'); }
    o.x1 = await p.evaluate(() => { const A = __S; A.startCrisis('desinfo'); return A.s.speed; }); need(o.x1 === 1, tag + ' retour à x1 sur crise');
    // 7. ordre de bataille par domaine
    await p.evaluate(() => { __S.s.running = false; __S.brief('d3', false); }); await p.waitForTimeout(250); await p.click('[data-a=todeck]'); await p.waitForTimeout(250);
    o.ob = await p.locator('#over .ftabs [data-a=obt]').count(); await p.click('#over [data-a=obt][data-v=land]'); await p.waitForTimeout(150);
    o.obTerre = await p.$$eval('#over .ob-row [data-a=obsel]', L => L.map(x => x.dataset.v).join(',')); need(o.ob === 5 && o.obTerre === 'sof,guard,battery', tag + ' ordre de bataille, onglet Terre : ' + o.obTerre);
    await p.screenshot({ path: D + '/v34-ob-' + tag + '.png' });
    o.large = await p.evaluate(() => [document.documentElement.scrollWidth, innerWidth]); need(o.large[0] <= o.large[1], tag + ' pas de défilement horizontal : ' + o.large);
    o.manq = await p.evaluate(() => __S.missing()); need(!o.manq.length, tag + ' textes manquants : ' + o.manq);
    await p.close();
  }
  console.log(JSON.stringify(out, null, 1)); console.log('errs', errs.slice(0, 4), bad ? 'ÉCHECS ' + bad : 'OK'); await b.close(); process.exit(bad || errs.length ? 1 : 0);
})();
