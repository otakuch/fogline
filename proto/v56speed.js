// Version 56, lot 4 : la vitesse de jeu ne change pas le résultat.
// Une même partie (même tirage, même script de référence, décisions aux mêmes instants simulés) est jouée par la VRAIE boucle de la page
// à ×¼, ×1, ×4 et à ×2 avec des images irrégulières. Score, issues des crises, état final et journal doivent être identiques.
// Le journal est comparé sans les deux avis « vitesse ramenée à ×½ / ×¼ », qui dépendent par nature de la vitesse choisie.
// Usage : node v56speed.js [missions séparées par des virgules] [tirage]     défaut : c1,asw,hc
const { chromium } = require('playwright');
(async () => {
  const ids = (process.argv[2] || 'c1,asw,hc').split(','), seed0 = +(process.argv[3] || 21);
  const b = await chromium.launch(); let fails = 0;
  const RUNS = [['x1/4', .25, [200]], ['x1', 1, [33.34]], ['x4', 4, [16.67]], ['x2 irrégulier', 2, [7, 33, 16, 90, 12, 250, 16, 16, 500, 41]]];
  for (const sc of ids) {
    const out = [];
    for (const [name, speed, pat] of RUNS) {
      const p = await b.newPage(), errs = []; p.on('pageerror', e => errs.push(e.message));
      await p.addInitScript(() => { window.__rafQ = []; window.requestAnimationFrame = cb => { window.__rafQ.push(cb); return window.__rafQ.length }; window.cancelAnimationFrame = () => { }; window.__pump = ts => { const q = window.__rafQ; window.__rafQ = []; for (const cb of q) cb(ts) }; try { localStorage.setItem('seuil.lang', 'fr') } catch (_) { } });
      await p.goto('file://' + __dirname + '/t.html'); await p.addScriptTag({ path: __dirname + '/bots.js' });
      const t0 = Date.now();
      const r = await p.evaluate(({ sc, seed, speed, pat }) => {
        const A = __S; window.__noBudget = 1; window.__subZone = 0; window.__noEsc = true; A.newGame(seed, { sc, deck: A.SC[sc].rec, guided: false }); A.startJams();
        const S = A.s, pol = mkBot({}), J = [], skip = [A.I18N.fr['l.x1'], A.I18N.fr['l.x14']]; let next = 0, top = S.log[0], steps = 0;
        S.running = true; S.speed = speed;
        window.__onStep = s => { if (s !== S) return; steps++; for (let i = 0; i < s.log.length && s.log[i] !== top; i++) if (!skip.includes(s.log[i].m)) J.push(s.t.toFixed(2) + ' ' + s.log[i].m); top = s.log[0]; if (s.t >= next - 1e-9) { next += 5; pol(s) } if (!s.over) { s.running = true; if (s.tmode !== 'turn') s.speed = speed } };
        let ts = 1000, i = 0, frames = 0; __pump(ts); for (; i < 400000 && !S.over; i++) { ts += pat[i % pat.length]; __pump(ts); frames++ }
        window.__onStep = null; const q = A.score(); let h = 0; const str = J.join('\n'); for (let k = 0; k < str.length; k++) h = (h * 31 + str.charCodeAt(k)) | 0;
        return { over: S.over, s: q.s, ok: q.ok, t: +S.t.toFixed(3), steps, frames, cr: S.crises.map(c => c.type + ':' + (c.closed ? (+c.out).toFixed(3) : 'ouverte')).join(' '), fin: JSON.stringify([+S.tension.toFixed(6), S.units.map(u => [u.id, u.x === undefined ? 0 : +u.x.toFixed(4), u.y === undefined ? 0 : +u.y.toFixed(4), u.hp])]), jn: J.length, jh: h, j: J }
      }, { sc, seed: seed0, speed, pat });
      r.name = name; r.ms = Date.now() - t0; r.errs = errs; out.push(r); await p.close();
    }
    const a = out[0];
    console.log(`${sc} tirage ${seed0} : score ${a.s}, mission ${a.ok ? 'réussie' : 'échouée'}, ${a.steps} pas, ${a.jn} lignes de journal`);
    for (const r of out) {
      const same = r.over && r.s === a.s && r.ok === a.ok && r.cr === a.cr && r.fin === a.fin && r.jn === a.jn && r.jh === a.jh && r.steps === a.steps && !r.errs.length;
      if (!same) { fails++; const d = r.j.findIndex((x, i) => x !== a.j[i]); console.log('  ÉCART ' + r.name + ' : ' + JSON.stringify({ over: r.over, s: r.s, ok: r.ok, steps: r.steps, jn: r.jn, cr: r.cr === a.cr, fin: r.fin === a.fin, premier: d >= 0 ? [a.j[d], r.j[d]] : null, errs: r.errs })) }
      console.log(`  ${same ? 'identique' : 'DIFFÉRENT'}  ${r.name.padEnd(14)} ${r.frames} images, ${Math.round(r.ms / 1000)} s`);
    }
  }
  console.log(fails ? `ÉCHEC : ${fails} écart(s)` : 'vitesse neutre : score, issues, état final et journal identiques à ×¼, ×1, ×4 et en images irrégulières');
  await b.close(); process.exit(fails ? 1 : 0);
})();
