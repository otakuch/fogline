#!/usr/bin/env python3
"""Fusionne le plan d'ajouts ASW (pack V2.1) dans les cinq catalogues, par identifiant, sans rien remplacer.

Tout reste « planned » et non branché au moteur : ce script ne fait que tenir les contrats à jour.
Usage : python3 tools/bases/merge_asw.py   (relançable : une entrée déjà présente n'est pas dupliquée)
"""
import json, os
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'data', 'bases')
plan = json.load(open(os.path.join(root, 'asw-five-bases-additions.json'), encoding='utf-8'))
files = {'naval': 'db_naval.json', 'air': 'db_aerien.json', 'cyber': 'db_cyber.json', 'ground': 'db_terrestre.json', 'coordination': 'db_coordination.json'}
def merge(lst, add, key='id'):
    have = {x[key] if isinstance(x, dict) else x for x in lst}; n = 0
    for x in add:
        k = x[key] if isinstance(x, dict) else x
        if k not in have: lst.append(x); have.add(k); n += 1
    return n
for dom, f in files.items():
    p = os.path.join(root, f); d = json.load(open(p, encoding='utf-8')); n = merge(d['mechanicDefinitions'], plan['bases'][dom]['mechanicDefinitions'])
    if dom == 'coordination':
        reg = plan['coordinationRegistryAdditions']
        for k in ('handlers', 'events', 'capabilities'): n += merge(d[k], reg.get(k, []))
        d.setdefault('policies', {})['removedRuntimeConcepts'] = plan['removeRuntimeConcepts']
    json.dump(d, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1); print(f, '+', n)
