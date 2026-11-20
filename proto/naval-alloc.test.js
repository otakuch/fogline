// Tests du module d'allocation navale. Usage : node --test naval-alloc.test.js
const test = require('node:test'), assert = require('node:assert/strict');
const cat = require('./naval-catalogue.json'), NA = require('./naval-alloc.js').create(cat);
const MISSIONS = ['c1', 'f2', 'asw', 'l12', 'g3', 'a4', 'e6', 'm6'];
const st = (g, m) => NA.evaluateTaskGroupCompatibility(g, m).state;

test('registre : 26 fiches, 9 groupes, sources résolues, valeurs de jeu marquées fictives', () => {
  assert.equal(cat.classes.length, 26);
  assert.equal(cat.taskGroups.length, 9);
  for (const c of cat.classes) {
    assert.ok(c.public.facts.length >= 1, c.id);
    for (const s of c.public.sources) assert.ok(cat.sources[s], c.id + ' ' + s);
    assert.equal(c.game.fictional, true, c.id);
  }
  const fam = new Set(cat.classes.map(c => c.family));
  for (const f of ['littoral', 'surface', 'carrier', 'amphib', 'sub', 'logistics', 'special', 'program']) assert.ok(fam.has(f), f);
  assert.equal(cat.classes.find(c => c.id === 'constellation').status, 'reference');
});

test('groupe adapté accepté et groupe incompatible refusé', () => {
  assert.equal(st('infra', 'f2'), 'adapted');
  const v = NA.validateFleetSelection(NA.groupMembers('infra'), 'f2');
  assert.equal(v.ok, true);
  assert.equal(st('csg', 'asw'), 'incompatible');
  const w = NA.validateFleetSelection(NA.groupMembers('csg'), 'asw');
  assert.equal(w.ok, false);
  assert.ok(w.errors.some(e => e.kind === 'not_allocated' || e.kind === 'incompatible'));
});

test('même groupe disponible dans un scénario et bloqué dans un autre', () => {
  assert.equal(st('sag', 'l12'), 'adapted');
  assert.equal(st('sag', 'c1'), 'not_allocated');
  assert.equal(st('rescue', 'e6'), 'adapted');
  assert.equal(st('rescue', 'm6'), 'not_allocated');
});

test('groupe aéronaval réservé à une allocation explicite de périmètre étendu', () => {
  assert.equal(st('csg', 'l12'), 'not_allocated'); // régional
  assert.equal(st('csg', 'asw'), 'incompatible'); // étendu, sans allocation aéronavale
  assert.equal(st('csg', 'a4'), 'oversized'); // étendu, allocation explicite : autorisé mais au-delà du besoin
  const r = NA.allocateMissionResources(NA.groupMembers('csg'), 'a4');
  assert.equal(r.ok, true);
  assert.deepEqual(r.extraDeck, ['fighter']);
  assert.equal(r.tension, 0.3);
  const s = NA.allocateMissionResources(NA.groupMembers('sag'), 'a4');
  assert.deepEqual(s.extraDeck, []);
  assert.equal(s.tension, 0);
});

test('budget et plafonds appliqués à chaque niveau de périmètre', () => {
  const want = { local: [6, 2, 1, 1, 8], regional: [10, 3, 2, 2, 16], extended: [20, 5, 3, 3, 24] };
  for (const m of MISSIONS) {
    const p = NA.resolveMissionAllocation(m), w = want[p.scopeLevel];
    assert.deepEqual([p.fleetBudget, p.maxShips, p.maxAirborneAssets, p.maxDeployedTeams, p.loadout.buoysRealPerMH60R], w, m);
  }
  // budget dépassé en local : deux destroyers
  const v = NA.validateFleetSelection([{ cls: 'arleigh_burke' }, { cls: 'arleigh_burke' }], 'c1');
  assert.ok(v.errors.some(e => e.kind === 'budget'));
  // trop de bâtiments en régional
  const x = NA.validateFleetSelection([{ cls: 'lcs_freedom', cfg: 'suw' }, { cls: 'lcs_freedom', cfg: 'suw' }, { cls: 'lcs_independence', cfg: 'suw' }, { cls: 'arleigh_burke' }], 'l12');
  assert.ok(x.errors.some(e => e.kind === 'budget' && /4 bâtiments/.test(e.msg.fr)));
  // une plateforme trop chère pour le budget restant
  assert.equal(NA.evaluateUnitAvailability('arleigh_burke', 'l12', { remainingBudget: 3 }).state, 'over_budget');
});

test('capacité obligatoire manquante détectée, avec une alternative valide', () => {
  assert.equal(st('subobs', 'f2'), 'missing_capability');
  const v = NA.validateFleetSelection([{ cls: 'lcs_freedom', cfg: 'mcm' }], 'l12');
  assert.equal(v.ok, false);
  assert.ok(v.alternative && v.alternative.ships.length);
  assert.equal(NA.validateFleetSelection(v.alternative.ships, 'l12').ok, true);
  const w = NA.validateFleetSelection([{ cls: 'zeus' }], 'm6');
  assert.ok(w.missing.includes('mcm'));
  assert.equal(NA.validateFleetSelection(w.alternative.ships, 'm6').ok, true);
});

test('configuration MCM/SUW prise en compte ; MH-60S sans action acoustique', () => {
  const suw = NA.configCaps('lcs_freedom', 'suw', NA.resolveMissionAllocation('asw'));
  const mcm = NA.configCaps('lcs_freedom', 'mcm', NA.resolveMissionAllocation('m6'));
  assert.ok(suw.includes('asw_helo') && !suw.includes('mcm'));
  assert.ok(mcm.includes('mcm') && !mcm.includes('asw_helo') && mcm.includes('helo_support'));
  assert.equal(NA.evaluateUnitAvailability({ cls: 'lcs_freedom', cfg: 'suw' }, 'm6').state, 'incompatible');
  assert.equal(NA.evaluateUnitAvailability({ cls: 'lcs_independence', cfg: 'mcm' }, 'm6').state, 'adapted');
  const a = NA.allocateMissionResources([{ cls: 'lcs_independence', cfg: 'mcm' }, { cls: 'avenger' }], 'm6');
  const h = a.ships[0].air[0];
  assert.equal(h.kind, 'mh60s');
  assert.equal(h.buoys, 0);
  assert.equal(h.torp, 0);
  // une plateforme polyvalente ne reçoit pas toutes ses configurations à la fois
  const one = NA.validateFleetSelection([{ cls: 'lcs_freedom', cfg: 'mcm' }], 'asw');
  assert.ok(!one.caps.includes('asw_helo'));
});

test('MQ-8 et Avenger : configurations historiques et références datées seulement si le scénario les active', () => {
  assert.equal(NA.configAllowed('lcs_freedom', 'suw_mq8', NA.resolveMissionAllocation('l12')).ok, false);
  assert.equal(NA.evaluateUnitAvailability('avenger', 'f2').state, 'not_allocated');
  assert.equal(NA.evaluateUnitAvailability('avenger', 'm6').state, 'adapted');
  assert.equal(NA.evaluateUnitAvailability('constellation', 'l12').state, 'reference');
});

test('plusieurs bâtiments d’une même classe avec identifiants et stocks distincts', () => {
  const r = NA.allocateMissionResources([{ cls: 'arleigh_burke' }, { cls: 'virginia' }, { cls: 'lcs_freedom', cfg: 'suw' }, { cls: 'lcs_freedom', cfg: 'suw' }, { cls: 'zeus' }], 'asw');
  assert.equal(r.ok, true);
  const ids = r.ships.map(s => s.id);
  assert.deepEqual(ids, ['DDG-1', 'SSN-1', 'LCS-1', 'LCS-2', 'ARC-1']);
  const [a, b] = r.ships.filter(s => s.cls === 'lcs_freedom');
  assert.notEqual(a.air[0].id, b.air[0].id);
  a.air[0].buoys -= 4;
  assert.equal(b.air[0].buoys, 24);
  assert.equal(r.ships[0].air.length, 2);
  assert.equal(r.ships[1].air.length, 0); // sous-marin : aucun appareil
  assert.equal(r.ships[0].teams[0].kind, 'vbss');
  assert.equal(r.cost, 16); // le groupe ne fait disparaître aucun coût
});

test('propriété absente héritée, liste vide = rien autorisé', () => {
  const g3 = NA.resolveMissionAllocation('g3');
  assert.deepEqual(g3.allowedGroupKinds, []);
  for (const g of cat.taskGroups) assert.equal(st(g.id, 'g3'), 'not_allocated', g.id);
  assert.equal(g3.loadout.buoyUnit, 4); // hérité des valeurs par défaut
  assert.equal(g3.allowSpecialForces, true);
  assert.equal(NA.resolveMissionAllocation('l12').allowSpecialForces, false); // hérité
});

test('plafonds en mission : appareils en récupération comptés, équipes limitées', () => {
  const L = [{ st: 'aboard' }, { st: 'recovering' }];
  assert.equal(NA.checkEngage('air', L, 1).ok, false);
  assert.equal(NA.checkEngage('air', [{ st: 'aboard' }], 1).ok, true);
  assert.equal(NA.checkEngage('air', [{ st: 'deploying' }, { st: 'returning' }], 3).ok, true);
  assert.equal(NA.checkEngage('team', [{ st: 'deployed' }], 1).ok, false);
});

test('chaque mission a une composition recommandée réellement valide', () => {
  for (const m of MISSIONS) {
    const r = NA.recommendFleet(m);
    assert.ok(r, m);
    const v = NA.validateFleetSelection(r.ships, m);
    assert.equal(v.ok, true, m + ' ' + JSON.stringify(v.errors));
    assert.ok(r.why.fr && r.why.en);
  }
});

test('export JSON cohérent avec les registres utilisés par le jeu', () => {
  const e = NA.exportRegistry('e6');
  assert.equal(e.classes.length, 26);
  assert.equal(e.taskGroups.length, 9);
  assert.equal(e.effectiveProfile.id, 'e6');
  for (const c of e.evaluation.classes) assert.equal(c.state, NA.evaluateUnitAvailability(c.id, 'e6').state);
  for (const g of e.evaluation.taskGroups) assert.equal(g.state, NA.evaluateTaskGroupCompatibility(g.id, 'e6').state);
  assert.deepEqual(JSON.parse(JSON.stringify(e.classes)), cat.classes);
});

test('allocation refusée pour une composition invalide, sauf forçage explicite', () => {
  const r = NA.allocateMissionResources([{ cls: 'gerald_ford', cfg: 'exercise' }], 'c1');
  assert.equal(r.ok, false);
  assert.ok(r.errors.length);
});
