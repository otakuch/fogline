#!/usr/bin/env python3
"""Registre naval FOGLINE : 26 fiches de classes américaines, 9 modèles de groupes et profils d'allocation des missions.

Écrit proto/naval-catalogue.json, lu par naval-alloc.js (moteur, interface et tests).
Deux natures de données, toujours séparées :
  - `public` : faits publics sur la plateforme, chacun relié à une source de `SOURCES` ;
  - `game` : valeurs fictives d'équilibrage (coûts, vitesses, capteurs, stocks, capacités jouables).
La disponibilité dans FOGLINE est une allocation de scénario : elle ne décrit jamais la disponibilité réelle de la flotte.

Usage : python3 gen_naval.py  (contrôle la cohérence et écrit le fichier)
"""
import json, os

D = os.path.dirname(os.path.abspath(__file__))
CHECKED = '2026-11-20'

# ---------------------------------------------------------------- sources publiques
SOURCES = {
  # reprises du pack FOGLINE_CATALOGUE_US_TASK_GROUPS_V1 (sources.json)
  'navy_index': ('US Navy — Fact Files', 'https://www.navy.mil/resources/fact-files/'),
  'cvn': ('US Navy — Aircraft Carriers', 'https://www.navy.mil/Resources/Fact-Files/Display-FactFiles/Article/2169795/aircraft-carriers-cvn'),
  'lpd': ('US Navy — Amphibious Transport Dock', 'https://www.navy.mil/Resources/Fact-Files/Display-FactFiles/Article/2222713/amphibious-transport-dock-lpd/amphibious-transport-dock-lpd/'),
  'lha': ('US Navy — LHD/LHA', 'https://www.navy.mil/Resources/Fact-Files/Display-FactFiles/Article/2169814/amphibious-assault-ships-lhdlhar/no/amphibious-assault-ships-lhdlhar/'),
  'tripoli': ('US Navy — USS Tripoli, About', 'https://www.surfpac.navy.mil/Warships/USS-Tripoli-LHA-7/About/'),
  'lcs': ('US Navy — Littoral Combat Ship Class', 'https://www.navy.mil/Resources/Fact-Files/Display-FactFiles/Article/2171607/littoral-combat-ship-class-lcs/'),
  'ssn': ('US Navy — Attack Submarines (SSN), mise à jour du 24 novembre 2025', 'https://www.navy.mil/Resources/Fact-Files/Display-FactFiles/Article/2169558/attack-submarines-ssn/'),
  'lcc': ('US Navy — Amphibious Command Ships', 'https://www.navy.mil/DesktopModules/ArticleCS/Print.aspx?Article=2169843&ModuleId=724&PortalId=1'),
  'epf': ('MSC — Expeditionary Fast Transports', 'https://www.msc.usff.navy.mil/Ships/Ship-Inventory/Expeditionary-Fast-Transports/'),
  'esb': ('MSC — Expeditionary Sea Base', 'https://www.msc.usff.navy.mil/Ships/Ship-Inventory/Expeditionary-Sea-Base/'),
  'oiler': ('US Navy — Fleet Replenishment Oilers (T-AO), 16 décembre 2025', 'https://www.navy.mil/Resources/Fact-Files/Display-FactFiles/Article/2222909/fleet-replenishment-oilers-t-ao/'),
  'take': ('MSC — Dry Cargo/Ammunition Ships', 'https://www.msc.usff.navy.mil/Ships/Ship-Inventory/Dry-Cargo-Ammunition-Ships/'),
  'hospital': ('MSC — Hospital Ships', 'https://www.msc.usff.navy.mil/Ships/Ship-Inventory/Hospital-Ships/'),
  'avenger': ('US Navy — Mine Countermeasures Ships (MCM), fiche 2020', 'https://www.navy.mil/Resources/Fact-Files/Display-FactFiles/Article/2171622/mine-countermeasures-ships-mcm/'),
  'avenger_transition': ('USFFC — Retraits de bâtiments Avenger à Bahreïn, septembre 2025', 'https://www.usff.navy.mil/Press-Room/News-Stories/Article/4315186/us-navy-decommissions-avenger-class-mine-countermeasures-ships-in-bahrain/'),
  'mh60r': ('NAVAIR — MH-60R Seahawk', 'https://www.navair.navy.mil/product/MH-60R-Seahawk'),
  'mh60s': ('NAVAIR — MH-60S Seahawk', 'https://www.navair.navy.mil/product/MH-60S-Seahawk'),
  'mq8_reference': ('NAVAIR — PMA-266, références MQ-8C', 'https://www.navair.navy.mil/orgterm/PMA-266'),
  # consultées pour cette version (20 novembre 2026)
  'lcs_suw': ('US Navy — LCS Surface Warfare Mission Package (SSMM, Longbow Hellfire)', 'https://www.navy.mil/Resources/Fact-Files/Display-FactFiles/Article/2220640/littoral-combat-ships-surface-warfare-mission-package'),
  'lcs_ssmm': ('NAVSEA — Tir structurel du SSMM sur un LCS Independence', 'https://www.navsea.navy.mil/Media/News/Article/1916979/successful-structural-test-firing-of-the-lcs-surface-to-surface-missile-module/'),
  'lcs_dote19': ('DOT&E — Rapport LCS FY2019 (NSM retenu comme arme de bord, distincte des modules)', 'https://www.dote.osd.mil/Portals/97/pub/reports/FY2019/navy/2019lcs.pdf'),
  'lcs_dote16': ('DOT&E — Rapport LCS FY2016 (RAM remplacé par SeaRAM sur les Freedom à partir de LCS 17)', 'https://www.dote.osd.mil/Portals/97/pub/reports/FY2016/navy/2016lcs.pdf'),
  'lcs_dote25': ('DOT&E — Rapport LCS FY2025 (module ASW abandonné en FY22)', 'https://www.dote.osd.mil/Portals/97/pub/reports/FY2025/navy/2025lcs.pdf'),
  'ram': ('US Navy — RIM-116 RAM (Mk 49 et SeaRAM sur LCS)', 'https://www.navy.mil/Resources/Fact-Files/Display-FactFiles/Article/2168961/rim-116-rolling-airframe-missile-ram/'),
  'searam_lcs4': ('US Navy — LCS Independence, essais avec SeaRAM (2016)', 'https://www.navy.mil/Press-Office/Press-Releases/display-pressreleases/Article/2257260/independence-variant-lcs-completes-iote/'),
  'mq8_retire': ('The Aviationist — Retrait des MQ-8C par la Navy d’ici la fin de l’exercice 2026 (27 octobre 2026)', 'https://theaviationist.com/2026/10/27/mq-8c-fire-scout-second-life-with-u-s-army/'),
  'cg': ('US Navy — Cruisers (CG), mise à jour du 23 avril 2025', 'https://www.navy.mil/Resources/Fact-Files/Display-FactFiles/Article/2169861/cruisers-cg'),
  'cg_retire': ('Baird Maritime — Retrait de deux croiseurs en septembre 2026, cinq encore en service', 'https://www.bairdmaritime.com/security/naval/naval-ships/navy-retires-two-ticonderoga-cruisers'),
  'lsd': ('US Navy — Dock Landing Ship (LSD), mise à jour du 19 juillet 2019', 'https://www.navy.mil/Resources/Fact-Files/Display-FactFiles/Article/2169901/dock-landing-ship-lsd/'),
  'ssgn': ('US Navy — Guided Missile Submarines (SSGN), mise à jour du 15 novembre 2023', 'https://www.navy.mil/Resources/Fact-Files/Display-FactFiles/Article/2169613/guided-missile-submarines-ssgn/'),
  'tarc': ('US Navy — Cable Laying/Repair Ship (T-ARC), mise à jour du 13 octobre 2021', 'https://www.navy.mil/Resources/Fact-Files/Display-FactFiles/Article/2232652/cable-layingrepair-ship-t-arc/'),
  'tags': ('US Navy — Oceanographic Survey Ships (T-AGS), mise à jour du 26 février 2026', 'https://www.navy.mil/Resources/Fact-Files/Display-FactFiles/Article/2222996/oceanographic-survey-ships-t-ags/'),
  'ffg62_cancel': ('USNI News — Abandon du programme Constellation (25 novembre 2025)', 'https://news.usni.org/2025/11/25/navy-cancels-constellation-class-frigate-program-considering-new-small-surface-combatants'),
  'ffg62_crs': ('USNI News — Rapport du CRS sur les frégates Constellation et FF(X) (6 janvier 2026)', 'https://news.usni.org/2026/01/06/report-to-congress-on-the-navys-constellation-ffx-frigate-programs'),
  'kaiser_retire': ('Seapower — Retraits de pétroliers Kaiser en 2026', 'https://seapowermagazine.org/?p=34239'),
}

def F(fr, en): return {'fr': fr, 'en': en}

# ---------------------------------------------------------------- capacités jouables (fictives)
CAPS = {
  'surface_presence': F('Présence et surveillance de surface', 'Surface presence and surveillance'),
  'escort': F('Escorte proportionnée', 'Proportionate escort'),
  'boarding': F('Visite et contrôle', 'Visit and inspection'),
  'air_defense': F('Protection aérienne', 'Air protection'),
  'sonar': F('Observation acoustique de bord', 'Shipborne acoustic observation'),
  'underwater_obs': F('Observation sous-marine', 'Underwater observation'),
  'torpedo': F('Torpilles de jeu', 'Game torpedoes'),
  'asw_helo': F('Hélicoptère acoustique équipé (MH-60R)', 'Equipped acoustic helicopter (MH-60R)'),
  'helo_support': F('Hélicoptère de soutien (MH-60S)', 'Support helicopter (MH-60S)'),
  'uav_obs': F('Drone embarqué d’observation', 'Embarked observation drone'),
  'mcm': F('Lutte contre les mines', 'Mine countermeasures'),
  'seabed_survey': F('Relevés des fonds', 'Seabed survey'),
  'cable_repair': F('Expertise et réparation de câbles', 'Cable expertise and repair'),
  'lift': F('Transport de personnes et de matériel', 'Personnel and materiel lift'),
  'medical': F('Soutien médical', 'Medical support'),
  'aviation_hub': F('Accueil aérien étendu', 'Extended aviation deck'),
  'aeronaval': F('Coordination aéronavale', 'Carrier aviation coordination'),
  'c2': F('Commandement et continuité des liaisons', 'Command and link continuity'),
  'logistics': F('Ravitaillement à la mer', 'Replenishment at sea'),
  'sof_support': F('Soutien d’un détachement spécial', 'Special detachment support'),
}

FAMILIES = {
  'littoral': F('Combat littoral', 'Littoral combat'),
  'surface': F('Escorte de surface', 'Surface escort'),
  'carrier': F('Porte-avions', 'Aircraft carriers'),
  'amphib': F('Amphibies', 'Amphibious'),
  'sub': F('Sous-marins', 'Submarines'),
  'logistics': F('Logistique', 'Logistics'),
  'special': F('Missions spécialisées', 'Special missions'),
  'program': F('Référence de programme', 'Programme reference'),
}

# ---------------------------------------------------------------- appareils et équipes (archétypes de jeu)
AIR = {
  'mh60r': {'name': 'MH-60R', 'label': F('Hélicoptère MH-60R équipé', 'Equipped MH-60R helicopter'), 'caps': ['asw_helo', 'surface_presence'], 'buoys': True, 'torp': 2, 'speed': 30, 'fuel': 90, 'carry': 1, 'src': ['mh60r'],
            'note': F('Bouées et torpilles de jeu limitées par le profil de mission.', 'Buoys and game torpedoes limited by the mission profile.')},
  'mh60s': {'name': 'MH-60S', 'label': F('Hélicoptère de soutien MH-60S', 'MH-60S support helicopter'), 'caps': ['helo_support'], 'buoys': False, 'torp': 0, 'speed': 30, 'fuel': 90, 'carry': 1, 'src': ['mh60s'],
            'note': F('Profil de soutien : aucune bouée, aucune action acoustique.', 'Support profile: no buoys, no acoustic action.')},
  'mq8': {'name': 'MQ-8', 'label': F('Drone MQ-8 (configuration historique)', 'MQ-8 drone (historical configuration)'), 'caps': ['uav_obs'], 'buoys': False, 'torp': 0, 'speed': 22, 'fuel': 120, 'carry': 0, 'historical': True, 'src': ['mq8_reference', 'mq8_retire'],
          'note': F('Retiré du service de la Navy d’ici la fin de l’exercice 2026 : seulement dans un scénario qui l’active.', 'Retired from Navy service by the end of fiscal 2026: only in a scenario that enables it.')},
}
TEAMS = {
  'vbss': {'label': F('Équipe de visite', 'Visit team'), 'n': 4, 'caps': ['boarding']},
  'tech': {'label': F('Équipe technique', 'Technical team'), 'n': 4, 'caps': ['cable_repair', 'seabed_survey']},
  'med': {'label': F('Équipe médicale', 'Medical team'), 'n': 4, 'caps': ['medical']},
  'amph': {'label': F('Détachement amphibie', 'Amphibious detachment'), 'n': 4, 'caps': ['lift']},
}
TEAM_NOTE = F('Archétypes de jeu de quatre personnes, sans effectif doctrinal réel.', 'Four-person game archetypes, with no real doctrinal strength.')

# ---------------------------------------------------------------- 26 fiches
def cls(id, family, name, hull, ut, base, role, public, srcs, game, configs, restrict, status='deployable', reconstructed=False, extra=None):
    d = {'id': id, 'family': family, 'name': name, 'hull': hull, 'status': status, 'reconstructed': reconstructed,
         'engine': {'ut': ut, 'base': base}, 'role': role, 'public': {'facts': public, 'sources': srcs},
         'game': game, 'configs': configs, 'restrictions': restrict}
    if extra: d.update(extra)
    return d

def G(cost, weight, speed, sensor, defense=0, ssm=0, torp=0, scope='local', sub=False, spare=0):
    return {'cost': cost, 'weight': weight, 'speed': speed, 'sensor': sensor, 'def': defense, 'ssm': ssm, 'torp': torp, 'minScope': scope, 'sub': sub, 'spareBuoys': spare, 'fictional': True}

def C(id, name, caps, air=(), teams=(), note=None, historical=False):
    return {'id': id, 'name': name, 'caps': list(caps), 'air': [list(a) for a in air], 'teams': [list(t) for t in teams], 'note': note, 'historical': historical}

CLASSES = [
  cls('lcs_freedom', 'littoral', 'LCS Freedom', 'LCS', 'patrol', 'patrol',
      F('Navire de combat littoral monocoque, configuré par module de mission.', 'Monohull littoral combat ship, configured by mission package.'),
      [F('Variante Freedom : monocoque en acier, coques à numéro impair.', 'Freedom variant: steel monohull, odd-numbered hulls.'),
       F('Module de surface (SUW) : module SSMM à missiles Longbow Hellfire, distinct du missile NSM installé comme arme de bord.', 'Surface (SUW) package: SSMM module with Longbow Hellfire missiles, distinct from the NSM installed as a ship weapon.'),
       F('Défense rapprochée RAM ou SeaRAM selon le bâtiment : le SeaRAM remplace le RAM à partir de LCS 17.', 'Close-in defence RAM or SeaRAM depending on the ship: SeaRAM replaces RAM from LCS 17 onward.'),
       F('Module de lutte contre les mines (MCM) distinct ; le module anti-sous-marin a été abandonné en FY22.', 'Separate mine countermeasures (MCM) package; the anti-submarine package was dropped in FY22.')],
      ['lcs', 'lcs_suw', 'lcs_dote19', 'lcs_dote16', 'ram', 'lcs_dote25'],
      G(3, 1, 20, 55, 5, 2, 0),
      [C('suw', F('Surface (SUW)', 'Surface (SUW)'), ['surface_presence', 'escort', 'boarding'], [('mh60r', 1)], [('vbss', 1)], F('MH-60R équipé ; capacités de surface seulement.', 'Equipped MH-60R; surface capabilities only.')),
       C('mcm', F('Lutte contre les mines (MCM)', 'Mine countermeasures (MCM)'), ['surface_presence', 'mcm', 'seabed_survey'], [('mh60s', 1)], [], F('MH-60S de soutien : aucune action acoustique ni bouée.', 'MH-60S support helicopter: no acoustic action or buoy.')),
       C('suw_mq8', F('Surface avec MQ-8 (historique)', 'Surface with MQ-8 (historical)'), ['surface_presence', 'escort', 'boarding', 'uav_obs'], [('mh60r', 1), ('mq8', 1)], [('vbss', 1)], F('Configuration historique : un hélicoptère et un drone de scénario.', 'Historical configuration: one helicopter and one scenario drone.'), True)],
      F('Une seule configuration à la fois. En MCM, pas de capacité de surface d’escorte ni d’hélicoptère acoustique.', 'One configuration at a time. In MCM, no escort surface capability and no acoustic helicopter.')),
  cls('lcs_independence', 'littoral', 'LCS Independence', 'LCS', 'lcsi', 'patrol',
      F('Navire de combat littoral trimaran, à grand pont d’envol, configuré par module.', 'Trimaran littoral combat ship with a large flight deck, configured by package.'),
      [F('Variante Independence : trimaran en aluminium, coques à numéro pair.', 'Independence variant: aluminium trimaran, even-numbered hulls.'),
       F('Défense rapprochée SeaRAM.', 'SeaRAM close-in defence.'),
       F('Module SSMM à Longbow Hellfire essayé sur cette variante après la Freedom ; NSM distinct.', 'SSMM Longbow Hellfire module tested on this variant after Freedom; NSM is separate.')],
      ['lcs', 'searam_lcs4', 'lcs_ssmm', 'lcs_dote19', 'lcs_dote25'],
      G(3, 1, 22, 55, 5, 2, 0),
      [C('suw', F('Surface (SUW)', 'Surface (SUW)'), ['surface_presence', 'escort', 'boarding'], [('mh60r', 1)], [('vbss', 1)], F('MH-60R équipé.', 'Equipped MH-60R.')),
       C('mcm', F('Lutte contre les mines (MCM)', 'Mine countermeasures (MCM)'), ['surface_presence', 'mcm', 'seabed_survey'], [('mh60s', 1)], [], F('MH-60S de soutien, sans bouées.', 'MH-60S support helicopter, no buoys.')),
       C('suw_mq8', F('Surface avec MQ-8 (historique)', 'Surface with MQ-8 (historical)'), ['surface_presence', 'escort', 'boarding', 'uav_obs'], [('mh60r', 1), ('mq8', 2)], [('vbss', 1)], F('Configuration historique : un hélicoptère et deux drones de scénario.', 'Historical configuration: one helicopter and two scenario drones.'), True)],
      F('Mêmes restrictions que la Freedom ; vitesse de jeu légèrement supérieure.', 'Same restrictions as Freedom; slightly higher game speed.')),
  cls('arleigh_burke', 'surface', 'Arleigh Burke Flight IIA/III', 'DDG', 'frigate', 'frigate',
      F('Destroyer lance-missiles polyvalent : escorte et protection aérienne.', 'Multi-mission guided-missile destroyer: escort and air protection.'),
      [F('Classe de destroyers lance-missiles de la Navy ; les Flight IIA et III embarquent des hélicoptères.', 'Navy guided-missile destroyer class; Flight IIA and III embark helicopters.')],
      ['navy_index'],
      G(4, 2, 16, 85, 10, 4, 4, 'local'),
      [C('std', F('Escorte', 'Escort'), ['surface_presence', 'escort', 'boarding', 'air_defense', 'sonar', 'torpedo'], [('mh60r', 2)], [('vbss', 1)], F('Deux MH-60R, comme dans la V1.', 'Two MH-60R, as in V1.'))],
      F('Escorte et protection seulement selon le mandat ; aucun appui contre la terre.', 'Escort and protection only under the mandate; no land attack.')),
  cls('zumwalt', 'surface', 'Zumwalt', 'DDG', 'ddg1000', 'frigate',
      F('Destroyer de grande taille, série courte de trois bâtiments.', 'Large destroyer, short series of three ships.'),
      [F('Classe de trois destroyers ; le programme a été arrêté après trois unités.', 'Class of three destroyers; the programme stopped after three ships.')],
      ['navy_index'],
      G(5, 2, 17, 80, 6, 3, 0, 'regional'),
      [C('std', F('Surface', 'Surface'), ['surface_presence', 'escort', 'sonar'], [('mh60r', 1)], [], F('Un MH-60R de scénario.', 'One scenario MH-60R.'))],
      F('Effets abstraits seulement ; aucune dotation universelle déduite.', 'Abstract effects only; no universal loadout inferred.')),
  cls('ticonderoga', 'surface', 'Ticonderoga', 'CG', 'cg', 'frigate',
      F('Croiseur lance-missiles, en fin de retrait du service.', 'Guided-missile cruiser, being retired.'),
      [F('Grand bâtiment de combat de surface polyvalent.', 'Large multi-mission surface combatant.'),
       F('Cinq croiseurs restaient en service après deux retraits en septembre 2026.', 'Five cruisers remained in service after two retirements in September 2026.')],
      ['cg', 'cg_retire'],
      G(4, 2, 16, 88, 10, 4, 4, 'regional'),
      [C('std', F('Escorte et commandement de zone', 'Escort and area command'), ['surface_presence', 'escort', 'air_defense', 'sonar', 'torpedo', 'c2'], [('mh60r', 2)], [], F('Deux MH-60R de scénario.', 'Two scenario MH-60R.'))],
      F('Classe en retrait : ne présume pas qu’un bâtiment réel est disponible.', 'Class being retired: do not assume a real ship is available.'), reconstructed=True),
  cls('gerald_ford', 'carrier', 'Gerald R. Ford', 'CVN', 'cvn', 'ship',
      F('Porte-avions nucléaire ; dans FOGLINE, détachement aérien limité aux moyens explicitement alloués.', 'Nuclear carrier; in FOGLINE the air detachment is limited to explicitly allocated assets.'),
      [F('Classe de porte-avions la plus récente de la Navy.', 'Navy’s newest aircraft carrier class.')],
      ['cvn'],
      G(6, 3, 15, 70, 6, 0, 0, 'extended'),
      [C('exercise', F('Exercice : deux hélicoptères', 'Exercise: two helicopters'), ['surface_presence', 'aeronaval', 'aviation_hub', 'c2'], [('mh60r', 1), ('mh60s', 1)], [], F('Les deux hélicoptères retenus pour l’exercice ; aucun groupe aérien complet.', 'The two helicopters retained for the exercise; no full air wing.'))],
      F('Exige une allocation aéronavale explicite et un périmètre étendu.', 'Requires an explicit carrier-aviation allocation and an extended scope.')),
  cls('nimitz', 'carrier', 'Nimitz', 'CVN', 'cvn68', 'ship',
      F('Porte-avions nucléaire de la classe précédente.', 'Nuclear carrier of the previous class.'),
      [F('Classe de porte-avions nucléaires en service avant la Ford.', 'Nuclear carrier class in service before Ford.')],
      ['cvn'],
      G(6, 3, 15, 68, 6, 0, 0, 'extended'),
      [C('exercise', F('Exercice : deux hélicoptères', 'Exercise: two helicopters'), ['surface_presence', 'aeronaval', 'aviation_hub', 'c2'], [('mh60r', 1), ('mh60s', 1)], [], F('Groupe aérien non simulé ; seuls deux hélicoptères sont alloués.', 'Air wing not simulated; only two helicopters are allocated.'))],
      F('Mêmes conditions que la Ford.', 'Same conditions as Ford.')),
  cls('san_antonio', 'amphib', 'San Antonio', 'LPD', 'lpd', 'ship',
      F('Transport de chalands de débarquement : transport, aviation légère, accueil.', 'Amphibious transport dock: lift, light aviation, reception.'),
      [F('Classe LPD 17 ; les LPD Flight II remplacent les LSD à leur retrait.', 'LPD 17 class; LPD Flight II replaces LSDs as they retire.')],
      ['lpd'],
      G(4, 2, 13, 50, 4, 0, 0, 'local'),
      [C('std', F('Secours et transport', 'Rescue and lift'), ['lift', 'medical', 'surface_presence'], [('mh60s', 2)], [('amph', 2), ('med', 1)], F('Deux MH-60S et deux équipes optionnelles, comme dans la V1.', 'Two MH-60S and two optional teams, as in V1.'))],
      F('Les transports, équipes et places ne sont pas créés par le groupe.', 'Craft, teams and places are not created by the group.')),
  cls('america', 'amphib', 'America (Flight 0)', 'LHA', 'lha', 'ship',
      F('Grand bâtiment d’assaut à pont d’envol, sans radier sur le Flight 0.', 'Large-deck assault ship, without a well deck on Flight 0.'),
      [F('Les America Flight 0 n’ont pas de radier ; ne pas leur prêter les propriétés du Flight 1.', 'America Flight 0 has no well deck; do not give it Flight 1 properties.')],
      ['lha', 'tripoli'],
      G(5, 3, 14, 55, 5, 0, 0, 'regional'),
      [C('std', F('Aviation et transport', 'Aviation and lift'), ['lift', 'medical', 'aviation_hub', 'surface_presence'], [('mh60s', 2)], [('amph', 1), ('med', 1)], F('Hélicoptères alloués explicitement ; pas d’embarcations de radier.', 'Explicitly allocated helicopters; no well-deck craft.'))],
      F('Sans radier : aucune embarcation de radier.', 'No well deck: no well-deck craft.')),
  cls('wasp', 'amphib', 'Wasp', 'LHD', 'lhd', 'ship',
      F('Bâtiment d’assaut amphibie à pont d’envol et radier.', 'Amphibious assault ship with flight deck and well deck.'),
      [F('Classe LHD ; avions, hélicoptères et embarcations sont des entités distinctes.', 'LHD class; aircraft, helicopters and craft are separate entities.')],
      ['lha'],
      G(5, 3, 14, 55, 5, 0, 0, 'regional'),
      [C('std', F('Secours et transport', 'Rescue and lift'), ['lift', 'medical', 'aviation_hub', 'surface_presence'], [('mh60s', 2)], [('amph', 2), ('med', 1)], F('Deux MH-60S de scénario.', 'Two scenario MH-60S.'))],
      F('Groupe important : réservé aux missions dont le mandat prévoit un groupe amphibie.', 'Large unit: reserved for missions whose mandate provides for an amphibious group.')),
  cls('harpers_ferry', 'amphib', 'Harpers Ferry', 'LSD', 'lsd', 'ship',
      F('Bâtiment de débarquement de cargaison, dérivé de la Whidbey Island.', 'Cargo dock landing ship derived from Whidbey Island.'),
      [F('La classe LSD 49 réduit la capacité en aéroglisseurs à deux pour augmenter la cargaison.', 'The LSD 49 class reduces air-cushion craft capacity to two to increase cargo.'),
       F('Les LPD Flight II doivent remplacer ces bâtiments.', 'LPD Flight II is to replace these ships.')],
      ['lsd', 'lpd'],
      G(3, 2, 13, 45, 3, 0, 0, 'regional'),
      [C('std', F('Transport', 'Lift'), ['lift', 'surface_presence'], [], [('amph', 1)], F('Pas d’hélicoptère embarqué dans le profil de jeu.', 'No embarked helicopter in the game profile.'))],
      F('Aucun hélicoptère alloué par défaut.', 'No helicopter allocated by default.'), reconstructed=True),
  cls('virginia', 'sub', 'Virginia', 'SSN', 'ssn', 'ship',
      F('Sous-marin nucléaire d’attaque : observation sous-marine.', 'Nuclear attack submarine: underwater observation.'),
      [F('Classe en construction qui remplace les Los Angeles à leur retrait.', 'Class under construction replacing Los Angeles boats as they retire.')],
      ['ssn'],
      G(4, 2, 15, 78, 0, 0, 6, 'regional', True),
      [C('std', F('Observation sous-marine', 'Underwater observation'), ['underwater_obs', 'sonar', 'torpedo'], [], [], F('Aucun hélicoptère ni drone aérien, comme dans la V1.', 'No helicopter or air drone, as in V1.'))],
      F('Pas de transport amphibie ; ne remplace ni le diagnostic ni l’attribution.', 'No amphibious lift; does not replace diagnosis or attribution.')),
  cls('los_angeles', 'sub', 'Los Angeles', 'SSN', 'ssn688', 'ship',
      F('Sous-marin nucléaire d’attaque de la génération précédente.', 'Previous-generation nuclear attack submarine.'),
      [F('Ancienne colonne vertébrale de la force sous-marine, remplacée par les Virginia.', 'Former backbone of the submarine force, being replaced by Virginia.')],
      ['ssn'],
      G(3, 2, 14, 68, 0, 0, 4, 'regional', True),
      [C('std', F('Observation sous-marine', 'Underwater observation'), ['underwater_obs', 'sonar', 'torpedo'], [], [], None)],
      F('Mêmes restrictions que la Virginia.', 'Same restrictions as Virginia.'), reconstructed=True),
  cls('seawolf', 'sub', 'Seawolf', 'SSN', 'ssn21', 'ship',
      F('Sous-marin nucléaire d’attaque, série de trois unités.', 'Nuclear attack submarine, series of three.'),
      [F('Trois sous-marins ; le troisième porte une section allongée dite plateforme multimission.', 'Three submarines; the third carries a lengthened section called the multi-mission platform.')],
      ['ssn'],
      G(5, 2, 16, 88, 0, 0, 8, 'regional', True),
      [C('std', F('Observation sous-marine', 'Underwater observation'), ['underwater_obs', 'sonar', 'torpedo'], [], [], None)],
      F('Mêmes restrictions que la Virginia.', 'Same restrictions as Virginia.'), reconstructed=True),
  cls('ohio_ssgn', 'sub', 'Ohio SSGN', 'SSGN', 'ssgn', 'ship',
      F('Sous-marin lance-missiles de croisière converti, plateforme de forces spéciales.', 'Converted cruise-missile submarine, special forces platform.'),
      [F('Quatre Ohio convertis en plateformes d’attaque conventionnelle et de forces spéciales.', 'Four Ohio boats converted into conventional strike and special forces platforms.')],
      ['ssgn'],
      G(5, 3, 13, 62, 0, 0, 4, 'extended', True),
      [C('std', F('Observation et soutien spécial', 'Observation and special support'), ['underwater_obs', 'sonar', 'sof_support'], [], [], F('Aucune frappe vers la terre dans FOGLINE.', 'No land strike in FOGLINE.'))],
      F('Soutien spécial seulement si la mission prévoit un détachement spécial. Aucune frappe jouable.', 'Special support only if the mission provides for a special detachment. No playable strike.'), reconstructed=True),
  cls('john_lewis', 'logistics', 'John Lewis', 'T-AO', 'tao205', 'ship',
      F('Pétrolier ravitailleur de nouvelle génération.', 'New-generation replenishment oiler.'),
      [F('Classe de pétroliers ravitailleurs de flotte (T-AO).', 'Fleet replenishment oiler class (T-AO).')],
      ['oiler'],
      G(2, 1, 11, 30, 0, 0, 0, 'local', spare=0),
      [C('std', F('Ravitaillement', 'Replenishment'), ['logistics'], [], [], None)],
      F('Ne constitue pas un porte-hélicoptères ; stocks et créneaux de transfert limités.', 'Not a helicopter carrier; limited stocks and transfer slots.')),
  cls('henry_kaiser', 'logistics', 'Henry J. Kaiser', 'T-AO', 'tao187', 'ship',
      F('Pétrolier ravitailleur de la classe précédente, en cours de retrait.', 'Previous-class replenishment oiler, being retired.'),
      [F('Plusieurs pétroliers Kaiser quittent le service en 2026.', 'Several Kaiser oilers leave service in 2026.')],
      ['oiler', 'kaiser_retire'],
      G(2, 1, 10, 28, 0, 0, 0, 'local'),
      [C('std', F('Ravitaillement', 'Replenishment'), ['logistics'], [], [], None)],
      F('Classe en retrait : allocation de scénario seulement.', 'Class being retired: scenario allocation only.')),
  cls('lewis_clark', 'logistics', 'Lewis and Clark', 'T-AKE', 'take', 'ship',
      F('Ravitailleur de cargaison sèche et de munitions.', 'Dry cargo and ammunition ship.'),
      [F('Soutien logistique de la flotte (MSC).', 'Fleet logistics support (MSC).')],
      ['take'],
      G(3, 1, 11, 30, 0, 0, 0, 'local', spare=12),
      [C('std', F('Réapprovisionnement', 'Resupply'), ['logistics'], [], [], F('Seul moyen de réapprovisionner les bouées : stock fini, transfert explicite.', 'Only means of restocking buoys: finite stock, explicit transfer.'))],
      F('Les lots doivent être réellement transférés.', 'Lots must actually be transferred.')),
  cls('spearhead', 'logistics', 'Spearhead', 'T-EPF', 'epf', 'ship',
      F('Transport rapide expéditionnaire.', 'Expeditionary fast transport.'),
      [F('Transport rapide de personnel et de matériel (MSC).', 'Fast personnel and materiel transport (MSC).')],
      ['epf'],
      G(3, 1, 24, 35, 0, 0, 0, 'local'),
      [C('std', F('Transport rapide', 'Fast lift'), ['lift'], [], [('amph', 1)], None)],
      F('Réception portuaire ou transfert compatible nécessaires.', 'Port reception or a compatible transfer is required.')),
  cls('avenger', 'special', 'Avenger', 'MCM', 'mcm', 'ship',
      F('Chasseur de mines ; référence datée.', 'Mine countermeasures ship; dated reference.'),
      [F('Fiche de 2020 ; des bâtiments précis ont été retirés à Bahreïn en septembre 2025.', '2020 fact file; specific ships were retired in Bahrain in September 2025.')],
      ['avenger', 'avenger_transition'],
      G(2, 1, 8, 30, 0, 0, 0, 'local'),
      [C('std', F('Lutte contre les mines', 'Mine countermeasures'), ['mcm', 'seabed_survey'], [], [], None)],
      F('Désactivé par défaut : seulement si le scénario l’active avec une date explicite.', 'Disabled by default: only if the scenario enables it with an explicit date.'), extra={'datedReference': True}),
  cls('mercy', 'special', 'Mercy', 'T-AH', 'tah', 'ship',
      F('Navire-hôpital.', 'Hospital ship.'),
      [F('Navires-hôpitaux du MSC ; leur disponibilité réelle n’est pas inférée.', 'MSC hospital ships; their real availability is not inferred.')],
      ['hospital'],
      G(4, 2, 10, 30, 0, 0, 0, 'regional'),
      [C('std', F('Accueil médical', 'Medical reception'), ['medical', 'lift'], [], [('med', 2)], F('Places et personnel médical de scénario.', 'Scenario medical places and staff.'))],
      F('Aucune escorte ni protection.', 'No escort or protection.')),
  cls('lewis_puller', 'special', 'Lewis B. Puller', 'ESB', 'esb', 'ship',
      F('Base expéditionnaire en mer.', 'Expeditionary sea base.'),
      [F('Soutien expéditionnaire du MSC.', 'MSC expeditionary support.')],
      ['esb'],
      G(4, 2, 10, 40, 2, 0, 0, 'local'),
      [C('std', F('Base de soutien', 'Support base'), ['sof_support', 'logistics', 'aviation_hub'], [('mh60s', 1)], [], F('Pont validé par configuration pour un MH-60S.', 'Deck validated by configuration for one MH-60S.'))],
      F('Soutien déclaré ; le détachement spécial reste soumis au mandat.', 'Declared support; the special detachment remains subject to the mandate.')),
  cls('zeus', 'special', 'Zeus', 'T-ARC', 'repair', 'repair',
      F('Câblier : pose et réparation de câbles sous-marins.', 'Cable ship: laying and repairing undersea cables.'),
      [F('Seul câblier de pose et de réparation en service dans la Navy ; mission principale : installer et entretenir des câbles sous-marins.', 'The Navy’s only active cable laying and repair ship; main mission: installing and maintaining undersea cables.')],
      ['tarc'],
      G(2, 1, 9, 30, 0, 0, 0, 'local'),
      [C('std', F('Câbles', 'Cables'), ['cable_repair', 'seabed_survey'], [], [('tech', 1)], None)],
      F('Aucune escorte ni protection.', 'No escort or protection.'), reconstructed=True),
  cls('pathfinder', 'special', 'Pathfinder', 'T-AGS', 'tags', 'ship',
      F('Navire de relevés océanographiques.', 'Oceanographic survey ship.'),
      [F('Sondeurs multifaisceaux, sonars remorqués et capteurs consommables ; dernier bâtiment attendu en décembre 2026.', 'Multibeam echo sounders, towed sonars and expendable sensors; last ship expected in December 2026.')],
      ['tags'],
      G(2, 1, 9, 35, 0, 0, 0, 'local'),
      [C('std', F('Relevés', 'Survey'), ['seabed_survey'], [], [('tech', 1)], None)],
      F('Relevés seulement ; aucune capacité de réparation ni de protection.', 'Survey only; no repair or protection capability.'), reconstructed=True),
  cls('blue_ridge', 'special', 'Blue Ridge', 'LCC', 'lcc', 'ship',
      F('Bâtiment de commandement.', 'Command ship.'),
      [F('Fiche ancienne, utilisée pour le rôle et la classe seulement.', 'Old fact file, used for role and class only.')],
      ['lcc'],
      G(4, 2, 11, 70, 2, 0, 0, 'local'),
      [C('std', F('Commandement', 'Command'), ['c2', 'surface_presence'], [], [], F('Maintient les délais d’autorisation quand le réseau de commandement est coupé.', 'Keeps authorisation delays when the command network is cut.'))],
      F('N’ajoute ni unités ni renseignement omniscient.', 'Adds no units and no omniscient intelligence.')),
  cls('constellation', 'program', 'Constellation', 'FFG', None, None,
      F('Frégate lance-missiles : référence de programme, non déployable.', 'Guided-missile frigate: programme reference, not deployable.'),
      [F('En novembre 2025, la Navy a abandonné le programme : seules les deux premières unités restent en construction.', 'In November 2025 the Navy abandoned the programme: only the first two ships remain under construction.'),
       F('La livraison de la première unité a glissé vers 2029.', 'Delivery of the first ship slipped toward 2029.')],
      ['ffg62_cancel', 'ffg62_crs'],
      {'cost': None, 'weight': 2, 'fictional': True, 'minScope': None},
      [],
      F('Consultable seulement : aucun bâtiment en service, donc aucune allocation possible.', 'Read-only: no ship in service, so no allocation is possible.'), status='reference', reconstructed=True),
]

# ---------------------------------------------------------------- 9 modèles de groupes (réduits et fictifs)
def M(cls, cfg='std'): return {'cls': cls, 'cfg': cfg}
GROUPS = [
  {'id': 'csg', 'kind': 'csg', 'name': F('Groupe aéronaval — CSG d’exercice', 'Carrier group — exercise CSG'), 'minScope': 'extended', 'needs': 'aeronaval',
   'members': [M('gerald_ford', 'exercise'), M('arleigh_burke'), M('arleigh_burke')],
   'purpose': F('Présence aéronavale étendue, avec allocation aéronavale explicite.', 'Extended carrier presence, with an explicit carrier-aviation allocation.')},
  {'id': 'arg', 'kind': 'arg', 'name': F('Groupe amphibie — ARG d’exercice', 'Amphibious group — exercise ARG'), 'minScope': 'regional',
   'members': [M('wasp'), M('san_antonio')],
   'purpose': F('Évacuation ou secours de grande ampleur.', 'Large-scale evacuation or rescue.')},
  {'id': 'sag', 'kind': 'sag', 'name': F('Groupe de surface — SAG d’exercice', 'Surface group — exercise SAG'), 'minScope': 'regional',
   'members': [M('arleigh_burke'), M('lcs_freedom', 'suw')],
   'purpose': F('Surveillance de transit, escorte proportionnée et protection aérienne.', 'Transit surveillance, proportionate escort and air protection.')},
  {'id': 'infra', 'kind': 'infra', 'name': F('Groupe infrastructures', 'Infrastructure group'), 'minScope': 'regional',
   'members': [M('zeus'), M('pathfinder'), M('lcs_freedom', 'suw')],
   'purpose': F('Incident de câble ou d’infrastructure sous-marine : relevés, expertise, présence de sécurité.', 'Cable or undersea infrastructure incident: survey, expertise, security presence.')},
  {'id': 'rescue', 'kind': 'rescue', 'name': F('Groupe de secours', 'Rescue group'), 'minScope': 'regional',
   'members': [M('san_antonio'), M('mercy')],
   'purpose': F('Transport, aviation de soutien et soutien médical.', 'Lift, support aviation and medical support.')},
  {'id': 'channel', 'kind': 'channel', 'name': F('Groupe de sécurité des chenaux et d’appui mines', 'Channel security and mine support group'), 'minScope': 'local',
   'members': [M('lcs_independence', 'mcm'), M('avenger')],
   'purpose': F('Sécurité d’un chenal avec risque de mines.', 'Channel security with a mine risk.')},
  {'id': 'subobs', 'kind': 'subobs', 'name': F('Groupe d’observation sous-marine', 'Underwater observation group'), 'minScope': 'regional',
   'members': [M('arleigh_burke'), M('virginia')],
   'purpose': F('Investigation acoustique : hélicoptères équipés, sous-marin alloué, escorte.', 'Acoustic investigation: equipped helicopters, allocated submarine, escort.')},
  {'id': 'continuity', 'kind': 'continuity', 'name': F('Groupe de continuité', 'Continuity group'), 'minScope': 'local',
   'members': [M('blue_ridge'), M('henry_kaiser')],
   'purpose': F('Continuité des communications et du soutien pendant une crise d’information.', 'Continuity of communications and support during an information crisis.')},
  {'id': 'logistics', 'kind': 'logistics', 'name': F('Groupe de soutien logistique', 'Logistics support group'), 'minScope': 'local',
   'members': [M('john_lewis'), M('lewis_clark')],
   'purpose': F('Ravitaillement et réapprovisionnement explicites.', 'Explicit replenishment and resupply.')},
]

# ---------------------------------------------------------------- périmètres (base fictive)
SCOPES = {
  'local': {'fleetBudget': 6, 'maxShips': 2, 'maxAirborneAssets': 1, 'maxDeployedTeams': 1, 'buoysPerMH60R': 2, 'nominalWeight': 1},
  'regional': {'fleetBudget': 10, 'maxShips': 3, 'maxAirborneAssets': 2, 'maxDeployedTeams': 2, 'buoysPerMH60R': 4, 'nominalWeight': 2},
  'extended': {'fleetBudget': 20, 'maxShips': 5, 'maxAirborneAssets': 3, 'maxDeployedTeams': 3, 'buoysPerMH60R': 6, 'nominalWeight': 2},
}
DEFAULTS = {'allowSpecialForces': False, 'allowAeronaval': False, 'historicalEnabled': [], 'requiredCapabilities': [], 'optionalCapabilities': [],
            'loadout': {'buoyUnit': 4, 'buoysPerMH60R': None, 'shipSpareBuoys': 0, 'resupply': None},
            'allowedTeamKinds': ['vbss', 'tech', 'med', 'amph'], 'reinforcements': None, 'escalation': []}

# ---------------------------------------------------------------- profils d'allocation des huit missions
P = {}
P['c1'] = {
  'missionFamily': 'information', 'scopeLevel': 'local',
  'objectives': [F('Rétablir la confiance dans les services du port après une alerte cyber.', 'Restore confidence in port services after a cyber alert.'), F('Répondre à la désinformation qui suit.', 'Respond to the disinformation that follows.')],
  'zone': F('Port et approches, Europe de l’Ouest', 'Port and approaches, Western Europe'),
  'mandate': F('Vérifier et rassurer : présence, observation et continuité des liaisons. Aucun engagement prévu.', 'Verify and reassure: presence, observation and link continuity. No engagement planned.'),
  'authorizedActions': ['observe', 'identify', 'board_with_basis', 'coordinate'],
  'requiredCapabilities': ['surface_presence'], 'optionalCapabilities': ['c2', 'boarding', 'logistics'],
  'allowedClasses': ['lcs_freedom', 'lcs_independence', 'blue_ridge', 'henry_kaiser', 'john_lewis', 'spearhead', 'arleigh_burke'],
  'allowedConfigurations': {'lcs_freedom': ['suw'], 'lcs_independence': ['suw']},
  'allowedGroupKinds': ['continuity'],
  'allowedTeamKinds': ['vbss'],
  'recommended': {'ships': [M('lcs_freedom', 'suw')], 'why': F('Une vérification locale d’information se conduit avec un moyen léger : un LCS en configuration surface suffit à la présence exigée ; le groupe de continuité reste une option si vous craignez une coupure des liaisons.', 'A local information check is done with a light asset: one LCS in surface configuration meets the required presence; the continuity group remains an option if you fear a link cut.')},
  'reinforcements': None,
}
P['f2'] = {
  'missionFamily': 'infrastructure', 'scopeLevel': 'regional',
  'objectives': [F('Surveiller la zone des câbles.', 'Watch the cable area.'), F('Expertiser une activité près des fonds.', 'Assess activity near the seabed.'), F('Empêcher un sabotage.', 'Prevent sabotage.')],
  'zone': F('Shetland, deux câbles sur environ 200 milles', 'Shetland, two cables over about 200 miles'),
  'mandate': F('Observer, relever, expertiser et contrôler un navire avec base légale. Engagement seulement en légitime défense.', 'Observe, survey, assess and inspect a ship with a legal basis. Engagement in self-defence only.'),
  'authorizedActions': ['observe', 'identify', 'survey', 'cable_repair', 'board_with_basis', 'self_defence'],
  'requiredCapabilities': ['seabed_survey', 'surface_presence'], 'optionalCapabilities': ['cable_repair', 'boarding', 'sonar', 'asw_helo'],
  'allowedClasses': ['zeus', 'pathfinder', 'lcs_freedom', 'lcs_independence', 'arleigh_burke', 'virginia'],
  'allowedConfigurations': {'lcs_freedom': ['suw', 'mcm'], 'lcs_independence': ['suw', 'mcm']},
  'allowedGroupKinds': ['infra', 'subobs'],
  'allowedTeamKinds': ['tech', 'vbss'],
  'scopeWhy': F('Périmètre régional : deux câbles éloignés et une surveillance de zone à tenir en même temps que l’expertise. L’objectif supplémentaire est la présence de sécurité, pas une hausse de puissance : aucun groupe de combat n’est prévu.', 'Regional scope: two distant cables and an area watch to hold at the same time as the assessment. The extra objective is a security presence, not more firepower: no combat group is planned.'),
  'recommended': {'group': 'infra', 'why': F('Le groupe infrastructures réunit relevés (Pathfinder), expertise des câbles (Zeus) et présence de sécurité (LCS) pour 7 points.', 'The infrastructure group brings survey (Pathfinder), cable expertise (Zeus) and a security presence (LCS) for 7 points.')},
}
P['asw'] = {
  'missionFamily': 'acoustic', 'scopeLevel': 'extended',
  'objectives': [F('Localiser et classer des contacts sous-marins répétés.', 'Locate and classify repeated underwater contacts.'), F('Répondre à une détresse.', 'Respond to a distress call.')],
  'zone': F('Atlantique Nord, plusieurs secteurs de chasse', 'North Atlantic, several search sectors'),
  'mandate': F('Observer, localiser et classer ; une torpille seulement contre un sous-marin localisé, selon la posture Engager. Aucune frappe vers la terre.', 'Observe, locate and classify; a torpedo only against a located submarine, in the Engage posture. No land strike.'),
  'authorizedActions': ['observe', 'identify', 'acoustic', 'press', 'torpedo_if_located', 'rescue'],
  'requiredCapabilities': ['asw_helo', 'sonar'], 'optionalCapabilities': ['underwater_obs', 'torpedo', 'escort', 'cable_repair', 'logistics'],
  'allowedClasses': ['arleigh_burke', 'ticonderoga', 'lcs_freedom', 'lcs_independence', 'virginia', 'los_angeles', 'seawolf', 'zeus', 'lewis_clark'],
  'allowedConfigurations': {'lcs_freedom': ['suw'], 'lcs_independence': ['suw']},
  'allowedGroupKinds': ['subobs', 'sag', 'logistics'],
  'allowedTeamKinds': ['vbss'],
  'loadout': {'shipSpareBuoys': 12, 'resupply': 'lewis_clark'},
  'scopeWhy': F('Périmètre étendu : quatre contacts successifs sur plusieurs secteurs. L’objectif supplémentaire est la couverture acoustique ; le groupe aéronaval n’est pas autorisé, faute d’allocation aéronavale dans le mandat.', 'Extended scope: four successive contacts across several sectors. The extra objective is acoustic coverage; the carrier group is not authorised, as the mandate makes no carrier-aviation allocation.'),
  'recommended': {'ships': [M('arleigh_burke'), M('virginia'), M('lcs_freedom', 'suw'), M('zeus'), M('lewis_clark')], 'why': F('Destroyer et sous-marin pour l’observation sous-marine, un LCS en surface pour un MH-60R de plus, câblier pour les fonds, ravitailleur pour recompléter les bouées : 16 points, cinq bâtiments.', 'Destroyer and submarine for underwater observation, a surface LCS for one more MH-60R, cable ship for the seabed, supply ship to refill the buoys: 16 points, five ships.')},
}
P['l12'] = {
  'missionFamily': 'transit', 'scopeLevel': 'regional',
  'objectives': [F('Suivre un navire sans transpondeur.', 'Track a ship without a transponder.'), F('Repousser un raid et une salve contre les installations.', 'Repel a raid and a salvo against the installations.')],
  'zone': F('Mer de Norvège, installations gazières', 'Norwegian Sea, gas installations'),
  'mandate': F('Escorte proportionnée, avertissement, défense des installations ; tir seulement selon la posture autorisée.', 'Proportionate escort, warning, installation defence; firing only under the authorised posture.'),
  'authorizedActions': ['observe', 'identify', 'escort', 'warn', 'board_with_basis', 'defend', 'engage_under_posture'],
  'requiredCapabilities': ['air_defense', 'surface_presence'], 'optionalCapabilities': ['escort', 'asw_helo', 'boarding'],
  'allowedClasses': ['arleigh_burke', 'ticonderoga', 'zumwalt', 'lcs_freedom', 'lcs_independence'],
  'allowedConfigurations': {'lcs_freedom': ['suw'], 'lcs_independence': ['suw']},
  'allowedGroupKinds': ['sag'],
  'allowedTeamKinds': ['vbss'],
  'scopeWhy': F('Périmètre régional : protéger trois installations dispersées contre un raid puis une salve. Les moyens restent ceux d’un groupe de surface réduit.', 'Regional scope: protect three dispersed installations against a raid then a salvo. Assets remain those of a reduced surface group.'),
  'escalation': [F('Tirer le premier ajoute 0,6 de tension (règle du jeu existante).', 'Firing first adds 0.6 tension (existing game rule).')],
  'recommended': {'group': 'sag', 'why': F('Le SAG d’exercice associe protection aérienne (destroyer) et présence rapide (LCS) pour 7 points.', 'The exercise SAG combines air protection (destroyer) and fast presence (LCS) for 7 points.')},
}
P['g3'] = {
  'missionFamily': 'ship_assist', 'scopeLevel': 'local',
  'objectives': [F('Répondre à une détresse.', 'Respond to a distress call.'), F('Résoudre la prise d’un pétrolier.', 'Resolve the seizure of a tanker.'), F('Traiter une alerte cyber.', 'Handle a cyber alert.')],
  'zone': F('Golfe de Guinée, approches sud', 'Gulf of Guinea, southern approaches'),
  'mandate': F('Assistance et contrôle ; un détachement spécial est prévu pour la reprise du navire, si la décision est prise.', 'Assistance and inspection; a special detachment is provided for retaking the ship, if decided.'),
  'authorizedActions': ['observe', 'identify', 'rescue', 'board_with_basis', 'special_detachment'],
  'requiredCapabilities': ['surface_presence'], 'optionalCapabilities': ['boarding', 'sof_support', 'helo_support', 'lift'],
  'allowedClasses': ['lcs_freedom', 'lcs_independence', 'lewis_puller', 'spearhead'],
  'allowedConfigurations': {'lcs_freedom': ['suw'], 'lcs_independence': ['suw']},
  'allowedGroupKinds': [],
  'allowedTeamKinds': ['vbss'],
  'allowSpecialForces': True,
  'recommended': {'ships': [M('lcs_freedom', 'suw')], 'why': F('Un LCS en surface assure la présence et la visite ; le détachement spécial de la mission est alloué séparément.', 'One surface LCS provides presence and visit; the mission’s special detachment is allocated separately.')},
}
P['a4'] = {
  'missionFamily': 'transit', 'scopeLevel': 'extended',
  'objectives': [F('Répondre à la désinformation.', 'Respond to disinformation.'), F('Protéger le corridor contre un essaim de drones.', 'Protect the corridor against a drone swarm.'), F('Traiter une alerte cyber au port.', 'Handle a cyber alert at the port.')],
  'zone': F('Golfe d’Aden et mer Rouge, corridor commercial', 'Gulf of Aden and Red Sea, commercial corridor'),
  'mandate': F('Protection du trafic et défense contre les drones ; pas de frappe vers la terre.', 'Traffic protection and defence against drones; no land strike.'),
  'authorizedActions': ['observe', 'identify', 'escort', 'defend', 'engage_under_posture'],
  'requiredCapabilities': ['air_defense', 'escort'], 'optionalCapabilities': ['aeronaval', 'surface_presence', 'asw_helo', 'logistics'],
  'allowedClasses': ['arleigh_burke', 'ticonderoga', 'zumwalt', 'lcs_freedom', 'lcs_independence', 'gerald_ford', 'nimitz', 'john_lewis', 'henry_kaiser', 'lewis_clark'],
  'allowedConfigurations': {'lcs_freedom': ['suw'], 'lcs_independence': ['suw']},
  'allowedGroupKinds': ['sag', 'csg', 'logistics'],
  'allowedTeamKinds': ['vbss'],
  'allowAeronaval': True,
  'aeronavalAllocation': {'deck': ['fighter'], 'note': F('Avec un porte-avions, la mission alloue un détachement F/A-18 de la flotte d’exercice, et rien de plus.', 'With a carrier, the mission allocates one F/A-18 detachment from the exercise fleet, and nothing more.')},
  'escalation': [F('Engager un groupe aéronaval ajoute 0,3 de tension au lancement : signal de puissance visible.', 'Committing a carrier group adds 0.3 tension at launch: a visible show of force.')],
  'scopeWhy': F('Périmètre étendu : un corridor long et des pistes multiples. Le groupe aéronaval est autorisé par une allocation aéronavale explicite, mais il reste surdimensionné pour l’objectif ; le SAG suffit.', 'Extended scope: a long corridor and multiple tracks. The carrier group is authorised by an explicit carrier-aviation allocation, but it remains oversized for the objective; the SAG is enough.'),
  'recommended': {'group': 'sag', 'why': F('Protection aérienne et escorte : le SAG d’exercice couvre les capacités indispensables pour 7 points.', 'Air protection and escort: the exercise SAG covers the required capabilities for 7 points.')},
}
P['e6'] = {
  'missionFamily': 'evacuation', 'scopeLevel': 'regional',
  'objectives': [F('Répondre à la désinformation.', 'Respond to disinformation.'), F('Évacuer des ressortissants depuis le port.', 'Evacuate nationals from the port.'), F('Traiter une alerte cyber sur le réseau électrique.', 'Handle a cyber alert on the power grid.')],
  'zone': F('Méditerranée orientale, port d’évacuation', 'Eastern Mediterranean, evacuation port'),
  'mandate': F('Évacuation et soutien médical ; un détachement spécial est prévu si la situation l’exige.', 'Evacuation and medical support; a special detachment is provided if the situation requires.'),
  'authorizedActions': ['observe', 'identify', 'evacuate', 'medical', 'special_detachment', 'self_defence'],
  'requiredCapabilities': ['lift', 'medical'], 'optionalCapabilities': ['helo_support', 'aviation_hub', 'escort', 'surface_presence'],
  'allowedClasses': ['san_antonio', 'mercy', 'wasp', 'america', 'harpers_ferry', 'spearhead', 'arleigh_burke', 'lcs_freedom', 'lcs_independence'],
  'allowedConfigurations': {'lcs_freedom': ['suw'], 'lcs_independence': ['suw']},
  'allowedGroupKinds': ['rescue', 'arg'],
  'allowedTeamKinds': ['amph', 'med'],
  'allowSpecialForces': True,
  'scopeWhy': F('Périmètre régional : un port d’évacuation et un accueil médical. L’ARG d’exercice est autorisé mais surdimensionné : le groupe de secours suffit.', 'Regional scope: one evacuation port and medical reception. The exercise ARG is authorised but oversized: the rescue group is enough.'),
  'recommended': {'group': 'rescue', 'why': F('Transport, hélicoptères de soutien et accueil médical réunis par le San Antonio et le Mercy, pour 8 points.', 'Lift, support helicopters and medical reception brought by San Antonio and Mercy, for 8 points.')},
}
P['m6'] = {
  'missionFamily': 'mines', 'scopeLevel': 'local',
  'objectives': [F('Expertiser une activité près des fonds.', 'Assess activity near the seabed.'), F('Sécuriser le chenal avec un risque de mines.', 'Secure the channel against a mine risk.'), F('Tenir la surveillance du chenal.', 'Hold the channel watch.')],
  'zone': F('Détroit de Malacca, chenal de transit', 'Strait of Malacca, transit channel'),
  'mandate': F('Relever, déminer et fermer ou rouvrir le chenal. Aucun engagement prévu.', 'Survey, clear mines and close or reopen the channel. No engagement planned.'),
  'authorizedActions': ['observe', 'identify', 'survey', 'mcm', 'channel_control'],
  'requiredCapabilities': ['mcm', 'surface_presence'], 'optionalCapabilities': ['seabed_survey', 'cable_repair'],
  'allowedClasses': ['lcs_independence', 'lcs_freedom', 'avenger', 'pathfinder', 'zeus'],
  'allowedConfigurations': {'lcs_freedom': ['mcm'], 'lcs_independence': ['mcm']},
  'allowedGroupKinds': ['channel'],
  'allowedTeamKinds': ['tech'],
  'historicalEnabled': ['avenger'],
  'historicalNote': F('Configuration d’exercice datée du 20 novembre 2026 : l’Avenger est alloué comme moyen fictif, sans présumer qu’un bâtiment réel est disponible.', 'Exercise configuration dated 20 November 2026: Avenger is allocated as a fictional asset, without assuming a real ship is available.'),
  'recommended': {'group': 'channel', 'why': F('Le groupe chenaux réunit le module MCM du LCS et l’Avenger : 5 points pour l’objectif central, la sécurité du chenal.', 'The channel group combines the LCS MCM package and Avenger: 5 points for the core objective, channel safety.')},
}

def main():
    cl = {c['id']: c for c in CLASSES}
    assert len(CLASSES) == 26, len(CLASSES)
    assert len(GROUPS) == 9
    for c in CLASSES:
        for s in c['public']['sources']: assert s in SOURCES, (c['id'], s)
        for k in c['configs']:
            for cap in k['caps']: assert cap in CAPS, (c['id'], cap)
            for a, n in k['air']: assert a in AIR
            for t, n in k['teams']: assert t in TEAMS
        if c['status'] == 'deployable': assert c['configs'] and c['game']['cost'], c['id']
    for g in GROUPS:
        for m in g['members']:
            assert m['cls'] in cl, m
            assert any(k['id'] == m['cfg'] for k in cl[m['cls']]['configs']), m
        g['cost'] = sum(cl[m['cls']]['game']['cost'] for m in g['members'])
    for mid, p in P.items():
        for k in ('allowedClasses',):
            for c in p.get(k, []): assert c in cl, (mid, c)
        for cap in p['requiredCapabilities'] + p['optionalCapabilities']: assert cap in CAPS, (mid, cap)
        r = p['recommended']
        if 'group' in r: assert any(g['id'] == r['group'] for g in GROUPS)
    out = {'schemaVersion': 1, 'catalogueVersion': CHECKED, 'checkedOn': CHECKED,
           'title': F('Registre naval FOGLINE', 'FOGLINE naval registry'),
           'factsVsGame': F('Les noms, familles et faits publics ont des sources. Coûts, vitesses, capteurs, stocks, capacités jouables, compositions et délais sont des valeurs fictives d’équilibrage.', 'Names, families and public facts have sources. Costs, speeds, sensors, stocks, playable capabilities, compositions and delays are fictional balancing values.'),
           'availabilityNote': F('La disponibilité dans FOGLINE est une allocation de scénario. Elle ne décrit pas la disponibilité opérationnelle réelle de la flotte américaine.', 'Availability in FOGLINE is a scenario allocation. It does not describe the real operational availability of the US fleet.'),
           'reconstructionNote': F('Fiches reconstruites le 20 novembre 2026 à partir de sources publiques, faute du catalogue de 26 fiches annoncé : Ticonderoga, Harpers Ferry, Los Angeles, Seawolf, Ohio SSGN, Zeus, Pathfinder et Constellation.', 'Sheets rebuilt on 20 November 2026 from public sources, as the announced 26-sheet catalogue was missing: Ticonderoga, Harpers Ferry, Los Angeles, Seawolf, Ohio SSGN, Zeus, Pathfinder and Constellation.'),
           'families': FAMILIES, 'capabilities': CAPS, 'aircraft': AIR, 'teams': TEAMS, 'teamNote': TEAM_NOTE,
           'scopes': SCOPES, 'defaults': DEFAULTS, 'classes': CLASSES, 'taskGroups': GROUPS, 'missions': P,
           'sources': {k: {'title': v[0], 'url': v[1], 'consultedOn': CHECKED} for k, v in SOURCES.items()}}
    open(os.path.join(D, 'naval-catalogue.json'), 'w', encoding='utf-8').write(json.dumps(out, ensure_ascii=False, separators=(',', ':')))
    write_md(out)
    print('naval-catalogue.json :', len(CLASSES), 'fiches,', len(GROUPS), 'groupes,', len(P), 'profils de mission')
    for g in GROUPS: print(f"  {g['id']:<11} {g['cost']:>2} pts  {len(g['members'])} bâtiments")


def write_md(out):
    """UNITS.md : documentation lisible, générée depuis les mêmes données que le jeu."""
    fr = lambda o: o['fr'] if isinstance(o, dict) else (o or '')
    cap = lambda L: ', '.join(fr(out['capabilities'][k]) for k in L) or '—'
    A = out['aircraft']; T = out['teams']
    L = ['# Registre naval FOGLINE (version 47)', '',
         'Fichier généré par `python3 gen_naval.py` : ne pas le modifier à la main. Les données font foi dans `naval-catalogue.json`.', '',
         '> ' + fr(out['factsVsGame']), '>', '> ' + fr(out['availabilityNote']), '>', '> ' + fr(out['reconstructionNote']), '',
         '## Fiches (26)', '', '| Famille | Classe | Coque | Type moteur | Coût | Gabarit | Périmètre minimal | Configurations (appareils, équipes) | Statut |', '|---|---|---|---|---:|---|---|---|---|']
    for c in out['classes']:
        g = c['game']
        cf = '<br>'.join(f"{fr(k['name'])} : " + (', '.join(f"{n} × {A[a]['name']}" for a, n in k['air']) or 'aucun appareil') + (' ; ' + ', '.join(f"{n} × {fr(T[t]['label'])}" for t, n in k['teams']) if k['teams'] else '') for k in c['configs']) or '—'
        st = 'référence non déployable' if c['status'] != 'deployable' else ('référence datée, activable par scénario' if c.get('datedReference') else 'déployable')
        L.append(f"| {fr(out['families'][c['family']])} | {c['name']}{' *' if c['reconstructed'] else ''} | {c['hull']} | {(c['engine'] or {}).get('ut') or '—'} | {g.get('cost') or '—'} | {g.get('weight')} | {g.get('minScope') or '—'} | {cf} | {st} |")
    L += ['', '`*` : fiche reconstruite le 20 novembre 2026 à partir de sources publiques.', '',
          '## Capacités par configuration', '']
    for c in out['classes']:
        for k in c['configs']:
            L.append(f"- **{c['name']} · {fr(k['name'])}** : {cap(k['caps'])}" + (f" — {fr(k['note'])}" if k['note'] else ''))
    L += ['', '## Appareils et équipes', '']
    for k, a in A.items():
        L.append(f"- **{a['name']}** : {cap(a['caps'])} ; bouées : {'oui, selon le profil de mission' if a['buoys'] else 'aucune'} ; torpilles de jeu : {a['torp']} ; transport d’équipe : {'oui' if a['carry'] else 'non'}. {fr(a['note'])}")
    for k, t in T.items():
        L.append(f"- **{fr(t['label'])}** ({k}) : {t['n']} personnes ; {cap(t['caps'])}")
    L += ['', fr(out['teamNote']), '', '## Modèles de groupes (9)', '', '| Groupe | Membres | Coût | Périmètre minimal | Usage |', '|---|---|---:|---|---|']
    cl = {c['id']: c for c in out['classes']}
    for g in out['taskGroups']:
        L.append(f"| {fr(g['name'])} | " + ', '.join(f"{cl[m['cls']]['name']} ({fr(next(k['name'] for k in cl[m['cls']]['configs'] if k['id'] == m['cfg']))})" for m in g['members']) + f" | {g['cost']} | {g['minScope']}{' + allocation aéronavale' if g.get('needs') == 'aeronaval' else ''} | {fr(g['purpose'])} |")
    L += ['', 'Le groupe est un conteneur : chaque bâtiment garde son identifiant, son coût, ses appareils, son personnel et ses stocks.', '',
          '## Périmètres (valeurs fictives)', '', '| Périmètre | Budget | Bâtiments | Appareils engagés | Équipes déployées | Largages par MH-60R | Gabarit nominal |', '|---|---:|---:|---:|---:|---:|---|']
    for k, v in out['scopes'].items():
        L.append(f"| {k} | {v['fleetBudget']} | {v['maxShips']} | {v['maxAirborneAssets']} | {v['maxDeployedTeams']} | {v['buoysPerMH60R']} (soit {v['buoysPerMH60R']*4} bouées) | {v['nominalWeight']} |")
    L += ['', 'Un largage de jeu correspond à un cercle de détection, soit 4 bouées réelles (`ASW.bpc`, version 40). Les plafonds effectifs sont le minimum du périmètre et de la mission.', '',
          '## Profils d’allocation des huit missions', '', '| Mission | Famille | Périmètre | Capacités indispensables | Groupes autorisés | Détachement spécial | Allocation aéronavale | Recommandation |', '|---|---|---|---|---|---|---|---|']
    for mid, p in out['missions'].items():
        r = p['recommended']
        rec = ('groupe ' + r['group']) if 'group' in r else ', '.join(f"{cl[m['cls']]['name']} ({m['cfg']})" for m in r['ships'])
        L.append(f"| {mid} | {p['missionFamily']} | {p['scopeLevel']} | {cap(p['requiredCapabilities'])} | {', '.join(p['allowedGroupKinds']) or 'aucun'} | {'oui' if p.get('allowSpecialForces') else 'non'} | {'oui' if p.get('allowAeronaval') else 'non'} | {rec} |")
    L += ['', '## Sources', '']
    for k, v in out['sources'].items():
        L.append(f"- `{k}` : [{v['title']}]({v['url']}), consultée le {v['consultedOn']}")
    open(os.path.join(D, 'UNITS.md'), 'w', encoding='utf-8').write('\n'.join(L) + '\n')

if __name__ == '__main__':
    main()
