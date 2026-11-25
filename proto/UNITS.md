# Registre naval FOGLINE (version 47)

Fichier généré par `python3 gen_naval.py` : ne pas le modifier à la main. Les données font foi dans `naval-catalogue.json`.

> Les noms, familles et faits publics ont des sources. Coûts, vitesses, capteurs, stocks, capacités jouables, compositions et délais sont des valeurs fictives d’équilibrage.
>
> La disponibilité dans FOGLINE est une allocation de scénario. Elle ne décrit pas la disponibilité opérationnelle réelle de la flotte américaine.
>
> Fiches reconstruites le 20 novembre 2026 à partir de sources publiques, faute du catalogue de 26 fiches annoncé : Ticonderoga, Harpers Ferry, Los Angeles, Seawolf, Ohio SSGN, Zeus, Pathfinder et Constellation.

## Fiches (26)

| Famille | Classe | Coque | Type moteur | Coût | Gabarit | Périmètre minimal | Configurations (appareils, équipes) | Statut |
|---|---|---|---|---:|---|---|---|---|
| Combat littoral | LCS Freedom | LCS | patrol | 3 | 1 | local | Surface (SUW) : 1 × MH-60R ; 1 × Équipe de visite<br>Lutte contre les mines (MCM) : 1 × MH-60S<br>Surface avec MQ-8 (historique) : 1 × MH-60R, 1 × MQ-8 ; 1 × Équipe de visite | déployable |
| Combat littoral | LCS Independence | LCS | lcsi | 3 | 1 | local | Surface (SUW) : 1 × MH-60R ; 1 × Équipe de visite<br>Lutte contre les mines (MCM) : 1 × MH-60S<br>Surface avec MQ-8 (historique) : 1 × MH-60R, 2 × MQ-8 ; 1 × Équipe de visite | déployable |
| Escorte de surface | Arleigh Burke Flight IIA/III | DDG | frigate | 4 | 2 | local | Escorte : 2 × MH-60R ; 1 × Équipe de visite | déployable |
| Escorte de surface | Zumwalt | DDG | ddg1000 | 5 | 2 | regional | Surface : 1 × MH-60R | déployable |
| Escorte de surface | Ticonderoga * | CG | cg | 4 | 2 | regional | Escorte et commandement de zone : 2 × MH-60R | déployable |
| Porte-avions | Gerald R. Ford | CVN | cvn | 6 | 3 | extended | Exercice : deux hélicoptères : 1 × MH-60R, 1 × MH-60S | déployable |
| Porte-avions | Nimitz | CVN | cvn68 | 6 | 3 | extended | Exercice : deux hélicoptères : 1 × MH-60R, 1 × MH-60S | déployable |
| Amphibies | San Antonio | LPD | lpd | 4 | 2 | local | Secours et transport : 2 × MH-60S ; 2 × Détachement amphibie, 1 × Équipe médicale | déployable |
| Amphibies | America (Flight 0) | LHA | lha | 5 | 3 | regional | Aviation et transport : 2 × MH-60S ; 1 × Détachement amphibie, 1 × Équipe médicale | déployable |
| Amphibies | Wasp | LHD | lhd | 5 | 3 | regional | Secours et transport : 2 × MH-60S ; 2 × Détachement amphibie, 1 × Équipe médicale | déployable |
| Amphibies | Harpers Ferry * | LSD | lsd | 3 | 2 | regional | Transport : aucun appareil ; 1 × Détachement amphibie | déployable |
| Sous-marins | Virginia | SSN | ssn | 4 | 2 | regional | Observation sous-marine : aucun appareil | déployable |
| Sous-marins | Los Angeles * | SSN | ssn688 | 3 | 2 | regional | Observation sous-marine : aucun appareil | déployable |
| Sous-marins | Seawolf * | SSN | ssn21 | 5 | 2 | regional | Observation sous-marine : aucun appareil | déployable |
| Sous-marins | Ohio SSGN * | SSGN | ssgn | 5 | 3 | extended | Observation et soutien spécial : aucun appareil | déployable |
| Logistique | John Lewis | T-AO | tao205 | 2 | 1 | local | Ravitaillement : aucun appareil | déployable |
| Logistique | Henry J. Kaiser | T-AO | tao187 | 2 | 1 | local | Ravitaillement : aucun appareil | déployable |
| Logistique | Lewis and Clark | T-AKE | take | 3 | 1 | local | Réapprovisionnement : aucun appareil | déployable |
| Logistique | Spearhead | T-EPF | epf | 3 | 1 | local | Transport rapide : aucun appareil ; 1 × Détachement amphibie | déployable |
| Missions spécialisées | Avenger | MCM | mcm | 2 | 1 | local | Lutte contre les mines : aucun appareil | référence datée, activable par scénario |
| Missions spécialisées | Mercy | T-AH | tah | 4 | 2 | regional | Accueil médical : aucun appareil ; 2 × Équipe médicale | déployable |
| Missions spécialisées | Lewis B. Puller | ESB | esb | 4 | 2 | local | Base de soutien : 1 × MH-60S | déployable |
| Missions spécialisées | Zeus * | T-ARC | repair | 2 | 1 | local | Câbles : aucun appareil ; 1 × Équipe technique | déployable |
| Missions spécialisées | Pathfinder * | T-AGS | tags | 2 | 1 | local | Relevés : aucun appareil ; 1 × Équipe technique | déployable |
| Missions spécialisées | Blue Ridge | LCC | lcc | 4 | 2 | local | Commandement : aucun appareil | déployable |
| Référence de programme | Constellation * | FFG | — | — | 2 | — | — | référence non déployable |

`*` : fiche reconstruite le 20 novembre 2026 à partir de sources publiques.

## Capacités par configuration

- **LCS Freedom · Surface (SUW)** : Présence et surveillance de surface, Escorte proportionnée, Visite et contrôle — MH-60R équipé ; capacités de surface seulement.
- **LCS Freedom · Lutte contre les mines (MCM)** : Présence et surveillance de surface, Lutte contre les mines, Relevés des fonds — MH-60S de soutien : aucune action acoustique ni bouée.
- **LCS Freedom · Surface avec MQ-8 (historique)** : Présence et surveillance de surface, Escorte proportionnée, Visite et contrôle, Drone embarqué d’observation — Configuration historique : un hélicoptère et un drone de scénario.
- **LCS Independence · Surface (SUW)** : Présence et surveillance de surface, Escorte proportionnée, Visite et contrôle — MH-60R équipé.
- **LCS Independence · Lutte contre les mines (MCM)** : Présence et surveillance de surface, Lutte contre les mines, Relevés des fonds — MH-60S de soutien, sans bouées.
- **LCS Independence · Surface avec MQ-8 (historique)** : Présence et surveillance de surface, Escorte proportionnée, Visite et contrôle, Drone embarqué d’observation — Configuration historique : un hélicoptère et deux drones de scénario.
- **Arleigh Burke Flight IIA/III · Escorte** : Présence et surveillance de surface, Escorte proportionnée, Visite et contrôle, Protection aérienne, Observation acoustique de bord, Torpilles de jeu — Deux MH-60R, comme dans la V1.
- **Zumwalt · Surface** : Présence et surveillance de surface, Escorte proportionnée, Observation acoustique de bord — Un MH-60R de scénario.
- **Ticonderoga · Escorte et commandement de zone** : Présence et surveillance de surface, Escorte proportionnée, Protection aérienne, Observation acoustique de bord, Torpilles de jeu, Commandement et continuité des liaisons — Deux MH-60R de scénario.
- **Gerald R. Ford · Exercice : deux hélicoptères** : Présence et surveillance de surface, Coordination aéronavale, Accueil aérien étendu, Commandement et continuité des liaisons — Les deux hélicoptères retenus pour l’exercice ; aucun groupe aérien complet.
- **Nimitz · Exercice : deux hélicoptères** : Présence et surveillance de surface, Coordination aéronavale, Accueil aérien étendu, Commandement et continuité des liaisons — Groupe aérien non simulé ; seuls deux hélicoptères sont alloués.
- **San Antonio · Secours et transport** : Transport de personnes et de matériel, Soutien médical, Présence et surveillance de surface — Deux MH-60S et deux équipes optionnelles, comme dans la V1.
- **America (Flight 0) · Aviation et transport** : Transport de personnes et de matériel, Soutien médical, Accueil aérien étendu, Présence et surveillance de surface — Hélicoptères alloués explicitement ; pas d’embarcations de radier.
- **Wasp · Secours et transport** : Transport de personnes et de matériel, Soutien médical, Accueil aérien étendu, Présence et surveillance de surface — Deux MH-60S de scénario.
- **Harpers Ferry · Transport** : Transport de personnes et de matériel, Présence et surveillance de surface — Pas d’hélicoptère embarqué dans le profil de jeu.
- **Virginia · Observation sous-marine** : Observation sous-marine, Observation acoustique de bord, Torpilles de jeu — Aucun hélicoptère ni drone aérien, comme dans la V1.
- **Los Angeles · Observation sous-marine** : Observation sous-marine, Observation acoustique de bord, Torpilles de jeu
- **Seawolf · Observation sous-marine** : Observation sous-marine, Observation acoustique de bord, Torpilles de jeu
- **Ohio SSGN · Observation et soutien spécial** : Observation sous-marine, Observation acoustique de bord, Soutien d’un détachement spécial — Aucune frappe vers la terre dans FOGLINE.
- **John Lewis · Ravitaillement** : Ravitaillement à la mer
- **Henry J. Kaiser · Ravitaillement** : Ravitaillement à la mer
- **Lewis and Clark · Réapprovisionnement** : Ravitaillement à la mer — Seul moyen de réapprovisionner les bouées : stock fini, transfert explicite.
- **Spearhead · Transport rapide** : Transport de personnes et de matériel
- **Avenger · Lutte contre les mines** : Lutte contre les mines, Relevés des fonds
- **Mercy · Accueil médical** : Soutien médical, Transport de personnes et de matériel — Places et personnel médical de scénario.
- **Lewis B. Puller · Base de soutien** : Soutien d’un détachement spécial, Ravitaillement à la mer, Accueil aérien étendu — Pont validé par configuration pour un MH-60S.
- **Zeus · Câbles** : Expertise et réparation de câbles, Relevés des fonds
- **Pathfinder · Relevés** : Relevés des fonds
- **Blue Ridge · Commandement** : Commandement et continuité des liaisons, Présence et surveillance de surface — Maintient les délais d’autorisation quand le réseau de commandement est coupé.

## Appareils et équipes

- **MH-60R** : Hélicoptère acoustique équipé (MH-60R), Présence et surveillance de surface ; bouées : oui, selon le profil de mission ; torpilles de jeu : 2 ; transport d’équipe : oui. Bouées et torpilles de jeu limitées par le profil de mission.
- **MH-60S** : Hélicoptère de soutien (MH-60S) ; bouées : aucune ; torpilles de jeu : 0 ; transport d’équipe : oui. Profil de soutien : aucune bouée, aucune action acoustique.
- **MQ-8** : Drone embarqué d’observation ; bouées : aucune ; torpilles de jeu : 0 ; transport d’équipe : non. Retiré du service de la Navy d’ici la fin de l’exercice 2026 : seulement dans un scénario qui l’active.
- **Équipe de visite** (vbss) : 4 personnes ; Visite et contrôle
- **Équipe technique** (tech) : 4 personnes ; Expertise et réparation de câbles, Relevés des fonds
- **Équipe médicale** (med) : 4 personnes ; Soutien médical
- **Détachement amphibie** (amph) : 4 personnes ; Transport de personnes et de matériel

Archétypes de jeu de quatre personnes, sans effectif doctrinal réel.

## Modèles de groupes (9)

| Groupe | Membres | Coût | Périmètre minimal | Usage |
|---|---|---:|---|---|
| Groupe aéronaval — CSG d’exercice | Gerald R. Ford (Exercice : deux hélicoptères), Arleigh Burke Flight IIA/III (Escorte), Arleigh Burke Flight IIA/III (Escorte) | 14 | extended + allocation aéronavale | Présence aéronavale étendue, avec allocation aéronavale explicite. |
| Groupe amphibie — ARG d’exercice | Wasp (Secours et transport), San Antonio (Secours et transport) | 9 | regional | Évacuation ou secours de grande ampleur. |
| Groupe de surface — SAG d’exercice | Arleigh Burke Flight IIA/III (Escorte), LCS Freedom (Surface (SUW)) | 7 | regional | Surveillance de transit, escorte proportionnée et protection aérienne. |
| Groupe infrastructures | Zeus (Câbles), Pathfinder (Relevés), LCS Freedom (Surface (SUW)) | 7 | regional | Incident de câble ou d’infrastructure sous-marine : relevés, expertise, présence de sécurité. |
| Groupe de secours | San Antonio (Secours et transport), Mercy (Accueil médical) | 8 | regional | Transport, aviation de soutien et soutien médical. |
| Groupe de sécurité des chenaux et d’appui mines | LCS Independence (Lutte contre les mines (MCM)), Avenger (Lutte contre les mines) | 5 | local | Sécurité d’un chenal avec risque de mines. |
| Groupe d’observation sous-marine | Arleigh Burke Flight IIA/III (Escorte), Virginia (Observation sous-marine) | 8 | regional | Investigation acoustique : hélicoptères équipés, sous-marin alloué, escorte. |
| Groupe de continuité | Blue Ridge (Commandement), Henry J. Kaiser (Ravitaillement) | 6 | local | Continuité des communications et du soutien pendant une crise d’information. |
| Groupe de soutien logistique | John Lewis (Ravitaillement), Lewis and Clark (Réapprovisionnement) | 5 | local | Ravitaillement et réapprovisionnement explicites. |

Le groupe est un conteneur : chaque bâtiment garde son identifiant, son coût, ses appareils, son personnel et ses stocks.

## Périmètres (valeurs fictives)

| Périmètre | Budget | Bâtiments | Appareils engagés | Équipes déployées | Largages par MH-60R | Gabarit nominal |
|---|---:|---:|---:|---:|---:|---|
| local | 6 | 2 | 1 | 1 | 2 (soit 8 bouées) | 1 |
| regional | 10 | 3 | 2 | 2 | 4 (soit 16 bouées) | 2 |
| extended | 20 | 5 | 3 | 3 | 6 (soit 24 bouées) | 2 |

Un largage de jeu correspond à un cercle de détection, soit 4 bouées réelles (`ASW.bpc`, version 40). Les plafonds effectifs sont le minimum du périmètre et de la mission.

## Profils d’allocation des huit missions

| Mission | Famille | Périmètre | Capacités indispensables | Groupes autorisés | Détachement spécial | Allocation aéronavale | Recommandation |
|---|---|---|---|---|---|---|---|
| c1 | information | local | Présence et surveillance de surface | continuity | non | non | LCS Freedom (suw) |
| f2 | infrastructure | regional | Relevés des fonds, Présence et surveillance de surface | infra, subobs | non | non | groupe infra |
| asw | acoustic | extended | Hélicoptère acoustique équipé (MH-60R), Observation acoustique de bord | subobs, sag, logistics | non | non | Arleigh Burke Flight IIA/III (std), Virginia (std), LCS Freedom (suw), Zeus (std), Lewis and Clark (std) |
| l12 | transit | regional | Protection aérienne, Présence et surveillance de surface | sag | non | non | groupe sag |
| g3 | ship_assist | local | Présence et surveillance de surface | aucun | oui | non | LCS Freedom (suw) |
| a4 | transit | extended | Protection aérienne, Escorte proportionnée | sag, csg, logistics | non | oui | groupe sag |
| e6 | evacuation | regional | Transport de personnes et de matériel, Soutien médical | rescue, arg | oui | non | groupe rescue |
| m6 | mines | local | Lutte contre les mines, Présence et surveillance de surface | channel | non | non | groupe channel |

## Sources

- `navy_index` : [US Navy — Fact Files](https://www.navy.mil/resources/fact-files/), consultée le 2026-11-20
- `cvn` : [US Navy — Aircraft Carriers](https://www.navy.mil/Resources/Fact-Files/Display-FactFiles/Article/2169795/aircraft-carriers-cvn), consultée le 2026-11-20
- `lpd` : [US Navy — Amphibious Transport Dock](https://www.navy.mil/Resources/Fact-Files/Display-FactFiles/Article/2222713/amphibious-transport-dock-lpd/amphibious-transport-dock-lpd/), consultée le 2026-11-20
- `lha` : [US Navy — LHD/LHA](https://www.navy.mil/Resources/Fact-Files/Display-FactFiles/Article/2169814/amphibious-assault-ships-lhdlhar/no/amphibious-assault-ships-lhdlhar/), consultée le 2026-11-20
- `tripoli` : [US Navy — USS Tripoli, About](https://www.surfpac.navy.mil/Warships/USS-Tripoli-LHA-7/About/), consultée le 2026-11-20
- `lcs` : [US Navy — Littoral Combat Ship Class](https://www.navy.mil/Resources/Fact-Files/Display-FactFiles/Article/2171607/littoral-combat-ship-class-lcs/), consultée le 2026-11-20
- `ssn` : [US Navy — Attack Submarines (SSN), mise à jour du 24 novembre 2025](https://www.navy.mil/Resources/Fact-Files/Display-FactFiles/Article/2169558/attack-submarines-ssn/), consultée le 2026-11-20
- `lcc` : [US Navy — Amphibious Command Ships](https://www.navy.mil/DesktopModules/ArticleCS/Print.aspx?Article=2169843&ModuleId=724&PortalId=1), consultée le 2026-11-20
- `epf` : [MSC — Expeditionary Fast Transports](https://www.msc.usff.navy.mil/Ships/Ship-Inventory/Expeditionary-Fast-Transports/), consultée le 2026-11-20
- `esb` : [MSC — Expeditionary Sea Base](https://www.msc.usff.navy.mil/Ships/Ship-Inventory/Expeditionary-Sea-Base/), consultée le 2026-11-20
- `oiler` : [US Navy — Fleet Replenishment Oilers (T-AO), 16 décembre 2025](https://www.navy.mil/Resources/Fact-Files/Display-FactFiles/Article/2222909/fleet-replenishment-oilers-t-ao/), consultée le 2026-11-20
- `take` : [MSC — Dry Cargo/Ammunition Ships](https://www.msc.usff.navy.mil/Ships/Ship-Inventory/Dry-Cargo-Ammunition-Ships/), consultée le 2026-11-20
- `hospital` : [MSC — Hospital Ships](https://www.msc.usff.navy.mil/Ships/Ship-Inventory/Hospital-Ships/), consultée le 2026-11-20
- `avenger` : [US Navy — Mine Countermeasures Ships (MCM), fiche 2020](https://www.navy.mil/Resources/Fact-Files/Display-FactFiles/Article/2171622/mine-countermeasures-ships-mcm/), consultée le 2026-11-20
- `avenger_transition` : [USFFC — Retraits de bâtiments Avenger à Bahreïn, septembre 2025](https://www.usff.navy.mil/Press-Room/News-Stories/Article/4315186/us-navy-decommissions-avenger-class-mine-countermeasures-ships-in-bahrain/), consultée le 2026-11-20
- `mh60r` : [NAVAIR — MH-60R Seahawk](https://www.navair.navy.mil/product/MH-60R-Seahawk), consultée le 2026-11-20
- `mh60s` : [NAVAIR — MH-60S Seahawk](https://www.navair.navy.mil/product/MH-60S-Seahawk), consultée le 2026-11-20
- `mq8_reference` : [NAVAIR — PMA-266, références MQ-8C](https://www.navair.navy.mil/orgterm/PMA-266), consultée le 2026-11-20
- `lcs_suw` : [US Navy — LCS Surface Warfare Mission Package (SSMM, Longbow Hellfire)](https://www.navy.mil/Resources/Fact-Files/Display-FactFiles/Article/2220640/littoral-combat-ships-surface-warfare-mission-package), consultée le 2026-11-20
- `lcs_ssmm` : [NAVSEA — Tir structurel du SSMM sur un LCS Independence](https://www.navsea.navy.mil/Media/News/Article/1916979/successful-structural-test-firing-of-the-lcs-surface-to-surface-missile-module/), consultée le 2026-11-20
- `lcs_dote19` : [DOT&E — Rapport LCS FY2019 (NSM retenu comme arme de bord, distincte des modules)](https://www.dote.osd.mil/Portals/97/pub/reports/FY2019/navy/2019lcs.pdf), consultée le 2026-11-20
- `lcs_dote16` : [DOT&E — Rapport LCS FY2016 (RAM remplacé par SeaRAM sur les Freedom à partir de LCS 17)](https://www.dote.osd.mil/Portals/97/pub/reports/FY2016/navy/2016lcs.pdf), consultée le 2026-11-20
- `lcs_dote25` : [DOT&E — Rapport LCS FY2025 (module ASW abandonné en FY22)](https://www.dote.osd.mil/Portals/97/pub/reports/FY2025/navy/2025lcs.pdf), consultée le 2026-11-20
- `ram` : [US Navy — RIM-116 RAM (Mk 49 et SeaRAM sur LCS)](https://www.navy.mil/Resources/Fact-Files/Display-FactFiles/Article/2168961/rim-116-rolling-airframe-missile-ram/), consultée le 2026-11-20
- `searam_lcs4` : [US Navy — LCS Independence, essais avec SeaRAM (2016)](https://www.navy.mil/Press-Office/Press-Releases/display-pressreleases/Article/2257260/independence-variant-lcs-completes-iote/), consultée le 2026-11-20
- `mq8_retire` : [The Aviationist — Retrait des MQ-8C par la Navy d’ici la fin de l’exercice 2026 (27 octobre 2026)](https://theaviationist.com/2026/10/27/mq-8c-fire-scout-second-life-with-u-s-army/), consultée le 2026-11-20
- `cg` : [US Navy — Cruisers (CG), mise à jour du 23 avril 2025](https://www.navy.mil/Resources/Fact-Files/Display-FactFiles/Article/2169861/cruisers-cg), consultée le 2026-11-20
- `cg_retire` : [Baird Maritime — Retrait de deux croiseurs en septembre 2026, cinq encore en service](https://www.bairdmaritime.com/security/naval/naval-ships/navy-retires-two-ticonderoga-cruisers), consultée le 2026-11-20
- `lsd` : [US Navy — Dock Landing Ship (LSD), mise à jour du 19 juillet 2019](https://www.navy.mil/Resources/Fact-Files/Display-FactFiles/Article/2169901/dock-landing-ship-lsd/), consultée le 2026-11-20
- `ssgn` : [US Navy — Guided Missile Submarines (SSGN), mise à jour du 15 novembre 2023](https://www.navy.mil/Resources/Fact-Files/Display-FactFiles/Article/2169613/guided-missile-submarines-ssgn/), consultée le 2026-11-20
- `tarc` : [US Navy — Cable Laying/Repair Ship (T-ARC), mise à jour du 13 octobre 2021](https://www.navy.mil/Resources/Fact-Files/Display-FactFiles/Article/2232652/cable-layingrepair-ship-t-arc/), consultée le 2026-11-20
- `tags` : [US Navy — Oceanographic Survey Ships (T-AGS), mise à jour du 26 février 2026](https://www.navy.mil/Resources/Fact-Files/Display-FactFiles/Article/2222996/oceanographic-survey-ships-t-ags/), consultée le 2026-11-20
- `ffg62_cancel` : [USNI News — Abandon du programme Constellation (25 novembre 2025)](https://news.usni.org/2025/11/25/navy-cancels-constellation-class-frigate-program-considering-new-small-surface-combatants), consultée le 2026-11-20
- `ffg62_crs` : [USNI News — Rapport du CRS sur les frégates Constellation et FF(X) (6 janvier 2026)](https://news.usni.org/2026/01/06/report-to-congress-on-the-navys-constellation-ffx-frigate-programs), consultée le 2026-11-20
- `kaiser_retire` : [Seapower — Retraits de pétroliers Kaiser en 2026](https://seapowermagazine.org/?p=34239), consultée le 2026-11-20
