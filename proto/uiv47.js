// Version 47 : registre naval, allocation par mission, moyens embarqués, équipes, rappel collectif, sauvegarde.
// Usage : node uiv47.js [dossier captures]
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), D = process.argv[2] || '/tmp'; let bad = 0, n = 0;
  const need = (ok, m) => { n++; if (!ok) { bad++; console.log('ÉCHEC', m); } };
  for (const [lang, vw, mob] of [['fr', { width: 1440, height: 900 }, 0], ['en', { width: 390, height: 844 }, 1]]) {
    const tag = lang + vw.width, errs = [];
    const ctx = await b.newContext({ viewport: vw, isMobile: !!mob, hasTouch: !!mob }), p = await ctx.newPage();
    await p.route(/fonts\.g/, r => r.abort()); p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/^Failed to load resource/.test(m.text())) errs.push(m.text()); });
    await p.addInitScript(() => { window.__noAutoSave = 1; try { localStorage.setItem('seuil.kb', '0'); localStorage.removeItem('seuil.save'); localStorage.removeItem('seuil.groups') } catch (_) {} });
    await p.goto('file://' + __dirname + '/t.html'); await p.waitForTimeout(700);
    const st = (f, a) => p.evaluate(f, a), tick = (ms = 250) => p.waitForTimeout(ms);
    const noX = async m => need(await st(() => document.scrollingElement.scrollWidth <= innerWidth + 1), `${tag} ${m} : défilement horizontal`);
    const small = async (sel, m) => { const L = await st(s => [...document.querySelectorAll(s)].filter(e => e.offsetParent && !e.closest('details:not([open])')).map(e => { const r = e.getBoundingClientRect(); return [r.width, r.height, e.textContent.trim().slice(0, 30)] }).filter(([w, h]) => w < 44 || h < 44), sel); need(!L.length, `${tag} ${m} : cibles de moins de 44 px ${JSON.stringify(L.slice(0, 3))}`) };
    const brief = async id => { await st(([l, id]) => { __S.setLang(l); __S.brief(id, false) }, [lang, id]); await tick(); };
    const start = async id => { await brief(id); await p.locator('[data-a="begin"]').first().click(); await tick(350); await st(() => { const o = document.querySelector('#over'); o.hidden = true; o.innerHTML = '' }); };
    const startF = async (id, ships) => { await brief(id); await st(([id, ships]) => { const F = __S.nvFleet(id); F.ships = ships; F.src = 'manual' }, [id, ships]); await p.locator('[data-a="begin"]').first().click(); await tick(350); await st(() => { const o = document.querySelector('#over'); o.hidden = true; o.innerHTML = '' }); };
    const run = s => st(s => { for (let i = 0; i < s * 10; i++) step(.1) }, s);
    const sheet = id => st(id => { const S = __S.s; S.sel = S.units.find(u => u.id === id); renderRight(); return !!S.sel }, id);
    const click = (a, v) => st(([a, v]) => { const e = document.querySelector(`[data-a="${a}"]${v !== undefined ? `[data-v="${v}"]` : ''}`); if (!e) return 'absent'; if (e.disabled) return 'désactivé'; e.click(); return 'ok' }, [a, v]);

    // 1. catalogue : 26 fiches, filtres, recherche, export, explication visible pour une classe non allouée
    await st(() => { __S.setLang && __S.setLang(document.documentElement.lang || 'fr') });
    await st(l => { __S.setLang(l); newDemo(); setHome(true); newDemo(); screenHome() }, lang); await tick(400);
    need(await st(() => !!document.querySelector('[data-a="navcat"]')), `${tag} accueil : bouton du catalogue naval`);
    await p.locator('[data-a="navcat"]').first().click(); await tick(300);
    need(await st(() => document.querySelectorAll('.nvli').length) === 26, `${tag} catalogue : 26 fiches`);
    await st(() => { const s = document.querySelector('[data-nvin="cm"]'); s.value = 'c1'; s.dispatchEvent(new Event('change', { bubbles: true })) }); await tick();
    const c1 = await st(() => { const L = [...document.querySelectorAll('.nvli')].map(e => [e.querySelector('b').textContent, e.querySelector('.nvst').className.replace('nvst nvst-', ''), e.querySelector('.nvst').textContent]); return L });
    need(c1.find(x => x[0] === 'Gerald R. Ford')[1] === 'not_allocated' && /alloué|allocated/i.test(c1.find(x => x[0] === 'Gerald R. Ford')[2]), `${tag} catalogue c1 : porte-avions non alloué avec un texte`);
    need(c1.find(x => x[0] === 'Constellation')[1] === 'reference', `${tag} catalogue : Constellation référence non déployable`);
    await click('nvcsel', 'gerald_ford'); await tick();
    need(await st(() => { const d = document.querySelector('.nvdet'); return !!d && /périmètre|scope/i.test(d.textContent) && d.querySelectorAll('.nvsrc a').length >= 1 && /fictive|fictional/i.test(d.textContent) }), `${tag} fiche Ford : raison, sources et valeurs fictives`);
    await st(() => { const s = document.querySelector('[data-nvin="cfam"]'); s.value = 'sub'; s.dispatchEvent(new Event('change', { bubbles: true })) }); await tick();
    need(await st(() => document.querySelectorAll('.nvli').length) === 4, `${tag} catalogue : filtre famille sous-marins`);
    await st(() => { const s = document.querySelector('[data-nvin="cfam"]'); s.value = 'all'; s.dispatchEvent(new Event('change', { bubbles: true })); const a = document.querySelector('[data-nvin="cav"]'); a.value = 'adapted'; a.dispatchEvent(new Event('change', { bubbles: true })) }); await tick();
    const ad = await st(() => [...document.querySelectorAll('.nvli b')].map(e => e.textContent));
    need(ad.length >= 1 && ad.every(x => ['LCS Freedom', 'LCS Independence', 'Henry J. Kaiser', 'John Lewis', 'Spearhead'].includes(x)), `${tag} catalogue : filtre disponibilité ${ad}`);
    await st(() => { const q = document.querySelector('[data-nvin="cq"]'); q.value = 'zeus'; q.dispatchEvent(new Event('input', { bubbles: true })); const a = document.querySelector('[data-nvin="cav"]'); a.value = 'all'; a.dispatchEvent(new Event('change', { bubbles: true })) }); await tick();
    need(await st(() => [...document.querySelectorAll('.nvli b')].map(e => e.textContent).join()) === 'Zeus', `${tag} catalogue : recherche`);
    const ex = await st(() => { const o = JSON.parse(__S.nvExport()); const ok = o.classes.length === 26 && o.taskGroups.length === 9 && o.effectiveProfile.id === 'c1' && o.evaluation.classes.every(c => c.state === __S.NV.evaluateUnitAvailability(c.id, 'c1').state) && JSON.stringify(o.classes) === JSON.stringify(__S.NAVAL_CAT.classes); return ok });
    need(ex, `${tag} export JSON cohérent avec le registre du jeu`);
    await p.click('[data-a=nvexport]'); await tick();
    const box = await st(() => { const e = document.getElementById('nvexptxt'), b = document.querySelector('[data-a=nvexpcopy]'); let ok = false; try { ok = JSON.parse(e.value).classes.length === 26 } catch (_) {} return { ok, h: b ? b.getBoundingClientRect().height : 0, w: document.scrollingElement.scrollWidth - innerWidth } });
    need(box.ok && box.h >= 44 && box.w <= 1, `${tag} export affiché dans un cadre à copier (téléchargement bloqué dans un artifact) : ` + JSON.stringify(box));
    await p.click('[data-a=nvexpclose]'); await tick();
    need(await st(() => !document.getElementById('nvexptxt')), `${tag} cadre d'export refermé`);
    await st(() => { const q = document.querySelector('[data-nvin="cq"]'); q.value = ''; q.dispatchEvent(new Event('input', { bubbles: true })) }); await tick();
    await noX('catalogue'); await small('.catw .btn, .catw .nvli, .catw select, .catw input', 'catalogue');
    if (!mob) { await p.keyboard.press('Tab'); await p.keyboard.press('Tab'); }
    await p.screenshot({ path: D + `/v47-catalogue-${tag}.png` });
    await click('nvctab', 'grp'); await tick();
    need(await st(() => document.querySelectorAll('.nvcard').length) === 9, `${tag} catalogue : 9 modèles de groupes`);
    await p.screenshot({ path: D + `/v47-groupes-${tag}.png` });

    // 2. préparation : groupe adapté accepté, groupe incompatible refusé, même groupe ailleurs, CSG
    await brief('f2'); await click('toprep'); await tick(300);
    need(await st(() => /Profil|profile/i.test(document.querySelector('.prepw').textContent) && /indispensables|Required/i.test(document.querySelector('.nvprof').textContent)), `${tag} préparation : profil lisible avant le lancement`);
    await click('nvgrp', 'infra'); await tick();
    need(await st(() => !document.querySelector('[data-a="nvok"]').disabled), `${tag} f2 : groupe infrastructures accepté`);
    need(await st(() => { const b = document.querySelector('[data-a="nvgrp"][data-v="csg"]'); return b.disabled && /alloué|allocated|périmètre|scope/i.test(b.textContent) }), `${tag} f2 : CSG refusé avec raison`);
    await noX('préparation'); await small('.prepw .btn, .prepw .go, .prepw select, .prepw input', 'préparation');
    await p.screenshot({ path: D + `/v47-prep-${tag}.png`, fullPage: false });
    await brief('l12'); await click('toprep'); await tick();
    need(await click('nvgrp', 'sag') === 'ok', `${tag} SAG disponible en l12`);
    await brief('c1'); await click('toprep'); await tick();
    need(await st(() => document.querySelector('[data-a="nvgrp"][data-v="sag"]').disabled), `${tag} SAG bloqué en c1`);
    await brief('asw'); await click('toprep'); await tick();
    need(await st(() => { const b = document.querySelector('[data-a="nvgrp"][data-v="csg"]'); return b.disabled && /aéronavale|carrier-aviation/i.test(b.textContent) }), `${tag} asw (étendu) : CSG refusé faute d’allocation aéronavale`);
    await brief('a4'); await click('toprep'); await tick();
    need(await st(() => { const b = document.querySelector('[data-a="nvgrp"][data-v="csg"]'); return !b.disabled && /surdimensionné|oversized/i.test(b.closest('.nvcard').textContent) }), `${tag} a4 : CSG autorisé, signalé surdimensionné`);
    await click('nvgrp', 'csg'); await tick(); await click('nvok'); await tick();
    need(await st(() => /0,3|0\.3/.test(document.querySelector('.nvbrief').textContent)), `${tag} a4 : conséquence d’escalade affichée avant l’engagement`);
    await p.locator('[data-a="begin"]').first().click(); await tick(350); await st(() => { const o = document.querySelector('#over'); o.hidden = true; o.innerHTML = '' });
    const cs = await st(() => ({ ids: __S.s.units.map(u => u.id).join(','), ten: __S.s.tension, f: __S.s.units.some(u => u.type === 'fighter') }));
    need(/CVN-1/.test(cs.ids) && /DDG-1/.test(cs.ids) && /DDG-2/.test(cs.ids) && cs.f && Math.abs(cs.ten - .3) < 1e-6, `${tag} a4 : CSG instancié, allocation aéronavale explicite, tension ${cs.ten}`);

    // 3. budget, effectifs et capacité manquante : refus au lancement, alternative proposée
    await brief('c1'); await click('toprep'); await tick(); await click('nvptab', 'cls'); await tick();
    need(await st(() => { const b = document.querySelector('[data-a="nvadd"][data-v^="arleigh_burke"]'); return b.disabled && /3 disponibles|3 available/.test(b.textContent) }), `${tag} c1 : destroyer hors du budget restant, bouton désactivé avec raison`);
    await st(() => { __S.FLEET.c1.ships.push({ cls: 'arleigh_burke', cfg: 'std' }); __S.screenPrep() }); await tick();
    need(await st(() => document.querySelector('[data-a="nvok"]').disabled && /budget/i.test(document.querySelector('.prepw [role=alert]').textContent)), `${tag} c1 : budget dépassé refusé`);
    await st(() => { __S.FLEET.c1.ships = [{ cls: 'arleigh_burke', cfg: 'std' }, { cls: 'arleigh_burke', cfg: 'std' }] });
    await click('tobrief'); await tick(); await p.locator('[data-a="begin"]').first().click(); await tick(300);
    need(await st(() => !!document.querySelector('.prepw') && /refusé|refused/i.test(document.querySelector('.prepw').textContent)), `${tag} c1 : lancement revalidé et refusé`);
    await click('nvalt'); await tick();
    need(await st(() => !document.querySelector('[data-a="nvok"]').disabled), `${tag} c1 : alternative valide sélectionnable`);
    await brief('m6'); await click('toprep'); await tick();
    await st(() => { __S.FLEET.m6.ships = [{ cls: 'zeus', cfg: 'std' }]; __S.FLEET.m6.src = 'manual'; __S.screenPrep() }); await tick();
    need(await st(() => /mines|Mine/i.test(document.querySelector('.prepw [role=alert]').textContent) && document.querySelector('.nvcov.no')), `${tag} m6 : capacité indispensable manquante détectée`);
    await st(() => { __S.FLEET.m6.ships = [{ cls: 'lcs_freedom', cfg: 'mcm' }]; __S.screenPrep() }); await tick();
    need(await st(() => { const o = [...document.querySelector('[data-nvin="cfg"]').options]; return o.find(x => x.value === 'suw').disabled && !o.find(x => x.value === 'mcm').disabled }), `${tag} m6 : configuration SUW refusée, MCM permise`);
    await click('nvrecuse'); await tick();

    // 4. configuration réelle en mission : MCM/SUW, MH-60S sans bouées
    await start('m6');
    const m6 = await st(() => { startCrisis('mine'); const c = __S.s.crises[__S.s.crises.length - 1], A = crisisActions(c), sw = A.find(a => a.id === 'sweep'); startCrisis('sub'); const k = __S.s.crises[__S.s.crises.length - 1], B = crisisActions(k).find(a => a.id === 'buoy'); return { sw: sw && sw.ok && /LCS-1|MCM-1/.test(sw.label), buoy: B && !B.ok, h: __S.allAir()[0] } });
    need(m6.sw, `${tag} m6 : déminage par le LCS en MCM`);
    need(m6.buoy && m6.h.kind === 'mh60s' && m6.h.buoys === 0, `${tag} m6 : MH-60S sans action acoustique`);
    await start('f2');
    const f2 = await st(() => { startCrisis('mine'); const c = __S.s.crises[__S.s.crises.length - 1], sw = crisisActions(c).find(a => a.id === 'sweep'); return sw && !sw.ok && /mine/i.test(sw.why || sw.label) });
    need(f2, `${tag} f2 : déminage refusé sans capacité MCM, raison lisible`);

    // 5. plusieurs bâtiments d'une même classe, stocks distincts ; plafond d'appareils pendant départs et retours ; dernière bouée
    await startF('asw', [{ cls: 'arleigh_burke', cfg: 'std' }, { cls: 'virginia', cfg: 'std' }, { cls: 'lcs_freedom', cfg: 'suw' }, { cls: 'lcs_freedom', cfg: 'suw' }, { cls: 'zeus', cfg: 'std' }]);
    const asw = await st(() => { const S = __S.s, L1 = S.units.find(u => u.id === 'LCS-1'), L2 = S.units.find(u => u.id === 'LCS-2'); const h = __S.nvLaunch(L1, 'any'); return { h: h && h.id, a: L1.air[0].id, b: L2.air[0].id, sa: L1.air[0] !== L2.air[0] } });
    need(asw.h === 'LCS-1-H1' && asw.a !== asw.b && asw.sa, `${tag} asw : deux LCS, identifiants et appareils distincts`);
    await run(7);
    await st(() => { const h = __S.s.units.find(u => u.id === 'LCS-1-H1'), [gx, gy] = nearSea(h.x + 40, h.y); buoyOrder(h, gx * 4 + 2, gy * 4 + 2) });
    await run(12);
    const sk = await st(() => { const S = __S.s, h = S.units.find(u => u.id === 'LCS-1-H1'), r2 = S.units.find(u => u.id === 'LCS-2').air[0]; return [h.buoys, r2.buoys] });
    need(sk[0] < 24 && sk[1] === 24, `${tag} asw : bouées consommées sur LCS-1-H1 seulement (${sk})`);
    await start('l12');
    const cap = await st(() => { const S = __S.s, D1 = S.units.find(u => u.id === 'DDG-1'), L1 = S.units.find(u => u.id === 'LCS-1'); const a = __S.nvLaunch(D1, 'any'), b = __S.nvLaunch(D1, 'any'), c = __S.nvLaunch(L1, 'any'); return { a: !!a, b: !!b, c: !!c, why: __S.airCap().ok } });
    need(cap.a && cap.b && !cap.c && !cap.why, `${tag} l12 : plafond de 2 appareils engagés au départ`);
    await run(10);
    await st(() => { const h = __S.s.units.find(u => u.id === 'DDG-1-H1'); h.rtb = true; h.task = null });
    let ret = null; for (let i = 0; i < 40; i++) { await run(1); ret = await st(() => { const r = __S.allAir().find(x => x.id === 'DDG-1-H1'); return r.st }); if (ret === 'recovering') break }
    need(ret === 'recovering' && !(await st(() => __S.airCap().ok)), `${tag} l12 : appareil en récupération toujours compté (${ret})`);
    await run(7);
    need(await st(() => __S.allAir().find(x => x.id === 'DDG-1-H1').st === 'aboard' && __S.airCap().ok), `${tag} l12 : emplacement libéré après la récupération effective`);
    await start('c1');
    const last = await st(() => { const S = __S.s, L = S.units.find(u => u.id === 'LCS-1'), h = __S.nvLaunch(L, 'any'); for (let i = 0; i < 70; i++) step(.1); const open = () => { for (let r = 30; r < 400; r += 10) for (let a = 0; a < 6.28; a += .3) { const x = h.x + Math.cos(a) * r, y = h.y + Math.sin(a) * r; if (seaAt(x, y) && buoyPts({ x, y }, 'tri', 0).every(([px, py]) => seaAt(px, py))) return [x, y] } return [h.x, h.y] }, q = open(); buoyOrder(h, q[0], q[1]); for (let i = 0; i < 150; i++) step(.1); for (let i = 0; i < 200 && h.task; i++) step(.1); const after = h.buoys, q2 = open(), again = buoyOrder(h, q2[0], q2[1]); h.rtb = true; for (let i = 0; i < 600 && !h.recov; i++) step(.1); const r = L.air[0]; for (let i = 0; i < 460; i++) step(.1); const h2 = __S.nvLaunch(L, 'any'); return { after, again, rst: r.st, rb: r.buoys, h2b: h2 ? h2.buoys : 'refus', r0: r.buoys0 } });
    need(last.r0 === 8 && last.after === 0 && last.again === false && last.rb === 0 && last.h2b === 0, `${tag} c1 : dernière bouée consommée, stock épuisé, pas de recharge ${JSON.stringify(last)}`);

    // 6. équipes : transport, blocage du retour, récupération, transfert, plafond ; rappel collectif partiel
    await start('e6');
    const tm = await st(() => { const S = __S.s, P = S.units.find(u => u.id === 'LPD-1'), H = S.units.find(u => u.id === 'AH-1'); const h = __S.nvLaunch(P, 'carry', 'LPD-1-H1', __S.allTeams().find(x => x.id === 'LPD-1-T1')); const dupe = __S.teamDeploy(__S.allTeams().find(x => x.id === 'LPD-1-T1'), P); for (let i = 0; i < 70; i++) step(.1); h.path = [{ x: h.x + 60, y: h.y }]; for (let i = 0; i < 80; i++) step(.1); const T1 = __S.allTeams().find(x => x.id === 'LPD-1-T1'); const drop = __S.teamDeploy(T1, h); for (let i = 0; i < 90; i++) step(.1); const T2 = __S.allTeams().find(x => x.id === 'LPD-1-T2'), T3 = __S.allTeams().find(x => x.id === 'AH-1-T1'); const d2 = __S.teamDeploy(T2, P); for (let i = 0; i < 90; i++) step(.1); const d3 = __S.teamDeploy(T3, H); h.rtb = true; for (let i = 0; i < 20; i++) step(.1); return { emb: h && T1.st, dupe, drop, st1: T1.st, d2, d3, blocked: !h.rtb && h.teamOut === 'LPD-1-T1', h: h.id } });
    need(tm.dupe === false, `${tag} e6 : équipe embarquée dans l'hélicoptère impossible à déployer depuis le navire`);
    need(tm.drop && tm.st1 === 'deployed', `${tag} e6 : équipe déposée par l'hélicoptère (8 s)`);
    need(tm.d2 === true && tm.d3 === false, `${tag} e6 : plafond de 2 équipes déployées`);
    need(tm.blocked, `${tag} e6 : retour de l'hélicoptère bloqué tant que l'équipe est dehors`);
    const rc = await st(() => { const S = __S.s, P = S.units.find(u => u.id === 'LPD-1'); const h2 = __S.nvLaunch(P, 'any'); for (let i = 0; i < 70; i++) step(.1); h2.path = [{ x: h2.x - 80, y: h2.y }]; for (let i = 0; i < 60; i++) step(.1); const rep = __S.recallAll(); return rep.rows.map(r => r.id + ':' + r.k) });
    need(rc.some(x => /LPD-1-H1:team/.test(x)) && rc.some(x => /LPD-1-H2:ok/.test(x)), `${tag} e6 : rappel collectif partiel ${rc}`);
    await st(() => { const o = document.querySelector('#over'); o.hidden = true; __S.s.sel = null; leftTab = 'forces'; if (innerWidth <= 980) MV = 'forces'; renderLeft() });
    need(await st(() => { const r = document.querySelector('.nvrep'); return !!r && /bloqué|blocked/i.test(r.textContent) }), `${tag} e6 : blocages du rappel affichés avec leur raison`);
    const rv = await st(() => { const S = __S.s, h = S.units.find(u => u.id === 'LPD-1-H1'), T1 = __S.allTeams().find(x => x.id === 'LPD-1-T1'); const s0 = T1.st, ok = s0 === 'recovering' || __S.teamRecover(T1, h); for (let i = 0; i < 90; i++) step(.1); const s1 = T1.st; h.rtb = true; for (let i = 0; i < 900 && !h.recov; i++) step(.1); for (let i = 0; i < 10; i++) step(.1); return { ok, s1, s2: T1.st, car: T1.carrier, hs: __S.allAir().find(x => x.id === 'LPD-1-H1').st } });
    need(rv.ok && rv.s1 === 'embarked' && rv.s2 === 'aboard' && rv.car === 'LPD-1' && rv.hs === 'aboard', `${tag} e6 : équipe récupérée avant le retour de son transport ${JSON.stringify(rv)}`);
    const xf = await st(() => { const S = __S.s, P = S.units.find(u => u.id === 'LPD-1'), T2 = __S.allTeams().find(x => x.id === 'LPD-1-T2'); const ok = T2.st === 'recovering' || T2.st === 'aboard' || __S.teamRecover(T2, P); for (let i = 0; i < 90; i++) step(.1); return ok && T2.st === 'aboard' && T2.carrier === 'LPD-1' });
    need(xf, `${tag} e6 : équipe déployée depuis le navire récupérée par le navire`);

    // 7. sauvegarde et restauration d'une mission en cours, sans perte ni duplication
    await start('asw');
    await st(() => { const S = __S.s, D1 = S.units.find(u => u.id === 'DDG-1'); __S.nvLaunch(D1, 'any'); for (let i = 0; i < 80; i++) step(.1); const h = S.units.find(u => u.id === 'DDG-1-H1'); buoyOrder(h, h.x + 40, h.y); __S.nvLaunch(S.units.find(u => u.id === 'LCS-1'), 'carry', null, __S.allTeams().find(x => x.id === 'LCS-1-T1')); for (let i = 0; i < 120; i++) step(.1) });
    const snap = () => st(() => { const S = __S.s; return JSON.stringify({ t: S.t.toFixed(2), tn: S.tension.toFixed(4), u: S.units.map(u => [u.id, u.x.toFixed(2), u.y.toFixed(2), Math.round(u.buoys || 0), u.fuel.toFixed(1)]), a: __S.allAir().map(r => [r.id, r.st, r.buoys]), tm: __S.allTeams().map(x => [x.id, x.st, x.carrier]), c: S.crises.map(c => [c.id, c.type, !!c.closed]), sh: S.ships.length, r: __S.R.get() }) });
    need(await st(() => __S.saveGame(true)), `${tag} asw : sauvegarde écrite`);
    const s0 = await snap();
    await run(30); const A = await snap();
    const lerr = await st(() => __S.loadGame());
    need(lerr === null, `${tag} asw : restauration acceptée (${lerr})`);
    const s1 = await snap();
    need(s1 === s0, `${tag} asw : état restauré identique à l'état sauvegardé`);
    need(await st(() => __S.s.running === false), `${tag} asw : mission restaurée en pause`);
    await run(30); const B = await snap();
    need(A === B, `${tag} asw : même suite après restauration (aucun nouveau tirage, aucune ressource recréée)`);
    const forged = await st(() => { const d = JSON.parse(localStorage.getItem('seuil.save')); const g = d.graph; const Sx = g[g[0].S.$r]; const fs = g[Sx.fleetSel.$r]; g[fs.$a[0].$r].cls = 'gerald_ford'; g[fs.$a[0].$r].cfg = 'exercise'; localStorage.setItem('seuil.save', JSON.stringify(d)); return __S.loadGame() });
    need(typeof forged === 'string' && /règles|rules/i.test(forged), `${tag} sauvegarde modifiée refusée par le moteur`);

    // 8. connaissance du joueur : l'allocation ne dépend pas de la vérité cachée ; un compte rendu d'équipe ne classe pas le contact
    const kn = await st(() => { const a = JSON.stringify(__S.NV.recommendFleet('asw')), p = JSON.stringify(__S.nvProf('asw')); return a === JSON.stringify(__S.NV.recommendFleet('asw')) && !/sousmarin|raider|fantome|truth/.test(p + a) });
    need(kn, `${tag} allocation indépendante de la vérité cachée`);
    await start('e6');
    const ob = await st(() => { const S = __S.s; startCrisis('evac', 'PORT'); const c = S.crises[S.crises.length - 1], P = S.units.find(u => u.id === 'LPD-1'); P.x = c.zone.x + 10; P.y = c.zone.y; const T = __S.allTeams().find(x => x.id === 'LPD-1-T1'); __S.teamDeploy(T, P); for (let i = 0; i < 90; i++) step(.1); const ev = c.ev.find(e => e.kind === 'team'); return { ev: !!ev, prov: ev && ev.prov, cls: !!c.cls } });
    need(ob.ev && ob.prov === 'TEAM' && !ob.cls, `${tag} compte rendu d'équipe versé au dossier, sans classement automatique`);

    // 9. parcours estimer, vérifier, agir jusqu'au bilan
    await start('c1');
    const fin = await st(() => { const S = __S.s; startCrisis('cyber', 'PORT'); const c = S.crises[S.crises.length - 1]; const col = crisisActions(c).find(a => a.kind === 'collect' && a.ok); if (col) doAct(col); for (let i = 0; i < 100; i++) step(.1); classify(c, leading(c)); const dec = crisisActions(c).find(a => a.kind === 'decide' && a.ok); if (dec) doAct(dec); let k = 0; while (!S.over && k++ < 20000) step(.5); return { over: S.over, est: !!c.cls, col: !!col, dec: !!dec } });
    need(fin.over && fin.est && fin.col && fin.dec, `${tag} parcours estimer, vérifier, agir jusqu'à la fin ${JSON.stringify(fin)}`);
    await st(() => { showEnd(); const m = document.querySelector('details.more'); document.querySelectorAll('#over details').forEach(d => d.open = true) }); await tick(300);
    need(await st(() => /Flotte allouée|Allocated fleet/.test(document.querySelector('#over').textContent) && /encore dehors|still out/.test(document.querySelector('#over').textContent)), `${tag} bilan : flotte, appareils et équipes encore dehors`);
    need(await st(() => !localStorage.getItem('seuil.save')), `${tag} bilan : sauvegarde effacée à la fin de la mission`);
    await noX('bilan');

    // 10. fiche en mission : moyens embarqués, clavier et taille des commandes
    await start('asw');
    await sheet('DDG-1'); await st(() => { const d = document.querySelector('details.uemb'); if (d) d.open = true });
    need(await st(() => /DDG-1-H1/.test(document.querySelector('#right').textContent) && /Pas de recharge|No reload/.test(document.querySelector('#right').textContent)), `${tag} fiche du destroyer : appareils et stocks`);
    await small('#right .nvemb .btn', 'fiche en mission'); await noX('mission');
    await p.screenshot({ path: D + `/v47-mission-${tag}.png` });
    need(await st(() => __S.missing().length === 0), `${tag} aucun texte manquant : ${await st(() => __S.missing().join(','))}`);
    need(!errs.length, `${tag} erreurs console : ${errs.slice(0, 3).join(' | ')}`);
    await ctx.close();
  }
  await b.close(); console.log(`uiv47 : ${n} contrôles, ${bad ? bad + ' échec(s)' : 'tous réussis'}`); process.exit(bad ? 1 : 0);
})();
