/* FOGLINE — allocation navale par mission (module partagé par le moteur, l'interface et les tests Node).
   Lit le registre produit par gen_naval.py (naval-catalogue.json). Aucune valeur réelle : tout chiffre de jeu est fictif.
   Fonctions principales :
     resolveMissionAllocation(mission)            règles effectives d'une mission (profil hérité et plafonné) ;
     evaluateUnitAvailability(unit, mission)      état d'une classe ou d'une configuration pour la mission ;
     evaluateTaskGroupCompatibility(group, m)     état d'un modèle de groupe ou d'un groupe personnalisé ;
     validateFleetSelection(selection, mission)   contrôle complet d'une composition, avec raisons et alternative ;
     allocateMissionResources(selection, m)       instances de départ : bâtiments, appareils, équipes, stocks ;
     recommendFleet(mission)                      composition recommandée dont la compatibilité est calculée ;
     engagedCount / checkEngage                   plafonds d'appareils et d'équipes engagés en mission.
   Le conteneur « groupe » ne porte ni coût ni ressource : tout est compté bâtiment par bâtiment. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.NAVAL_ALLOC = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const ORDER = { local: 1, regional: 2, extended: 3 };
  const ST = { ADAPTED: 'adapted', OVERSIZED: 'oversized', INCOMPATIBLE: 'incompatible', NOT_ALLOCATED: 'not_allocated', OVER_BUDGET: 'over_budget', MISSING: 'missing_capability', REFERENCE: 'reference', NONE: 'unscoped' };
  const ENGAGED = ['deploying', 'deployed', 'returning', 'recovering'];
  const F = (fr, en) => ({ fr, en });
  const SCOPE_L = { local: F('local', 'local'), regional: F('régional', 'regional'), extended: F('étendu', 'extended') };
  const STATE_L = {
    adapted: F('Disponible et adapté', 'Available and suited'),
    oversized: F('Disponible mais surdimensionné', 'Available but oversized'),
    incompatible: F('Incompatible avec le mandat ou le type de mission', 'Incompatible with the mandate or mission type'),
    not_allocated: F('Non alloué au périmètre', 'Not allocated to the scope'),
    over_budget: F('Hors budget', 'Over budget'),
    missing_capability: F('Capacité indispensable manquante', 'Required capability missing'),
    reference: F('Référence documentaire non déployable', 'Documentary reference, not deployable'),
    unscoped: F('Consultable : choisissez une mission pour évaluer l’allocation', 'Viewable: choose a mission to assess allocation'),
  };
  const fmt = (o, a) => ({ fr: o.fr.replace(/\{(\w)\}/g, (_, k) => a[k] && a[k].fr !== undefined ? a[k].fr : a[k]), en: o.en.replace(/\{(\w)\}/g, (_, k) => a[k] && a[k].en !== undefined ? a[k].en : a[k]) });
  const uniq = a => Array.from(new Set(a));
  const clone = o => JSON.parse(JSON.stringify(o));

  function create(cat) {
    const CL = {}, GR = {};
    cat.classes.forEach(c => CL[c.id] = c);
    cat.taskGroups.forEach(g => GR[g.id] = g);
    const capName = k => cat.capabilities[k] || F(k, k);
    const capList = L => ({ fr: L.map(k => capName(k).fr).join(', '), en: L.map(k => capName(k).en).join(', ') });
    const clsName = id => CL[id] ? F(CL[id].name, CL[id].name) : F(id, id);
    const cfgOf = (c, id) => c && (c.configs.find(k => k.id === id) || null);

    /* ---------- règles effectives ---------- */
    function resolveMissionAllocation(mission) {
      if (!mission) return null;
      const id = typeof mission === 'string' ? mission : mission.id;
      const P = cat.missions[id];
      if (!P) return null;
      const sc = typeof mission === 'object' ? mission : {};
      const scope = P.scopeLevel || 'local', tier = cat.scopes[scope], D = cat.defaults;
      const has = k => Object.prototype.hasOwnProperty.call(P, k);
      const capT = (k, v) => Math.min(tier[k], v === undefined || v === null ? tier[k] : v);
      const hist = has('historicalEnabled') ? P.historicalEnabled.slice() : D.historicalEnabled.slice();
      const allowAero = has('allowAeronaval') ? !!P.allowAeronaval : D.allowAeronaval;
      const okScope = c => c.game && c.game.minScope && ORDER[c.game.minScope] <= ORDER[scope];
      const allowedClasses = has('allowedClasses') ? P.allowedClasses.slice()
        : cat.classes.filter(c => c.status === 'deployable' && okScope(c) && (!c.datedReference || hist.includes(c.id))).map(c => c.id);
      const allowedGroupKinds = has('allowedGroupKinds') ? P.allowedGroupKinds.slice()
        : cat.taskGroups.filter(g => ORDER[g.minScope] <= ORDER[scope] && (g.needs !== 'aeronaval' || allowAero)).map(g => g.kind);
      const lo = Object.assign({}, D.loadout, P.loadout || {});
      const circles = capT('buoysPerMH60R', lo.buoysPerMH60R);
      const turns = sc.turns || P.maxTurns || null;
      return {
        id, missionFamily: P.missionFamily, objectives: P.objectives || [], zone: P.zone || null, theatre: sc.th || P.theatre || null,
        maxTurns: turns, durationSec: turns ? turns * 30 : null, scopeLevel: scope, scopeLabel: SCOPE_L[scope], scopeWhy: P.scopeWhy || null,
        mandate: P.mandate || null, authorizedActions: (P.authorizedActions || []).slice(),
        requiredCapabilities: (has('requiredCapabilities') ? P.requiredCapabilities : D.requiredCapabilities).slice(),
        optionalCapabilities: (has('optionalCapabilities') ? P.optionalCapabilities : D.optionalCapabilities).slice(),
        allowedClasses, allowedConfigurations: Object.assign({}, P.allowedConfigurations || {}), allowedGroupKinds,
        allowedTeamKinds: (has('allowedTeamKinds') ? P.allowedTeamKinds : D.allowedTeamKinds).slice(),
        fleetBudget: capT('fleetBudget', P.fleetBudget), maxShips: capT('maxShips', P.maxShips),
        maxAirborneAssets: capT('maxAirborneAssets', P.maxAirborneAssets), maxDeployedTeams: capT('maxDeployedTeams', P.maxDeployedTeams),
        nominalWeight: P.nominalWeight || tier.nominalWeight,
        loadout: { buoyUnit: lo.buoyUnit, buoysPerMH60R: circles, buoysRealPerMH60R: circles * lo.buoyUnit, shipSpareBuoys: lo.shipSpareBuoys || 0, resupply: lo.resupply || null },
        allowSpecialForces: has('allowSpecialForces') ? !!P.allowSpecialForces : D.allowSpecialForces,
        allowAeronaval: allowAero, aeronavalAllocation: P.aeronavalAllocation || null,
        historicalEnabled: hist, historicalNote: P.historicalNote || null,
        reinforcements: has('reinforcements') ? P.reinforcements : D.reinforcements, escalation: (P.escalation || D.escalation).slice(),
        recommended: P.recommended || null, tier: Object.assign({}, tier),
      };
    }
    const R = m => (m && m.requiredCapabilities && m.allowedClasses ? m : resolveMissionAllocation(m));

    /* ---------- capacités d'une configuration ---------- */
    function configCaps(clsId, cfgId, prof) {
      const c = CL[clsId], k = cfgOf(c, cfgId);
      if (!k) return [];
      let caps = k.caps.slice();
      k.air.forEach(([a]) => { const A = cat.aircraft[a]; if (!A) return; if (A.historical && prof && !prof.historicalEnabled.includes(a)) return; caps = caps.concat(A.caps) });
      return uniq(caps);
    }
    function configAllowed(clsId, cfgId, prof) {
      const c = CL[clsId], k = cfgOf(c, cfgId);
      if (!k) return { ok: false, why: F('Configuration inconnue.', 'Unknown configuration.') };
      if (k.historical && !(prof && (prof.historicalEnabled.includes(clsId + ':' + cfgId) || k.air.some(([a]) => cat.aircraft[a] && cat.aircraft[a].historical && prof.historicalEnabled.includes(a)))))
        return { ok: false, why: F('Configuration historique : la mission ne l’active pas.', 'Historical configuration: the mission does not enable it.') };
      const L = prof && prof.allowedConfigurations[clsId];
      if (L && !L.includes(cfgId)) return { ok: false, why: fmt(F('Configuration non prévue par la mission (autorisée : {a}).', 'Configuration not provided for by the mission (allowed: {a}).'), { a: { fr: L.map(x => (cfgOf(c, x) || { name: F(x, x) }).name.fr).join(', '), en: L.map(x => (cfgOf(c, x) || { name: F(x, x) }).name.en).join(', ') } }) };
      return { ok: true };
    }

    /* ---------- une plateforme ---------- */
    function evaluateUnitAvailability(unit, mission, ctx) {
      const clsId = typeof unit === 'string' ? unit : unit.cls, c = CL[clsId];
      if (!c) return { state: ST.INCOMPATIBLE, reasons: [F('Classe inconnue du registre.', 'Class unknown to the registry.')], configs: [] };
      if (c.status !== 'deployable') return { state: ST.REFERENCE, reasons: [c.restrictions], configs: [] };
      const prof = R(mission);
      const cfgs = c.configs.map(k => ({ id: k.id, name: k.name, caps: configCaps(c.id, k.id, prof), allow: configAllowed(c.id, k.id, prof) }));
      if (!prof) return { state: ST.NONE, reasons: [], configs: cfgs.map(k => ({ id: k.id, ok: !k.allow || k.allow.ok !== false, caps: k.caps })) };
      const want = prof.requiredCapabilities.concat(prof.optionalCapabilities);
      const pick = typeof unit === 'object' && unit.cfg ? cfgs.filter(k => k.id === unit.cfg) : cfgs.filter(k => k.allow.ok);
      const res = (state, reasons, extra) => Object.assign({ state, reasons, cost: c.game.cost, weight: c.game.weight, configs: cfgs.map(k => ({ id: k.id, ok: k.allow.ok, why: k.allow.why || null, caps: k.caps, useful: k.caps.filter(x => want.includes(x)) })) }, extra || {});
      if (ORDER[c.game.minScope] > ORDER[prof.scopeLevel]) return res(ST.NOT_ALLOCATED, [fmt(F('Réservé à un périmètre {a} ; la mission est {b}.', 'Reserved for an {a} scope; the mission is {b}.'), { a: SCOPE_L[c.game.minScope], b: prof.scopeLabel })]);
      if (c.datedReference && !prof.historicalEnabled.includes(c.id)) return res(ST.NOT_ALLOCATED, [F('Référence datée : le scénario ne l’active pas.', 'Dated reference: the scenario does not enable it.')]);
      if (!prof.allowedClasses.includes(c.id)) return res(ST.NOT_ALLOCATED, [F('Classe non allouée au périmètre de cette mission.', 'Class not allocated to this mission’s scope.')]);
      if (!pick.length) return res(ST.INCOMPATIBLE, [typeof unit === 'object' && unit.cfg ? F('Configuration inconnue.', 'Unknown configuration.') : F('Aucune configuration autorisée par la mission.', 'No configuration allowed by the mission.')]);
      if (typeof unit === 'object' && unit.cfg && !pick[0].allow.ok) return res(ST.INCOMPATIBLE, [pick[0].allow.why]);
      const caps = uniq([].concat(...pick.map(k => k.caps)));
      if (caps.includes('aeronaval') && !prof.allowAeronaval) return res(ST.INCOMPATIBLE, [F('Le mandat ne prévoit aucune allocation aéronavale.', 'The mandate makes no carrier-aviation allocation.')]);
      if (caps.includes('sof_support') && !caps.some(x => x !== 'sof_support' && want.includes(x)) && !prof.allowSpecialForces) return res(ST.INCOMPATIBLE, [F('Soutien spécial sans détachement spécial prévu par la mission.', 'Special support without a special detachment provided by the mission.')]);
      const useful = caps.filter(x => want.includes(x));
      if (!useful.length) return res(ST.INCOMPATIBLE, [F('N’apporte aucune capacité utile à cette mission.', 'Brings no capability useful to this mission.')]);
      const budget = ctx && ctx.remainingBudget !== undefined ? ctx.remainingBudget : prof.fleetBudget;
      if (c.game.cost > budget) return res(ST.OVER_BUDGET, [fmt(F('Coût {a} points pour {b} disponibles.', 'Costs {a} points for {b} available.'), { a: c.game.cost, b: budget })], { useful });
      if (c.game.weight > prof.nominalWeight) return res(ST.OVERSIZED, [fmt(F('Plateforme lourde pour un périmètre {a} : à justifier par l’objectif.', 'Heavy platform for a {a} scope: to be justified by the objective.'), { a: prof.scopeLabel })], { useful });
      return res(ST.ADAPTED, [fmt(F('Apporte : {a}.', 'Brings: {a}.'), { a: capList(useful) })], { useful });
    }

    /* ---------- un groupe (modèle ou personnalisé) ---------- */
    function groupMembers(group) {
      if (typeof group === 'string') group = GR[group];
      if (!group) return null;
      return group.members.map(m => ({ cls: m.cls, cfg: m.cfg || (CL[m.cls] && CL[m.cls].configs[0] ? CL[m.cls].configs[0].id : null) }));
    }
    function evaluateTaskGroupCompatibility(group, mission) {
      const G = typeof group === 'string' ? GR[group] : group;
      if (!G) return { state: ST.INCOMPATIBLE, reasons: [F('Groupe inconnu.', 'Unknown group.')] };
      const prof = R(mission), mem = groupMembers(G);
      const cost = mem.reduce((a, m) => a + ((CL[m.cls] && CL[m.cls].game.cost) || 0), 0);
      const weight = Math.max(...mem.map(m => (CL[m.cls] && CL[m.cls].game.weight) || 1));
      const caps = uniq([].concat(...mem.map(m => configCaps(m.cls, m.cfg, prof))));
      const base = { cost, weight, caps, ships: mem.length, members: mem };
      if (!prof) return Object.assign(base, { state: ST.NONE, reasons: [] });
      const out = (state, reasons) => Object.assign(base, { state, reasons, missing: prof.requiredCapabilities.filter(x => !caps.includes(x)) });
      if (G.kind && G.kind !== 'custom' && !prof.allowedGroupKinds.includes(G.kind)) {
        if (ORDER[G.minScope] > ORDER[prof.scopeLevel]) return out(ST.NOT_ALLOCATED, [fmt(F('Groupe réservé à un périmètre {a} ; la mission est {b}.', 'Group reserved for an {a} scope; the mission is {b}.'), { a: SCOPE_L[G.minScope], b: prof.scopeLabel })]);
        if (G.needs === 'aeronaval' && !prof.allowAeronaval) return out(ST.INCOMPATIBLE, [F('Le mandat ne prévoit aucune allocation aéronavale.', 'The mandate makes no carrier-aviation allocation.')]);
        return out(ST.NOT_ALLOCATED, [F('Ce type de groupe n’est pas prévu par la mission.', 'This group type is not provided for by the mission.')]);
      }
      const v = validateFleetSelection({ ships: mem }, prof);
      const pr = e => v.errors.filter(x => x.kind === e).map(x => x.msg);
      if (pr('reference').length) return out(ST.REFERENCE, pr('reference'));
      if (pr('not_allocated').length) return out(ST.NOT_ALLOCATED, pr('not_allocated'));
      if (pr('incompatible').length) return out(ST.INCOMPATIBLE, pr('incompatible'));
      if (pr('budget').length) return out(ST.OVER_BUDGET, pr('budget'));
      if (pr('missing').length) return out(ST.MISSING, pr('missing'));
      if (weight > prof.nominalWeight) return out(ST.OVERSIZED, [fmt(F('Groupe lourd pour un périmètre {a} : autorisé, mais au-delà du besoin indispensable.', 'Heavy group for a {a} scope: allowed, but beyond the essential need.'), { a: prof.scopeLabel })]);
      return out(ST.ADAPTED, [fmt(F('Couvre : {a}.', 'Covers: {a}.'), { a: capList(prof.requiredCapabilities) })]);
    }
    function compatibleMissions(group) {
      return Object.keys(cat.missions).map(id => ({ id, ev: evaluateTaskGroupCompatibility(group, id) }));
    }

    /* ---------- une composition complète ---------- */
    function normSel(selection) {
      const L = Array.isArray(selection) ? selection : (selection && selection.ships) || [];
      return L.map(s => ({ cls: s.cls, cfg: s.cfg || (CL[s.cls] && CL[s.cls].configs[0] ? CL[s.cls].configs[0].id : null), id: s.id || null }));
    }
    function validateFleetSelection(selection, mission) {
      const prof = R(mission), ships = normSel(selection), errors = [], warnings = [];
      const err = (kind, msg, i) => errors.push({ kind, msg, index: i });
      if (!prof) return { ok: true, errors, warnings, caps: [], cost: 0, ships: ships.length, legacy: true };
      if (!ships.length) err('missing', F('Aucun bâtiment sélectionné.', 'No ship selected.'));
      let cost = 0;
      ships.forEach((s, i) => {
        const c = CL[s.cls];
        if (!c) { err('incompatible', fmt(F('Bâtiment {a} : classe inconnue.', 'Ship {a}: unknown class.'), { a: i + 1 }), i); return }
        if (c.status !== 'deployable') { err('reference', fmt(F('{a} : référence documentaire non déployable.', '{a}: documentary reference, not deployable.'), { a: c.name }), i); return }
        cost += c.game.cost;
        const ev = evaluateUnitAvailability({ cls: s.cls, cfg: s.cfg }, prof, { remainingBudget: Infinity });
        const pre = m => fmt(F('{a} : {b}', '{a}: {b}'), { a: c.name, b: m });
        if (ev.state === ST.NOT_ALLOCATED) err('not_allocated', pre(ev.reasons[0]), i);
        else if (ev.state === ST.INCOMPATIBLE) err('incompatible', pre(ev.reasons[0]), i);
        else if (ev.state === ST.OVERSIZED) warnings.push({ kind: 'oversized', msg: pre(ev.reasons[0]), index: i });
      });
      if (cost > prof.fleetBudget) err('budget', fmt(F('Coût total {a} points pour un budget de {b}.', 'Total cost {a} points for a budget of {b}.'), { a: cost, b: prof.fleetBudget }));
      if (ships.length > prof.maxShips) err('budget', fmt(F('{a} bâtiments pour {b} au maximum.', '{a} ships for {b} at most.'), { a: ships.length, b: prof.maxShips }));
      const caps = uniq([].concat(...ships.filter(s => CL[s.cls] && CL[s.cls].status === 'deployable' && configAllowed(s.cls, s.cfg, prof).ok).map(s => configCaps(s.cls, s.cfg, prof))));
      const missing = prof.requiredCapabilities.filter(x => !caps.includes(x));
      if (missing.length) err('missing', fmt(F('Capacité indispensable manquante : {a}.', 'Required capability missing: {a}.'), { a: capList(missing) }));
      if (caps.includes('aeronaval') && !prof.allowAeronaval) err('incompatible', F('Groupe aéronaval sans allocation aéronavale explicite.', 'Carrier group without an explicit carrier-aviation allocation.'));
      const optMissing = prof.optionalCapabilities.filter(x => !caps.includes(x));
      const out = { ok: !errors.length, errors, warnings, caps, missing, optMissing, cost, ships: ships.length, budget: prof.fleetBudget, maxShips: prof.maxShips };
      if (!out.ok) out.alternative = proposeAlternative(ships, prof);
      return out;
    }

    /* ---------- recherche d'une composition valide ---------- */
    function candidates(prof) {
      const want = prof.requiredCapabilities.concat(prof.optionalCapabilities), L = [];
      prof.allowedClasses.forEach(id => {
        const c = CL[id];
        if (!c || c.status !== 'deployable') return;
        c.configs.forEach(k => {
          const ev = evaluateUnitAvailability({ cls: id, cfg: k.id }, prof, { remainingBudget: Infinity });
          if (ev.state !== ST.ADAPTED && ev.state !== ST.OVERSIZED) return;
          const caps = configCaps(id, k.id, prof);
          if (!caps.some(x => want.includes(x))) return;
          L.push({ cls: id, cfg: k.id, cost: c.game.cost, weight: c.game.weight, caps });
        });
      });
      return L;
    }
    function search(prof, fixed) {
      const C = candidates(prof), req = prof.requiredCapabilities, opt = prof.optionalCapabilities;
      let best = null;
      const score = sel => {
        const caps = uniq([].concat(...sel.map(s => s.caps)));
        if (req.some(x => !caps.includes(x))) return null;
        const cost = sel.reduce((a, s) => a + s.cost, 0), over = sel.reduce((a, s) => a + Math.max(0, s.weight - prof.nominalWeight), 0);
        return [over, cost, -opt.filter(x => caps.includes(x)).length, sel.length];
      };
      const better = (a, b) => { for (let i = 0; i < a.length; i++) { if (a[i] !== b[i]) return a[i] < b[i] } return false };
      const base = (fixed || []).map(s => C.find(x => x.cls === s.cls && x.cfg === s.cfg)).filter(Boolean);
      const baseCost = base.reduce((a, s) => a + s.cost, 0);
      (function dfs(start, sel, cost) {
        const all = base.concat(sel);
        if (all.length) { const sc = score(all); if (sc && (!best || better(sc, best.sc))) best = { sel: all.slice(), sc } }
        if (all.length >= prof.maxShips) return;
        for (let i = start; i < C.length; i++) { if (baseCost + cost + C[i].cost > prof.fleetBudget) continue; sel.push(C[i]); dfs(i, sel, cost + C[i].cost); sel.pop() }
      })(0, [], 0);
      return best ? best.sel.map(s => ({ cls: s.cls, cfg: s.cfg })) : null;
    }
    function proposeAlternative(ships, prof) {
      const keep = ships.filter(s => { const ev = evaluateUnitAvailability({ cls: s.cls, cfg: s.cfg }, prof, { remainingBudget: Infinity }); return ev.state === ST.ADAPTED || ev.state === ST.OVERSIZED });
      let sel = keep.length ? search(prof, keep.slice(0, prof.maxShips)) : null;
      if (sel && validateFleetSelectionQuiet(sel, prof)) return { ships: sel, why: F('Conserve vos bâtiments compatibles et complète les capacités manquantes au moindre coût.', 'Keeps your compatible ships and fills the missing capabilities at the lowest cost.') };
      const r = recommendFleet(prof);
      return r ? { ships: r.ships, why: r.why } : null;
    }
    function validateFleetSelectionQuiet(sel, prof) {
      const caps = uniq([].concat(...sel.map(s => configCaps(s.cls, s.cfg, prof))));
      const cost = sel.reduce((a, s) => a + CL[s.cls].game.cost, 0);
      return cost <= prof.fleetBudget && sel.length <= prof.maxShips && prof.requiredCapabilities.every(x => caps.includes(x)) && sel.every(s => { const e = evaluateUnitAvailability(s, prof, { remainingBudget: Infinity }).state; return e === ST.ADAPTED || e === ST.OVERSIZED });
    }
    function recommendFleet(mission) {
      const prof = R(mission);
      if (!prof) return null;
      const r = prof.recommended;
      if (r) {
        const ships = r.group ? groupMembers(r.group) : normSel(r.ships || []);
        if (ships && validateFleetSelectionQuiet(ships, prof)) return { ships, group: r.group || null, why: r.why, source: 'profile' };
      }
      const s = search(prof, []);
      return s ? { ships: s, group: null, why: F('Composition calculée : toutes les capacités indispensables au moindre coût, sans plateforme lourde inutile.', 'Computed composition: all required capabilities at the lowest cost, without needless heavy platforms.'), source: 'computed' } : null;
    }

    /* ---------- instances de départ ---------- */
    function idCode(c) { return c.idCode || String(c.hull).replace(/^T-/, '') }
    function allocateMissionResources(selection, mission, opts) {
      const prof = R(mission), v = validateFleetSelection(selection, prof);
      if (prof && !v.ok && !(opts && opts.force)) return { ok: false, errors: v.errors, alternative: v.alternative };
      const ships = normSel(selection), n = {}, out = [];
      const lo = prof ? prof.loadout : cat.defaults.loadout;
      ships.forEach(s => {
        const c = CL[s.cls], k = cfgOf(c, s.cfg), code = idCode(c);
        n[code] = (n[code] || 0) + 1;
        const id = s.id || code + '-' + n[code];
        let h = 0, d = 0;
        const air = [];
        k.air.forEach(([a, cnt]) => {
          const A = cat.aircraft[a];
          if (A.historical && prof && !prof.historicalEnabled.includes(a) && !k.historical) return;
          for (let i = 0; i < cnt; i++) {
            const isD = a === 'mq8', aid = id + '-' + (isD ? 'D' + (++d) : 'H' + (++h));
            const buoys = A.buoys ? Math.min(25, prof ? prof.loadout.buoysRealPerMH60R : 6 * 4) : 0;
            air.push({ id: aid, kind: a, buoys, buoys0: buoys, torp: A.torp || 0, st: 'aboard', readyAt: 0 });
          }
        });
        let t = 0;
        const teams = [];
        k.teams.forEach(([tk, cnt]) => {
          if (prof && !prof.allowedTeamKinds.includes(tk)) return;
          for (let i = 0; i < cnt; i++) teams.push({ id: id + '-T' + (++t), kind: tk, n: cat.teams[tk].n, st: 'aboard', carrier: id });
        });
        const spare = c.game.spareBuoys && prof ? Math.min(c.game.spareBuoys, lo.shipSpareBuoys || 0) : 0;
        out.push({ id, cls: c.id, cfg: k.id, ut: c.engine.ut, base: c.engine.base, hull: c.hull, caps: configCaps(c.id, k.id, prof), air, teams, stock: { spareBuoys: spare, spareBuoys0: spare }, cost: c.game.cost });
      });
      const aero = prof && prof.allowAeronaval && out.some(s => s.caps.includes('aeronaval'));
      return {
        ok: true, ships: out, cost: out.reduce((a, s) => a + s.cost, 0),
        limits: prof ? { maxAirborneAssets: prof.maxAirborneAssets, maxDeployedTeams: prof.maxDeployedTeams, buoysPerMH60R: prof.loadout.buoysPerMH60R, buoyUnit: prof.loadout.buoyUnit } : null,
        extraDeck: aero && prof.aeronavalAllocation ? prof.aeronavalAllocation.deck.slice() : [],
        tension: aero ? 0.3 : 0, sof: prof ? prof.allowSpecialForces : true, warnings: v.warnings || [],
      };
    }

    /* ---------- plafonds en mission ---------- */
    const engagedCount = L => (L || []).filter(x => ENGAGED.includes(x.st)).length;
    function checkEngage(kind, list, limit) {
      if (limit === null || limit === undefined) return { ok: true };
      const e = engagedCount(list);
      if (e >= limit) return { ok: false, engaged: e, limit, why: kind === 'team'
        ? fmt(F('Plafond de la mission : {a} équipe(s) déployée(s) au plus en même temps.', 'Mission ceiling: at most {a} team(s) deployed at once.'), { a: limit })
        : fmt(F('Plafond de la mission : {a} appareil(s) engagé(s) au plus en même temps ; un appareil en récupération compte encore.', 'Mission ceiling: at most {a} aircraft engaged at once; an aircraft being recovered still counts.'), { a: limit }) };
      return { ok: true, engaged: e, limit };
    }

    /* ---------- export ---------- */
    function exportRegistry(mission) {
      const prof = R(mission), o = clone(cat);
      o.exportedFor = prof ? prof.id : null;
      if (prof) {
        o.effectiveProfile = prof;
        o.evaluation = { classes: cat.classes.map(c => ({ id: c.id, state: evaluateUnitAvailability(c.id, prof).state })), taskGroups: cat.taskGroups.map(g => ({ id: g.id, state: evaluateTaskGroupCompatibility(g.id, prof).state })), recommended: recommendFleet(prof) };
      }
      return o;
    }

    return { cat, ST, STATE_L, SCOPE_L, ENGAGED, classOf: id => CL[id], groupOf: id => GR[id], capName, capList, clsName, configCaps, configAllowed, groupMembers,
      resolveMissionAllocation, evaluateUnitAvailability, evaluateTaskGroupCompatibility, compatibleMissions, validateFleetSelection, recommendFleet, allocateMissionResources,
      engagedCount, checkEngage, exportRegistry, fmt };
  }
  return { create, ST, STATE_L };
});
