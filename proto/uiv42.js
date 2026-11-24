// Version 42 : accueil Campagne / Missions / Multijoueur et huit missions uniques. Usage : node uiv42.js
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); let bad = 0, n = 0; const need = (ok, m) => { n++; if (!ok) { bad++; console.log('ÉCHEC', m) } };
  for (const [lang, vw, mob] of [['fr', { width: 1440, height: 900 }, 0], ['en', { width: 390, height: 844 }, 1]]) {
    const tag = lang + vw.width, errs = [], ctx = await b.newContext({ viewport: vw, isMobile: !!mob, hasTouch: !!mob }), p = await ctx.newPage();
    await p.route(/fonts\.g/, r => r.abort()); p.on('pageerror', e => errs.push(e.message));
    await p.addInitScript(l => { try { localStorage.clear(); localStorage.setItem('seuil.lang', l); localStorage.setItem('seuil.last', 'i15') } catch (_) { } }, lang);
    await p.goto('file://' + __dirname + '/t.html'); await p.waitForTimeout(900);
    const home = await p.evaluate(() => { const m = [...document.querySelectorAll('.hs-modes > button')]; return { n: m.length, lab: m.map(e => e.innerText.split('\n')[0].trim()), dis: m.map(e => e.disabled), h: m.map(e => Math.round(e.getBoundingClientRect().height)), resume: !!document.querySelector('.hs-menu [data-a=sc]'), tuto: !!document.querySelector('.hs-menu [data-a=tuto]') } });
    need(home.n === 3 && /Campagne|Campaign/i.test(home.lab[0]) && /MISSIONS/i.test(home.lab[1]) && /Multijoueur|Multiplayer/i.test(home.lab[2]), tag + ' trois modes dans l\'ordre : ' + home.lab);
    need(home.dis[0] && !home.dis[1] && home.dis[2], tag + ' campagne et multijoueur grisés, missions actif : ' + home.dis);
    need(home.h.every(h => h >= 44), tag + ' cibles de 44 px : ' + home.h);
    need(!home.resume && home.tuto, tag + ' reprise masquée pour un scénario hors missions, tutoriel proposé');
    await p.click('.hs-modes button[disabled]', { force: true, trial: false }).catch(() => { }); await p.waitForTimeout(200);
    need(await p.evaluate(() => !!document.querySelector('.hs-modes')), tag + ' clic sur un mode grisé sans effet');
    // clavier : focus sur Missions puis Entrée
    await p.focus('[data-a=play]'); await p.keyboard.press('Enter'); await p.waitForTimeout(400);
    const ms = await p.evaluate(() => { const c = [...document.querySelectorAll('.ms-card')]; return { n: c.length, ids: c.map(e => e.dataset.v), th: c.map(e => e.querySelector('.ms-th').textContent), rg: [...new Set(c.map(e => __S.thOf(__S.SC[e.dataset.v])))], diff: c.map(e => __S.SC[e.dataset.v].diff), pl: __S.PLAYABLE().map(x => x.id), sw: [document.documentElement.scrollWidth, innerWidth], fict: /FICTI/i.test(document.querySelector('.ms').innerText) } });
    need(ms.n === 9 && ms.ids.join() === ms.pl.join(), tag + ' neuf cartes, celles de PLAYABLE : ' + ms.ids);
    need(new Set(ms.th).size === 9, tag + ' neuf thèmes distincts : ' + ms.th.join(' | '));
    need(ms.rg.length === 6, tag + ' six régions : ' + ms.rg);
    need([1, 2, 3].every(d => ms.diff.includes(d)), tag + ' trois niveaux de difficulté : ' + ms.diff);
    need(ms.sw[0] <= ms.sw[1] && ms.fict, tag + ' pas de défilement horizontal, mention fictive : ' + ms.sw);
    // chaque carte ouvre son briefing
    for (const id of ms.ids) { await p.evaluate(() => __S.screenMissions()); await p.click(`.ms-card[data-v="${id}"]`); await p.waitForTimeout(150); const ok = await p.evaluate(id => !!document.querySelector('[data-a=startgame],[data-a=deck],[data-a=go],.go') && document.getElementById('over').innerText.includes(__S.L10(__S.SC[id].title)), id); need(ok, tag + ' briefing de ' + id) }
    // tirage au hasard et catalogue d'un théâtre limités aux missions
    const r = await p.evaluate(async () => { const o = []; for (let i = 0; i < 12; i++) { __S.screenMissions(); document.querySelector('[data-a=rand]').click(); await new Promise(r => setTimeout(r, 30)); o.push(__S.pickSc ? __S.pickSc : null) } return o });
    need(r.every(k => ms.pl.includes(k)), tag + ' tirage au hasard parmi les missions : ' + r.join(',')); await p.evaluate(() => { __S.screenMissions(); document.querySelector('.ms [data-a=home]').click() }); await p.waitForTimeout(600);
    const cat = await p.evaluate(async () => { const b = document.querySelector('[data-a=theatre][data-v=natl]'); b.click(); await new Promise(r => setTimeout(r, 200)); return [...document.querySelectorAll('.card[data-a=sc]')].map(e => e.dataset.v) });
    need(cat.length === 3 && cat.every(k => ['f2', 'asw', 'l12'].includes(k)), tag + ' Atlantique Nord : trois missions : ' + cat);
    const miss = await p.evaluate(() => __S.missing()); need(!miss.length, tag + ' aucun texte manquant : ' + miss.join(','));
    need(!errs.length, tag + ' aucune erreur : ' + errs.slice(0, 3).join(' | '));
    await ctx.close();
  }
  await b.close(); console.log(bad ? bad + ' échec(s) sur ' + n : 'tout passe (' + n + ' contrôles)'); process.exit(bad ? 1 : 0);
})();
