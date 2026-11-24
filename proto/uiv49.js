// Version 49 : illustrations des missions (cartes et briefing), étiquettes « exercice fictif » retirées, globe tournant et satellites.
// Usage : node uiv49.js [dossier captures]. Largeurs 1440, 1024, 768 et 390 px, en français et en anglais.
const { chromium } = require('playwright'), fs = require('fs'), path = require('path');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] }), errs = [], cons = [], D = process.argv[2] || '/tmp'; let bad = 0, n = 0;
  const need = (ok, m) => { n++; if (!ok) { bad++; console.log('ÉCHEC', m); } };
  // registre du jeu, manifeste du pack et fichiers servis : une seule correspondance
  const man = JSON.parse(fs.readFileSync(path.join(__dirname, '../assets/missions/mission-illustrations.json'), 'utf8')), byId = {}; man.missions.forEach(m => byId[m.gameMissionId] = m);
  const LBL = /^\s*(EXERCICE FICTIF|FICTIONAL EXERCISE)\s*$/;
  for (const [lang, w, h] of [['fr', 1440, 900], ['en', 1024, 768], ['fr', 768, 1024], ['en', 390, 844]]) {
    const tag = lang + w, mob = w <= 760, ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: mob, hasTouch: mob, locale: lang }), p = await ctx.newPage();
    await p.route(/fonts\.g/, r => r.abort()); p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|Failed to load resource/.test(m.text())) cons.push(m.text().slice(0, 120)) });
    const st = (f, a) => p.evaluate(f, a), noX = async nm => need(await st(() => document.documentElement.scrollWidth - document.documentElement.clientWidth) <= 0, tag + ' ' + nm + ' : pas de défilement horizontal');
    const label = () => st(src => { const re = new RegExp(src); return [...document.querySelectorAll('body *')].filter(e => e.children.length === 0 && re.test(e.textContent) && e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden').length }, LBL.source);
    await p.goto('file://' + __dirname + '/t.html'); await p.waitForTimeout(700); await st(l => { try { localStorage.clear() } catch (_) { } __S.setLang(l); __S.home(true) }, lang); await p.waitForTimeout(1500);
    // ---------- accueil : globe et satellites ----------
    const g = await st(async () => { const G = __S.Globe, a = G.ang, s0 = (G.sats || []).map(q => q.dot.position.x); await new Promise(r => setTimeout(r, 1200)); return { gl: !!G.r, n: (G.sats || []).length, d: G.ang - a, moved: (G.sats || []).filter((q, i) => q.dot.position.x !== s0[i]).length, spin: __S.GLOBE_SPIN } });
    need(g.gl && g.n === 6 && g.moved === 6, tag + ' accueil : six satellites en mouvement ' + JSON.stringify(g));
    need(g.d > 1.2 && g.d < 6, tag + ' accueil : le globe tourne en continu (' + g.d.toFixed(2) + '° en 1,2 s)');
    need(await label() === 0, tag + ' accueil : étiquette « exercice fictif » absente'); await noX('accueil'); await p.screenshot({ path: D + '/v49-accueil-' + tag + '.png' });
    if (w >= 1000) { // survol d'un repère : le globe s'arrête, le repère reste cliquable
      const bx = await st(() => { const e = [...document.querySelectorAll('.hs-mk')].find(q => getComputedStyle(q).visibility !== 'hidden'), i = e && e.querySelector('.brk'), r = (i || e).getBoundingClientRect(); return e ? [r.left + r.width / 2, r.top + r.height / 2] : null }); if (bx) { await p.mouse.move(bx[0], bx[1]); await p.waitForTimeout(150); const d = await st(async () => { const a = __S.Globe.ang; await new Promise(r => setTimeout(r, 600)); return __S.Globe.ang - a }); need(Math.abs(d) < .05, tag + ' accueil : le globe s’arrête au survol d’un repère (' + d.toFixed(3) + ')'); await p.mouse.move(5, 5) } }
    // ---------- missions : huit cartes, bonne image ----------
    await p.click('[data-a=play]'); await p.waitForTimeout(500);
    const cards = async () => st(async () => { const c = [...document.querySelectorAll('.ms-card')]; for (const e of c) { e.scrollIntoView(); await new Promise(r => setTimeout(r, 60)) } await new Promise(r => setTimeout(r, 500)); return c.map(e => { const a = e.querySelector('.art'), i = e.querySelector('img.art-i'), r = a && a.getBoundingClientRect(), ir = i && i.getBoundingClientRect(); return { id: e.dataset.v, file: i ? i.currentSrc.split('/').pop() : '', nat: i && i.complete && i.naturalWidth > 0 ? 640 : 0, fr: ir && r ? [Math.round(ir.width - r.width), Math.round(ir.height - r.height)] : null, alt: i ? i.getAttribute('alt') : null, hid: a && a.getAttribute('aria-hidden'), ratio: r ? +(r.width / r.height).toFixed(2) : 0, fill: ir && r ? Math.abs(ir.width - r.width) < 2 && Math.abs(ir.height - r.height) < 2 : false, pos: i ? i.style.objectPosition : '', inside: r ? r.left >= e.getBoundingClientRect().left - 1 && r.right <= e.getBoundingClientRect().right + 1 : false, tagName: e.tagName, nested: e.querySelectorAll('a,button,[tabindex]').length, title: e.querySelector('strong').textContent, th: !!e.querySelector('.ms-th').textContent, txt: e.innerText.length } }) });
    await p.mouse.move(2, 2); await p.waitForTimeout(450); /* hors des cartes : l'effet de survol agrandit l'image de 3 % */
    let C = await cards(); const HC = C.filter(c => !byId[c.id]); C = C.filter(c => byId[c.id]);
    need(HC.length === 1 && HC[0].id === 'hc' && !HC[0].file, tag + ' la mission sans illustration (convoi humanitaire) garde un cadre sans image');
    need(C.length === 8 && Object.keys(byId).length === 8 && C.every(c => byId[c.id]), tag + ' huit cartes, toutes dans le manifeste');
    need(C.every(c => c.file.startsWith(path.basename(byId[c.id].image, '.png') + '-') && c.nat >= 640), tag + ' chaque carte charge l’image de sa mission ' + JSON.stringify(C.filter(c => !(c.file.startsWith(path.basename(byId[c.id].image, '.png') + '-') && c.nat >= 640)).map(c => [c.id, c.file, c.nat])));
    need(C.every(c => c.title === byId[c.id].missionTitle) || lang === 'fr', tag + ' le titre de la carte est celui du manifeste (anglais)');
    need(C.every(c => c.pos.replace(/\s+/g, ' ') === byId[c.id].objectPosition), tag + ' recadrage du manifeste appliqué');
    need(C.every(c => c.ratio >= 1.74 && c.ratio <= 1.81 && c.fill && c.inside), tag + ' cadre 16:9 rempli, dans la carte ' + JSON.stringify(C.map(c => [c.ratio, c.fill, c.inside, c.fr])));
    need(C.every(c => c.alt === '' && c.hid === 'true' && c.tagName === 'BUTTON' && c.nested === 0 && c.th && c.txt > 60), tag + ' image décorative, une seule zone interactive, textes conservés');
    need(await label() === 0, tag + ' missions : étiquette absente'); await noX('missions'); await p.screenshot({ path: D + '/v49-missions-' + tag + '.png', fullPage: false });
    // changement de langue : la correspondance tient
    await st(l => { __S.setLang(l === 'fr' ? 'en' : 'fr'); __S.missions() }, lang); await p.waitForTimeout(300); const C2 = (await cards()).filter(c => byId[c.id]); need(C2.every((c, i) => c.id === C[i].id && c.file === C[i].file), tag + ' même image après changement de langue'); await st(l => { __S.setLang(l); __S.missions() }, lang); await p.waitForTimeout(300);
    // clavier : la carte est atteinte par tabulation et s'ouvre par Entrée
    await st(() => document.querySelector('.ms-card[data-v=f2]').focus()); const foc = await st(() => document.activeElement.dataset.v); await p.keyboard.press('Enter'); await p.waitForTimeout(500);
    const br = async () => st(() => { const i = document.querySelector('#over .art-b img'), a = document.querySelector('#over .art-b'), go = document.querySelector('#over .go'), h1 = document.querySelector('#over h1'); return { file: i ? i.currentSrc.split('/').pop() : '', nat: i ? i.naturalWidth : 0, alt: i ? i.alt : '', h: a ? Math.round(a.getBoundingClientRect().height) : 0, title: h1 && h1.textContent, go: !!go, evid: !!document.querySelector('#right .art, .evb .art, #left .art') } });
    let B = await br(); need(foc === 'f2' && B.file === '02_the_seabed-1280.webp' && B.nat === 1280, tag + ' briefing ouvert au clavier, image de la mission ' + JSON.stringify(B));
    need(B.h >= 110 && B.h <= 210 && B.go && B.alt.length > 30 && !/sabotage|\bmines?\b|hostile|ennemi|enemy|attaque|attack/i.test(B.alt), tag + ' bandeau de hauteur raisonnable, texte alternatif sans menace, bouton de lancement présent ' + B.h);
    need(!B.evid, tag + ' aucune illustration dans les dossiers de preuves'); need(await label() === 0, tag + ' briefing : étiquette absente'); await noX('briefing'); await p.screenshot({ path: D + '/v49-briefing-' + tag + '.png' });
    // tirage au hasard : l'image suit la mission tirée
    for (let k = 0; k < 4; k++) { await st(() => __S.missions()); await p.waitForTimeout(150); await p.click('[data-a=rand]'); await p.waitForTimeout(350); const r = await st(() => ({ id: __S.pickSc, f: (document.querySelector('#over .art-b img') || {}).currentSrc || '' })); need(r.id === 'hc' && !r.f || byId[r.id] && r.f.split('/').pop().startsWith(path.basename(byId[r.id].image, '.png') + '-'), tag + ' tirage au hasard ' + k + ' : image de ' + r.id + ' ' + r.f.split('/').pop()) }
    // mission sans illustration (tutoriel) : pas de cadre vide
    await st(() => __S.brief('tuto', true)); await p.waitForTimeout(250); need(await st(() => !document.querySelector('#over .art')), tag + ' tutoriel : aucun cadre d’illustration');
    // ---------- image manquante : carte lisible, mission jouable ----------
    await st(() => { window.__artBase = 'absent/'; __S.missions() }); await p.waitForTimeout(900);
    const X = await st(() => [...document.querySelectorAll('.ms-card')].map(e => { const a = e.querySelector('.art'), r = a.getBoundingClientRect(); return { img: !!e.querySelector('img'), x: a.classList.contains('art-x'), ratio: +(r.width / r.height).toFixed(2), bg: getComputedStyle(a).backgroundImage !== 'none', t: e.querySelector('strong').textContent.length } }));
    need(X.length === 9 && X.every(c => !c.img && c.x && c.ratio >= 1.74 && c.ratio <= 1.81 && c.bg && c.t > 3), tag + ' image manquante : cadre bleu nuit au même ratio, sans icône cassée, textes conservés');
    await p.screenshot({ path: D + '/v49-repli-' + tag + '.png' }); await p.click('.ms-card[data-v=c1]'); await p.waitForTimeout(500);
    const run = await st(async () => { const go = [...document.querySelectorAll('#over .go')].pop(); if (go) go.click(); await new Promise(r => setTimeout(r, 700)); for (let i = 0; i < 6; i++) { const g = [...document.querySelectorAll('#over .go')].pop(); if (!g || document.getElementById('over').hidden) break; g.click(); await new Promise(r => setTimeout(r, 400)) } const S = __S.s; return { sc: S && S.sc.id, turn: S && S.turn, over: document.getElementById('over').hidden } });
    need(run.sc === 'c1' && run.turn >= 1, tag + ' image manquante : la mission se lance ' + JSON.stringify(run)); await st(() => { window.__artBase = undefined });
    // ---------- en partie, menu et bilan : étiquette absente ; règles intactes ----------
    await st(() => { const A = __S; document.getElementById('over').hidden = true; A.newGame(21, { sc: 'c1', deck: A.SC.c1.rec.slice(), contested: true, guided: false, timer: 'easy' }); A.redraw() }); await p.waitForTimeout(300);
    need(await label() === 0 && await st(() => !document.querySelector('#hud .fxtag')), tag + ' en partie : étiquette absente de la barre'); await noX('partie'); await p.screenshot({ path: D + '/v49-partie-' + tag + '.png' });
    const rules = await st(() => { const S = __S.s; return { tok: S.tokens, spd: S.speed, turns: S.turns, objs: S.objs.length } }); need(rules.tok === undefined && rules.spd === .5 && rules.turns === 16, tag + ' règles de la partie inchangées ' + JSON.stringify(rules));
    await st(() => { const S = __S.s; let i = 0; while (i++ < 9000 && !S.over) __S.step(.1) }); await p.waitForTimeout(400); need(await label() === 0 && await st(() => /\d{3}/.test(document.getElementById('over').innerText)), tag + ' bilan : étiquette absente, score affiché');
    need(!(await st(() => __S.missing())).length, tag + ' aucun texte manquant : ' + (await st(() => __S.missing())).join(', '));
    await ctx.close();
  }
  // mouvement réduit : globe et satellites fixes
  { const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' }), p = await ctx.newPage(); await p.route(/fonts\.g/, r => r.abort()); await p.goto('file://' + __dirname + '/t.html'); await p.waitForTimeout(1500);
    const r = await p.evaluate(async () => { const G = __S.Globe, a = G.ang, x = G.sats && G.sats[0].dot.position.x; await new Promise(q => setTimeout(q, 800)); return [G.ang - a, G.sats && G.sats[0].dot.position.x - x, (G.sats || []).length] }); need(r[0] === 0 && r[1] === 0 && r[2] === 6, 'mouvement réduit : globe et satellites immobiles ' + r); await ctx.close() }
  // fichiers servis : présents, au bon format, issus des PNG du manifeste
  for (const m of man.missions) { const base = path.basename(m.image, '.png'); for (const w of [640, 1280]) { const f = path.join(__dirname, '../assets/missions/web', base + '-' + w + '.webp'); need(fs.existsSync(f) && fs.statSync(f).size > 8000 && fs.readFileSync(f).subarray(8, 12).toString() === 'WEBP', 'fichier servi ' + base + '-' + w + '.webp') } need(fs.existsSync(path.join(__dirname, '..', m.image)), 'PNG d’origine ' + m.image) }
  need(!errs.length && !cons.length, 'aucune erreur de page ni de console : ' + errs.concat(cons).slice(0, 3).join(' | '));
  console.log(bad ? bad + ' ÉCHEC(S) sur ' + n : 'uiv49 : ' + n + ' contrôles réussis'); await b.close(); process.exit(bad ? 1 : 0);
})();
