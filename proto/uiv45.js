// Version 45 : déploiement avant la mission (ordre de bataille de la mission ou unités choisies).
// Vrais clics, 1440 px en français et 390 px en anglais. Usage : node uiv45.js [dossier captures]
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), D = process.argv[2] || '/tmp'; let bad = 0, n = 0;
  const need = (ok, m) => { n++; if (!ok) { bad++; console.log('ÉCHEC', m); } };
  for (const [lang, vw, mob] of [['fr', { width: 1440, height: 900 }, 0], ['en', { width: 390, height: 844 }, 1]]) {
    const tag = lang + vw.width, errs = [];
    const ctx = await b.newContext({ viewport: vw, isMobile: !!mob, hasTouch: !!mob }), p = await ctx.newPage();
    await p.route(/fonts\.g/, r => r.abort()); p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/^Failed to load resource/.test(m.text())) errs.push(m.text()); });
    await p.goto('file://' + __dirname + '/t.html'); await p.waitForTimeout(600);
    const st = (f, a) => p.evaluate(f, a), tick = (ms = 250) => p.waitForTimeout(ms), click = async sel => { await p.locator(sel).first().click(); await tick(); };
    // mission locale de niveau 1 (c1) : budget 36, ordre de bataille de la mission moins cher
    await st(l => { const A = __S; A.setLang(l); A.brief('c1', false) }, lang); await tick(400);
    const b0 = await st(() => { const A = __S, sc = A.SC.c1; return { on: document.querySelector('[data-a="depm"].on').dataset.v, n: document.querySelectorAll('[data-a="depm"]').length, rec: sc.rec.join(','), draft: A.draft.join(','), B: A.depBudget(sc), rc: A.depCost(sc.rec) } });
    need(b0.n === 2 && b0.on === 'rec' && b0.draft === b0.rec, tag + ' briefing : deux choix, ordre de bataille de la mission par défaut ' + JSON.stringify(b0));
    need(b0.B === Math.max(36, b0.rc), tag + ' budget local niveau 1 : ' + b0.B + ' (liste de la mission ' + b0.rc + ')');
    await click('[data-a="depm"][data-v="own"]');
    const d1 = await st(() => ({ h: !!document.querySelector('.dep'), rows: document.querySelectorAll('.dep .ob-row').length, pts: document.querySelector('.dep-pts .m').textContent }));
    need(d1.h && d1.rows === 13 && d1.pts === `${b0.rc} / ${b0.B}`, tag + ' écran de déploiement : 13 unités, points ' + d1.pts);
    await p.screenshot({ path: D + '/v45-deploy-' + tag + '.png', fullPage: false });
    // ajouter jusqu'au plafond et au budget, motifs affichés
    const addUntil = async k => { for (let i = 0; i < 6; i++) { const dis = await p.locator(`[data-a="dpa"][data-v="${k}"]`).first().isDisabled(); if (dis) break; await click(`[data-a="dpa"][data-v="${k}"]`); } };
    await click('[data-a="dpc"]');
    const cl = await st(() => __S.draft.length);
    need(cl === 0, tag + ' tout retirer : liste vide (' + cl + ')');
    const gob = await st(() => document.querySelector('[data-a="dpok"]').disabled);
    need(gob, tag + ' liste vide : validation impossible et alerte');
    await addUntil('patrol');
    const pt = await st(() => { const A = __S; return { n: A.draft.filter(k => k === 'patrol').length, why: document.querySelector('[data-a="dpa"][data-v="patrol"]').title } });
    need(pt.n === 3 && /Maximum|reached/.test(pt.why), tag + ' LCS : plafond relevé à 3, motif « ' + pt.why + ' »');
    await addUntil('frigate');
    const fr = await st(() => { const A = __S, sc = A.SC.c1; return { n: A.draft.filter(k => k === 'frigate').length, c: A.depCost(A.draft), B: A.depBudget(sc), why: document.querySelector('[data-a="dpa"][data-v="frigate"]').title } });
    need(fr.c <= fr.B && fr.n >= 0 && fr.n <= 2, tag + ' destroyers : ' + fr.n + ', points ' + fr.c + ' sur ' + fr.B);
    const why = await st(() => { const A = __S, sc = A.SC.c1; const k = ['frigate', 'recon', 'fighter', 'sof', 'battery'].find(k => document.querySelector(`[data-a="dpa"][data-v="${k}"]`).disabled && A.depWhy(sc, A.draft, k).includes(' ')); return k ? document.querySelector(`[data-a="dpa"][data-v="${k}"]`).title : '' });
    need(/points|short/.test(why), tag + ' bouton + grisé avec la raison : « ' + why + ' »');
    // retirer, reprendre la liste, onglet Air
    await click('[data-a="dpd"][data-v="patrol"]');
    const rm = await st(() => __S.draft.filter(k => k === 'patrol').length);
    need(rm === 2, tag + ' retirer un LCS : ' + rm);
    await click('[data-a="dpt"][data-v="air"]');
    const tab = await st(() => [...document.querySelectorAll('.dep .ob-row [data-a="dpa"]')].map(x => x.dataset.v).join(','));
    need(tab === 'recon,drone,armed,fighter', tab + ' : onglet Air');
    await click('[data-a="dpt"][data-v="all"]');
    await click('[data-a="dps"][data-v="recon"]');
    const sheet = await st(() => document.querySelector('.ob-sheet').textContent.length > 40);
    need(sheet, tag + ' fiche de l’unité choisie');
    await click('[data-a="dpa"][data-v="drone"]');
    const chosen = await st(() => __S.draft.slice());
    await click('[data-a="dpok"]');
    const bb = await st(() => ({ on: document.querySelector('[data-a="depm"].on').dataset.v, sum: document.body.textContent.includes(__S.depCost(__S.draft) + '') , draft: __S.draft.join(',') }));
    need(bb.on === 'own' && bb.draft === chosen.join(','), tag + ' retour au briefing : unités choisies gardées ' + JSON.stringify(bb));
    await p.screenshot({ path: D + '/v45-brief-' + tag + '.png' });
    // lancer : les unités choisies sont en jeu, le meilleur résultat n'est pas enregistré, le bilan le dit
    await click('[data-a="begin"]'); await tick(300);
    const g = await st(() => { const A = __S, S = A.s; const cnt = {}; S.units.forEach(u => cnt[u.type] = (cnt[u.type] || 0) + 1); return { dep: S.dep, cnt, two: S.units.filter(u => u.type === 'patrol').map(u => u.id).join(',') } });
    const want = {}; chosen.filter(k => !['team', 'analysis', 'comm'].includes(k)).forEach(k => want[k] = (want[k] || 0) + 1);
    need(g.dep && g.dep.own && JSON.stringify(Object.keys(want).sort().map(k => [k, want[k]])) === JSON.stringify(Object.keys(g.cnt).filter(k => k !== 'helo').sort().map(k => [k, g.cnt[k]])), tag + ' partie : unités choisies en jeu ' + JSON.stringify(g));
    need(g.two === 'LCS-1,LCS-2', tag + ' indicatifs LCS-1, LCS-2 : ' + g.two);
    const end = await st(() => { const A = __S; try { localStorage.removeItem('seuil.best') } catch (_) { } A.s.over = true; recordRun(); let best = null; try { best = JSON.parse(localStorage.getItem('seuil.best') || '{}').c1 || null } catch (_) { } return { best, row: A.expEnd() } });
    need(!end.best && /choisies|chosen/.test(end.row), tag + ' bilan : forces choisies indiquées, meilleur résultat non enregistré');
    // retour au briefing d'une autre mission : ordre de bataille par défaut
    await st(() => { __S.brief('f2', false) }); await tick(300);
    const f2 = await st(() => ({ on: document.querySelector('[data-a="depm"].on').dataset.v, draft: __S.draft.join(','), rec: __S.SC.f2.rec.join(',') }));
    need(f2.on === 'rec' && f2.draft === f2.rec, tag + ' autre mission : retour à l’ordre de bataille de la mission');
    // ordre de bataille par défaut : rien ne change
    await click('[data-a="begin"]'); await tick(300);
    const g2 = await st(() => { const A = __S; return { dep: A.s.dep, n: A.s.units.filter(u => !A.UT[u.type].off && u.type !== 'helo').length } });
    need(!g2.dep, tag + ' ordre de bataille de la mission : partie sans marque de déploiement');
    // tutoriel : pas de choix
    await st(() => { __S.brief('tuto', true) }); await tick(300);
    const tu = await st(() => document.querySelectorAll('[data-a="depm"]').length);
    need(tu === 0, tag + ' tutoriel sans choix de déploiement');
    const misc = await st(() => [document.documentElement.scrollWidth > innerWidth, [...(window.__missing || [])]]);
    need(!misc[0], tag + ' pas de défilement horizontal'); need(!misc[1].length, tag + ' textes manquants : ' + misc[1].join(','));
    need(!errs.length, tag + ' erreurs : ' + errs.slice(0, 3).join(' | '));
    await ctx.close();
  }
  console.log(bad ? `${bad} échec(s) sur ${n}` : `uiv45 : ${n} contrôles, tous réussis`); await b.close(); process.exit(bad ? 1 : 0);
})();
