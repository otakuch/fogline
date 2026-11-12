# SEUIL : instructions du projet

Ce fichier décrit le projet, ses règles et sa méthode de travail. Lis-le entièrement avant toute modification. Il prévaut sur les maquettes et sur les vidéos déjà produites, car elles montrent d'anciennes versions.

## 1. Le projet en bref

**Nom :** SEUIL en français, FOGLINE en anglais (clé `brand`). La disponibilité juridique du nom n'a pas été vérifié.

SEUIL est un serious game de stratégie en temps réel, inspiré de DEFCON et de Jane's Fleet Command. Le joueur commande des forces dans un scénario fictif sur une carte réelle de la mer de Norvège, de la mer du Nord et de l'Atlantique Nord.

Le jeu entraîne à décider sous incertitude. Il oblige à estimer avant d'agir, à conserver sa liberté d'action et à maîtriser l'escalade. Il s'appuie sur le centre de gravité cognitif (CGC) de l'article de Naully Nicolas, « guerre cognitive », paru dans la Revue diplomatique n° 28 de l'IEGA.

**Public visé :** officiers, cadres de gestion de crise et étudiants en stratégie, en français et en anglais.

**État actuel :** prototype jouable, réalisé dans une seule page HTML. Il sert à tester les mécaniques et ne constitue pas le jeu final.

| Ressource | Emplacement |
|---|---|
| Prototype publié | https://claude.ai/artifact/KaK2ridxo66GrAZPuQUVU7 |
| Dossier de conception | https://claude.ai/artifact/U99GmyMZnFxAMfjAn2JeLf |
| Maquettes d'interface (anciennes valeurs) | https://claude.ai/artifact/HcNzWdmRQuTLhextmHsFQZ |
| Base de scénarios | `proto/scenarios.json`, générée par `proto/gen_db.py` |

## 2. Comment travailler avec Naully

- Réponds en français, de façon concise, sans détailler chaque étape.
- Dis clairement ce qui n'a pas été vérifié. Ne présente jamais un test automatique comme une preuve de plaisir de jeu ou de valeur pédagogique.
- Annonce en une phrase ce que tu vas faire, puis fais-le. Ne demande une confirmation que pour un choix coûteux à refaire, réellement ambigu ou irréversible.
- Termine par le résultat, les limites et, s'il y en a une, une prochaine étape naturelle.
- Signale les décisions qui lui reviennent au lieu de les trancher en silence.
- Quand tu cites un jeu, un article ou une doctrine, vérifie la source et ne prétends pas avoir joué au jeu.

## 3. Garde-fous à ne pas franchir

Ces règles valent même si une demande semble les contourner. Si un besoin les heurte, explique le conflit et propose une version compatible.

1. **Géographie réelle, événements fictifs.** Tout scénario reste signalé comme un exercice fictif. L'étiquette « EXERCICE FICTIF » reste visible à l'écran.
2. **Armes abstraites, noms réels.** Le combat a été décidé par Naully le 4 novembre 2026, avec des valeurs de jeu fictives. Depuis le 7 novembre 2026, Naully autorise les noms réels des plateformes américaines (classes de navires, types d'aéronefs). Leurs valeurs restent fictives, et les navires gardent des numéros fictifs (DDG-1, LCS-1), sans nom de bâtiment réel. N'ajoute aucun paramètre réel d'armement : portée, charge, guidage, vulnérabilité, signature, procédure de tir ou nom d'arme réel (missile, torpille). Les tirs restent génériques.
3. **Pas de mode d'emploi offensif.** La cyberattaque, le sabotage, le brouillage et la désinformation restent décrits par leurs effets sur la décision. N'écris jamais de technique, d'outil, d'exploit ou de recette réutilisable.
4. **Pas de frappe stratégique jouable.** Pas d'arme nucléaire et pas de frappe contre des villes. La destruction n'est jamais un spectacle ni une source directe de points.
5. **Rouge reste non attribué par défaut.** Une vignette peut nommer un État réel seulement si elle est signalée comme fictive. Aujourd'hui, seule l'incursion aérienne parle d'appareils « présumés russes » : cette décision reste ouverte (section 13).
6. **Faux contenus signalés.** Toute vidéo, rumeur ou preuve truquée reste textuelle ou synthétique, fictive et révélée au bilan.
7. **Pas d'évaluation RH.** La note individuelle reste visible par le seul joueur. Un futur mode animateur ne recevra que des données agrégées.
8. **Pas d'aide à la décision réelle.** Le jeu entraîne un raisonnement. Il ne mesure ni la préparation ni l'aptitude d'une unité.
9. **Jauge heuristique.** Le CGC et le score sont des modèles de jeu, pas des mesures scientifiques. Dis-le dans les documents destinés à un public.

## 4. Organisation des fichiers

```
seuil-projet/
├── CLAUDE.md               ce fichier
├── maps/theatre.jpg        carte de fond, 1440 × 900 en coordonnées du jeu
└── proto/
    ├── src.html            source du jeu : textes, moteur, rendu, interface
    ├── th/                 données des théâtres, `vec.json` (côtes vectorielles) et `vec.mjs` qui le génère
    ├── vendor/             MapLibre GL JS 4.7.1 (BSD-3) et three.js r159 (MIT), intégrés à la page
    ├── son-pack.json       sons de la salle en mp3 base64, avec `docs/third-party/SOUND-CREDITS.md`
    ├── gen_db.py           définition éditable des scénarios et des hypothèses
    ├── scenarios.json      base générée par gen_db.py
    ├── milsymbol.js        bibliothèque de symboles APP-6
    ├── geo.json            ports et leurs coordonnées sur la carte
    ├── mask.rle            masque terre et mer, grille de 360 × 225
    ├── build.py            assemble la page publiable
    ├── seuil-prototype.html  page assemblée, à publier
    ├── t.html              même page pour les tests, générée par build.py
    ├── bots.js             stratégies automatiques et fonction playGame
    ├── stress.js           banc d'essai
    ├── ui5.js              parcours complet avec de vrais clics
    ├── uih.js              écran d'accueil : aide, catalogue, entrée en jeu, retour, 390 et 1920 px
    ├── uit.js              tutoriel complet avec de vrais clics
    ├── uig.js              règles de prise en main
    ├── advbot.js           joueur qui ne suit que le conseil, comparé à la référence
    ├── uiv.js              captures de l'interface sur ordinateur et mobile
    ├── uid.js              règles de diplomatie
    ├── uip.js              parcours de patrouille avec de vrais clics, 1440 et 390 px
    ├── patcmp.js           référence contre référence avec patrouilles automatiques
    ├── uigrp.js            groupe tactique, clic droit, raccourcis, contacts, pause automatique, bilan, 1440 et 390 px
    ├── grpcmp.js           référence contre référence qui forme un groupe autour de la frégate
    ├── uiob.js             ordre de bataille, ordre d'opération, fiche d'unité, allure, zoom, 1440 et 390 px
    ├── uimenu.js           menu de partie, 1440 et 390 px
    ├── uiqx.js             exercice rapide, allocation des tirs, esquive, avance rapide
    ├── pace2.js            rythme : crises par partie, première crise, part du temps sans crise ouverte
    └── th/hicoast.json     côtes détaillées OpenStreetMap par théâtre (varints base64), générées par tools/hires.js
    └── dipm.js             mesures de diplomatie par stratégie
    └── uidq.js             bilan « Décision ou chance ? », 1440 px en français et 390 px en anglais
    └── uiv34.js            version 34 : domaines, unités terrestres, force spéciale, hélicoptère, étapes, formations, temps
    └── uiv35.js            version 35 : vues, ordres par domaine, brouillage, cyberattaque, crise publique
    └── ewcmp.js            référence contre référence avec brouillage ou cyberattaque
    └── pt34.js             parcours joué pas à pas avec de vrais clics, à tirage fixe, pour lire chaque écran avant de décider
```

**Dépôt GitHub :** `index.html`, à la racine, est généré par `build.py` pour GitHub Pages. `README.md` présente le projet, `docs/` contient les captures, les vidéos et les licences tierces, `tools/` les générateurs de cartes et `tools/shots.js` les captures. Dépôt : https://github.com/otakuch/fogline ; GitHub Pages sert la branche `main` à https://otakuch.github.io/fogline/ (toute fusion dans `main` met donc à jour le jeu public). `index.html` n'est jamais modifié à la main.

**Captures du README :** `python3 proto/build.py`, puis `node tools/shots.js $PWD fr` et `node tools/shots.js $PWD en`. Elles sont écrites dans `docs/screenshots/fr/` et `docs/screenshots/en/` (13 images chacune, mêmes noms).

**Assembler :**

```bash
cd proto
python3 gen_db.py   # seulement si gen_db.py a changé
python3 build.py
```

`build.py` remplace dans `src.html` les marqueurs `__SND__`, `__VEC__`, `__MAPLIBRE__`, `__THREE__`, `__MILSYMBOL__`, `__IMG__`, `__MASK__`, `__DB__`, `__GEO__`, `__TH__` et `__WORLD__`. Dans `th/theatres.json`, `__THIMG_<théâtre>__` est remplacé par la carte `th/<théâtre>.jpg`. Ne modifie jamais `seuil-prototype.html` à la main.

**Prérequis :** Python 3, Node.js et Playwright avec Chromium.

**Sources :** si ce dossier n'est pas disponible dans la conversation, demande `seuil-fogline.zip` à Naully. Ne reconstruis pas les sources à partir de la page publiée sans l'accord de Naully.

**Reconstruction du 7 novembre 2026 (accord de Naully) :** l'espace de travail a été réinitialisé. `src.html` et toutes les données ont été extraits de la version publiée (1794001786-8347), et `build.py` redonne exactement cette page. `gen_db.py` à jour est perdu : `scenarios.json` devient la source des scénarios jusqu'à ce qu'il soit restauré (`gen_db.ancien.py` date du 5 novembre, avant les théâtres). Scripts restaurés : `bots.js`, `stress.js`, `ui5.js`, `uih.js`, `uit.js`, `uip.js`, `patcmp.js`, `mkt.js` ; repris tels quels de l'archive du 5 novembre, à vérifier avant usage : `advbot.js`, `dipm.js`, `uib.js`, `uid.js`, `uig.js`, `uiv.js`. Perdus : `uis.js`, `uiw.js`, `uiq.js`, `uim.js`, `uim2.js`, `uia.js`, `uic.js`, `scr.js`, `pace.js`.

**Restauration du 8 novembre 2026 :** le dépôt GitHub contenait le `gen_db.py` du 6 novembre. Il redonnait exactement le `scenarios.json` de cette date ; les seuls écarts avec la base actuelle étaient le câblier et le budget de `d3` et `e3` (5.17 ter), ajoutés en fin de fichier. `gen_db.py` redonne maintenant la base actuelle à l'identique (contenu comparé) et redevient la source des scénarios. Scripts récupérés du dépôt, non relancés sur la version 30 : `uis.js`, `uiw.js`, `uiq.js`, `uim.js`, `uim2.js`, `uia.js`, `uic.js`, `scr.js`, `pace.js` ; `uib.js` et `uid.js` reprennent la version du dépôt, plus récente que l'archive.

## 5. Règles de jeu actuelles

Le code fait foi. Ces valeurs doivent rester à jour dans ce fichier et dans le dossier de conception.

### 5.1 Déroulement

1. Écran d'accueil : carte vivante en fond, langue et son en haut à droite. Sans partie enregistrée, le bouton principal lance le tutoriel. Ensuite : nouvelle opération, reprise, tirage au hasard, tutoriel, aide et légende.
2. Choix du théâtre sur une carte du monde, puis du secteur. Catalogue filtrable par situation, domaine et niveau, ou tirage au hasard.
3. Briefing : situation, premiers objectifs, hypothèses, niveau de commandement et forces recommandées. Les options d'exercice sont repliées.
4. Lecture de l'ordre de bataille attribué (forces fixes, voir 5.17 quater).
5. Changement de situation : certaines hypothèses cèdent et les achats sont figés.
6. Partie, en 3 phases. Un ordre d'opération révèle les nouveaux objectifs.
7. Bilan : score, étoiles, hypothèses, chaîne de décision, crises, alertes, contacts et rejeu sur la carte.

### 5.2 Temps et ressources

- Un tour dure 30 secondes simulées. Local : 16 tours (8 min à x1) et 2 crises simultanées. International : 22 tours (11 min à x1) et 3 crises simultanées. `gen_db.py` multiplie par `LONG` (1,6) les phases, le script et les présences requises, sauf pour le tutoriel.
- **Rythme (`calm`, `CALM`) :** une nouvelle crise attend 60 s après le début de la précédente et 30 s après une fin de crise. Une seule démarre par tour. Les crises en attente passent après celles qu'un objectif exige. Dans les 2 derniers tours, seules ces dernières sortent encore.
- Vitesses x1, x2 et x4, et avance rapide × 8 jusqu'au prochain événement (bouton ⏭, ou « Avancer jusqu'au prochain événement » dans le panneau quand aucune crise n'est ouverte). L'avance rapide s'arrête pour une crise, une alerte du renseignement, un aléa ou une demande, pas pour un simple contact ni un signal. En commandement complet, la pause dispose d'une réserve de 90 secondes réelles, sauf en horloge idéale. En commandement guidé, elle est illimitée.
- 4 jetons par tour, non reportables. CGC sous 40 : −2. CGC sous 55 : −1. CGC à 75 ou plus : +1 un tour sur deux. Réseau de commandement coupé : −1, minimum 1.
- Déplacer une unité est gratuit. Collecter une preuve, décider, tirer ou coordonner coûte généralement 1 jeton.
- Échelle d'affichage : 1 unité de carte vaut 1,7 mille. Ce sont des valeurs de jeu.

### 5.3 Trois états à surveiller

- **Infrastructures :** 0,5 × minimum + 0,5 × moyenne des câbles et des sites.
- **Options :** Veille, Air, Mer, Réparer, Cyber et Parole. Chacune n'existe que si le moyen réel est disponible et non suspendu.
- **Seuil :** `max(1, 4 − floor(tension / 1,4))`. La partie s'arrête si la tension atteint 5,6.

Point de contrôle à chaque fin de phase : infrastructures à 60 % ou plus et au moins 3 options.

### 5.4 Centre de gravité cognitif

Trois piliers de 0 à 100 : Sécurité épistémique (`se`), Cohésion sociale (`cs`), Résilience institutionnelle (`ri`).

`CGC = 0,5 × min(piliers) + 0,5 × moyenne(piliers)`

Paliers : à partir de 75 Cohérent, de 55 Contesté, de 40 Fracturé, en dessous Paralysie délibérative. Si aucune crise n'a été perdue pendant le tour et que le CGC est sous 60, le pilier le plus bas gagne 3 points.

### 5.5 Une seule boucle pour toutes les crises

Alerte éventuelle, dossier d'hypothèses et de preuves, décision, effets, vérité au bilan. Deux preuves de même source ne comptent qu'une fois.

| Type (`CR`) | Hypothèses | Délai | Réponses |
|---|---|---|---|
| `incursion` | sondage, erreur, feinte | 60 s | A escorter, B force, C radar |
| `cyber` | crime, etat, faux | 55 s | isoler, chasser, contre-attaquer |
| `desinfo` | manip, vraie, malcomp | 45 s | réfuter, point factuel |
| `sar` | detresse, diversion | 70 s | unité navale, sauvetage civil |
| `site` | reco, amateur, fausse | 60 s | sécuriser avec une unité |
| `jam` | hostile, panne | 3 tours | repli, localiser l'émetteur |
| `sabotage` | fiche du navire | aucun | chasser, arraisonner, tirer |
| `ghost` | fiche du navire | sortie de zone | traquer, pavillon, arraisonner |
| `sub` | sousmarin, bio, epave | selon la vérité | bouées, sonar, presser, classer, neutraliser |
| `swarm` | pistes | vagues | autoriser, classement rapide ou strict |
| `salvo` | pistes | vagues | autoriser, placer une défense |
| `raid` | fiche des navires | retrait après 170 s | tirer, aveugler, repositionner |
| `seize` | resolu, revend, embusc | 110 s | action directe, négociation, isolement |
| `mine` | reel, partiel, bluff | 90 s | déminer, fermer, maintenir |
| `evac` | calme, tendu, hostile | 120 s | civil, mer, force spéciale |
| `seabed` | sonde, reco, sabot | 100 s | inspecter, pré-positionner, dénoncer |
| `mirror` | defensif, test, offensif | 60 s | expliquer, revenir à Avertir, maintenir |

La table `EFF` donne les effets `[SE, CS, RI, tension, infrastructure, issue]`. Une issue de 0,5 ou plus compte comme réussie. Crise perdue ou mal traitée, faux positif et cascade doivent rester lisibles dans le bilan.

### 5.6 Unités et achats

Plus d'achat depuis le 7 novembre 2026 : chaque mission fixe son ordre de bataille (`rec`, voir 5.17 quater). Les coûts de `UT` ne servent plus qu'aux tests. Toujours disponibles : liaisons de repli, message préparé, seconde source.

| Clé | Unité | Coût | Max | Vitesse | Capteur | Armes et limites |
|---|---|---|---:|---:|---:|---|
| `recon` | Reconnaissance | 12 | 2 | 42 | 105 | Autonomie 110 s, 6 bouées |
| `drone` | Drone | 7 | 2 | 20 | 62 | Dépend du satellite |
| `armed` | Drone armé | 10 | 2 | 24 | 50 | 2 tirs, dépend du satellite |
| `patrol` | Patrouilleur | 10 | 2 | 18 | 55 | Naval, 2 tirs, défense 5 |
| `frigate` | Frégate | 18 | 1 | 26 | 85 | Naval, 4 tirs, défense 10, sonar |
| `fighter` | Chasseurs | 12 | 1 | 95 | 48 | Autonomie 70 s, 3 tirs, défense 3 |
| `repair` | Réparation | 10 | 1 | 14 | 30 | 1 point par seconde à proximité |
| `sof` | Force spéciale | 14 | 1 | 55 | | Emplois limités, voir 5.15 |
| `team` | Équipe cyber | 10 | 1 | | | Hors carte |
| `analysis` | Cellule d'analyse | 5 | 1 | | | Analyse plus rapide, première gratuite |
| `comm` | Cellule de communication | 6 | 1 | | | Première prise de parole gratuite |
| `ally` | Patrouilleur allié | | | 18 | 55 | International, arrive après 1 tour, reste 4 tours |

### 5.7 Détection, radar et posture

- **Radar actif :** portée complète, mais Rouge voit l'unité.
- **Silence radar :** portée × 0,45. Un saboteur ne remarque l'unité qu'à 14 de distance, contre 45. L'unité ne peut pas intercepter.
- **Postures :** Avertir (départ), Contraindre, Engager. Changer coûte 1 jeton et demande une autorisation de 8 s, 16 s sans réseau de commandement. Une action qui exige une posture plus dure reste cliquable : son libellé annonce le passage de posture, elle coûte 1 jeton de plus et s'exécute à l'autorisation. Si elle devient impossible entre-temps, seul son propre jeton est rendu. Contraindre ajoute 0,06 de tension par tour, Engager 0,12.
- **Arraisonner :** portée 34, durée 8 s. Avec base légale, posture Avertir. Sans base légale, posture Contraindre et coût politique plus élevé. La vérification du pavillon établit la base légale.

### 5.8 Combat

- **Tir offensif :** posture Engager, 1 jeton, portée 170. Le tir atteint avec une chance de 0,65 avant pénalités.
- **Tir hostile :** portée 175. Un tir non intercepté touche avec une chance de 0,72 (0,62 pour un adversaire novice et 0,80 pour un expert, en exercice rapide), moins 0,12 si l'unité visée esquive. Tirer révèle la position du raider.
- **Interception :** automatique, sans posture, par une unité au radar actif ayant une réserve de défense à proximité. Chance de 0,72, moins les pénalités d'arme. Une tentative par missile.
- **Raid (`raidOut`) :** issue = 1 − coups reçus / (2/3 des missiles adverses, `c.nm`). Le raid est repoussé si un tiers des missiles au plus touche : 2 sur 6 pour un navire, 4 sur 12 pour deux. Un raid encore en cours à la fin de la partie, depuis 60 s au moins, est jugé sur les coups déjà reçus.
- **Dégâts :** 50 sur une unité, 25 pour un drone d'essaim. Une unité à 0 est perdue et non remplacée. 11 sur un site, un câble ou un convoi touché par un missile.
- **Pénalités d'arme :** système de combat compromis 0,3, temps et position douteux 0,2.
- **Escalade :** tirer le premier ajoute 0,6 de tension. Toucher un civil ajoute 1,5 et coûte 15, 15 et 8 points de piliers.
- **Cyber offensif :** la contre-attaque exige Contraindre et l'équipe cyber. Contre un acteur étatique, elle retire une opération à Rouge. Contre un faux positif, elle coûte très cher. L'aveuglement prive un adversaire de tirs pendant 25 s.
- **Directeur :** après un premier tir ou à un seuil de 2 ou moins, de nouveaux raids et salves peuvent survenir.

### 5.8 bis Symbologie

**Par défaut depuis le 10 novembre 2026 (décision de Naully, version 32) : symboles V2 de la charte pour les navires et contacts (`SYM.ships = 'v2'`, voir 5.23) ; le reste suit l'APP-6.** Ancien défaut du 7 novembre 2026, toujours disponible : symboles OTAN classiques APP-6 pour tout, navires compris (`SYM.ships = 'nato'`, `natoShips`, clé `seuil.shipsym`). Navires amis : FF frégate (`120204`), PG patrouilleur (`120502`), AR réparation (`130111`), convoi ami marchand (`140101`). Contacts : identité selon ce que le joueur sait (`shipSidc`), en attente, inconnu, suspect, neutre ou hostile. Échelons sur les unités hors carte (`ech`) : force spéciale Ø équipe (`11`), équipe cyber, cellule d'analyse et de communication •• section (`13`). La légende garde un bouton pour revenir aux losanges du jeu sur les navires. **Ancienne règle, toujours disponible en option :** décision de Naully du 5 novembre 2026. Tous les navires sont des losanges propres au jeu (`drawDia`, `shipTone`) et non des symboles APP-6. Bleu : votre camp (frégate, patrouilleur, réparation, convoi). Gris : navire déclaré. Gris creux : contact sans transpondeur non identifié. Rouge : cible, jugée suspecte ou hostile. La couleur reflète ce que le joueur sait et ne révèle la vérité qu'au bilan. Attention : dans l'APP-6, le losange désigne l'identité hostile. Le reste ci-dessous concerne les avions, les sous-marins, les sites et les unités non navales.

Les symboles suivent l'APP-6(E), NATO Joint Military Symbology. Ils sont dessinés par la bibliothèque milsymbol 3.0.5 (licence MIT), intégrée à la page, avec des SIDC de 30 chiffres en version 13. Les fonctions sont `sidc`, `unitSidc`, `shipSidc`, `symOf`, `symURL`, `drawSym` et `showLegend`.

- **Identité :** elle montre ce que le joueur sait, jamais la vérité avant le bilan. AIS déclaré : neutre. Sans AIS, aucune preuve : en attente. Sans AIS, avec preuve : inconnu. Estimation automatique hostile au-dessus de 60 % : suspect. Classement du joueur : neutre, suspect ou hostile selon l'hypothèse.
- **Contexte :** réalité, chiffre 0. Le contexte exercice ferait porter à l'hostile le cadre ami de Faker et fausserait l'apprentissage. L'étiquette « EXERCICE FICTIF » reste affichée.
- **Non concernés :** les câbles, bouées, cercles de signal et zones restent des repères du jeu.
- **Ajout d'un symbole :** vérifie le code d'entité dans `milsymbol`, puis ajoute-le à la légende.
- **Limite :** le texte officiel de l'APP-6(E) n'a pas été consulté. Avant toute diffusion institutionnelle, fais valider les symboles et les choix d'identité par une personne qui dispose du document.

### 5.9 Score

```
C = justesse des estimations, par score de Brier
D = moyenne des issues − 0,1 × visites à tort − 0,1 × tirs à tort − 0,05 × dégâts − 0,08 × pertes
T = 1 − charge de coordination / 3
O = moyenne des options / 6
eng = part des crises réellement traitées (× 1,25, plafonnée à 1)
P = (0,35 C + 0,30 D + 0,15 T + 0,20 O) × (0,3 + 0,7 eng)
MP = 0,7 × objectifs atteints + 0,3 × qualité des points de contrôle
MS = missions secondaires réussies / 3
S = 1000 × (0,36 P + 0,22 MP + 0,14 MS + 0,10 MO + (0,14 × CGC moyen + 0,04 × cohésion finale) / 100 × (0,5 + 0,5 eng))
MO = min(1, (0,5 × moral moyen par tour + 0,5 × moral le plus bas) / 80) × (0,5 + 0,5 eng)
Sans coalition : 0,18 × CGC moyen au lieu de 0,14 CGC + 0,04 cohésion.
# Tutoriel, sans diplomatie : 0,20 × CGC moyen à la place de la parenthèse
```

- **Mission réussie :** tous les points de contrôle tenus, aucune consigne rompue (`isGuard` : objectifs tirés sauf `identify`) et au moins 80 % des tâches (`WIN_SHARE`). Une tâche « clore » dont la crise n'a jamais eu lieu est sans objet (`st === 3`, `objNA`) et sort du total ; si la crise est survenue moins de fois que demandé et toujours maîtrisée, la tâche est atteinte.
- **Fin de partie :** une crise ouverte depuis moins de 60 s ne fait pas échouer la tâche « clore » qui l'attend (`objNA(true)`).
- **Plafonds :** 250 si le seuil 1 est franchi, 550 si la mission échoue, 650 si elle réussit avec un CGC final sous 40 ou un moral final sous 35.
- **Verdicts :** Victoire cohérente (mission réussie, CGC final à 55 ou plus), Victoire fragile (mission réussie, CGC de 40 à 54, ajouté en version 31), Syndrome de Syracuse (mission réussie, CGC sous 40), Défaite lucide, Effondrement, Seuil 1 franchi. Chaque verdict a une phrase d'explication au bilan (`v.*.d`). Le score et les étoiles ne dépendent pas du libellé.
- **Étoiles :** 4 pour tous les objectifs, au moins 2 missions secondaires CGC à 55 ou plus et moral final à 60 ou plus. 3 pour une mission réussie. 2 pour au moins la moitié des objectifs. 1 pour au moins un objectif. En commandement guidé, le maximum est 3.

### 5.10 Hypothèses et changement de situation

`drawAssumptions` utilise un générateur séparé, pour que le même tirage donne les mêmes changements. Le nombre d'hypothèses qui cèdent vaut la difficulté du scénario, de 1 à 3. Si au moins deux cèdent, la dernière reste cachée. Une partie sur quatre ajoute une bonne nouvelle.

Hypothèses disponibles : `info.sources`, `info.late`, `info.share`, `comm.delay`, `comm.sat`, `comm.pnt`, `comm.c2`, `ally.slow`, `ally.none`, `sup.naval`, `sup.air`, `sup.fuel`, `sup.ana`, `sup.weap`, `adv.early`, `adv.double`, `adv.cycle`, `adv.dep`, `adv.weap`, `mis.zone`, `mis.extra`, et les bonus `pos.ally`, `pos.token`, `pos.calm`.

**Horloge idéale :** `D_(x)` réduit les délais à 0,5 s au maximum. Elle sert à comparer et ne représente jamais la réalité.

### 5.11 Prise en main

- **Estimation automatique :** toute décision qui repose sur un dossier classe l'hypothèse en tête si le joueur n'a rien choisi. En commandement complet, il peut encore classer à la main avant.
- **Commandement guidé, réglage par défaut :** conseil sur demande depuis la version 31 (bouton « Demander un conseil », voir 5.22), pause automatique à chaque crise et à chaque nouvelle phase, reprise du temps dès qu'un ordre est donné, pause illimitée, coordination automatique (`S.debt` reste à 0), confiance publique sur une seule jauge. Silence radar et classement manuel sont masqués. 3 étoiles au plus.
- **Commandement complet :** pause de 90 s, silence radar, coordination et classement manuel. Seul ce niveau donne la 4e étoile.
- **Conseil (`advise`, `applyAdvice`, `advOn`, `ADVM`, `ADVK`) :** il ne doit jamais lire `truth`. Il part des preuves, des hypothèses et de ce qui est visible, et propose une action à la fois. Le bilan indique combien de décisions conseillées reposaient sur une hypothèse fausse.
- **Tutoriel (`tuto`, tableau `COACH`) :** scénario de 5 tours, exclu du catalogue et du tirage. Une étape demande une action, et le temps n'avance que dans les étapes `run`. L'hypothèse choisie ne doit pas retarder les ordres, sinon le temps arrêté bloque le déplacement.
- **Catalogue :** il s'ouvre sur « Accessible » tant qu'aucun scénario n'a été terminé.

### 5.12 Diplomatie

- **Partenaires :** Norvège et Royaume-Uni en local, avec Danemark et Islande à l'international. Le tutoriel n'a pas de diplomatie. Chaque relation va de 0 à 100. Départ : 62, 60, 58 et 55.
- **Cohésion :** 0,5 × minimum + 0,5 × moyenne des relations. À 70 ou plus : +1 en cohésion sociale et en résilience chaque tour. Sous 35 : −1 et −2. Un partenaire retiré retire aussi 1 point de résilience par tour.
- **États :** Soutien à partir de 60, Prudence à partir de 35, Réserve en dessous, Retrait sous 15. Le retour exige une relation de 25.
- **Réactions :** tirer le premier, toucher une mauvaise cible, arraisonner à tort ou sans base légale, réussir un arraisonnement légal, ouvrir le canal et résoudre ou perdre une crise près d'un partenaire modifient les relations. Tous les partenaires ne réagissent pas de la même façon.
- **Effets entre pays :** une variation d'au moins 6 touche aussi les voisins. Chaque tour, les relations se rapprochent de 5 % de la moyenne. Un retrait retire 4 points aux autres.
- **Actions (`dipActions`) :** Consulter coûte 1 jeton, une fois par tour et par partenaire, et donne +7. Un soutien coûte 1 jeton et 5 points de relation, avec 2 tours d'attente. Norvège : patrouilleur allié, à partir de 50. Royaume-Uni : preuves sur 2 crises, à partir de 40. Danemark : droit de visite de 60 s, à partir de 50. Islande : ravitaillement aérien, à partir de 45.
- **Canal avec l'adversaire :** possible à partir de 0,4 de tension, tous les 2 tours. Il retire 0,35 de tension et change les relations. Dans 40 % des cas, l'adversaire prépare une action. Ce risque n'est révélé qu'au bilan.
- **Demandes :** 18 % de chance par tour en local et 26 % à l'international, avec 30 s pour répondre. Certaines opposent deux partenaires. Une proposition adverse d'accord séparé peut viser le partenaire le plus fragile. Sans réponse : −3 pour tous et −2 en résilience.
- **Conseil :** il protège le partenaire le plus fragile, sans lire la vérité. Le choix conseillé peut donc être mauvais pour le plan.
- **Limite :** les réactions des pays sont des valeurs de jeu fictives. Elles ne décrivent pas la position réelle de ces États.

### 5.13 Interface de jeu

- **Inspiration :** principes généraux des postes de situation (carte centrale, situation, options comparables). Ne reprends ni le logo, ni le nom, ni la charte, ni les écrans d'un produit existant.
- **Carte :** plein écran, fond désaturé, centre utile calculé par `vc` pour rester dans la zone libre. Le bandeau « EXERCICE FICTIF » reste en haut de l'écran.
- **Barre haute :** titre de la mission, tour, puis indicateurs avec état coloré et infobulle. Une variation de jauge s'affiche 3,4 s à la place du libellé (`hudDelta`). Services SAT, PNT et C2 seulement s'ils sont dégradés.
- **Panneau gauche :** onglets Crises (clé `sit`), Forces, Contacts, Coalition et Suivi (`leftTab`). L'onglet Crises montre d'abord les crises et alertes, puis « à traiter », puis l'ordre d'opération. Les nouvelles crises rouvrent cet onglet en commandement guidé. Hauteur ajustée au contenu ; 340 px de large au moins au niveau Complet.
- **Dossier à droite :** il n'apparaît qu'avec une sélection. Il suit l'ordre estimer, vérifier, décider. Sur ordinateur, le compte à rebours du haut de la carte ne montre que les crises autres que celle du dossier ouvert.
- **Réponses (`actsHtml`, `coaMeta`) :** chaque carte indique le coût, la faisabilité et le risque d'escalade. En guidé, elle ajoute les hypothèses pour lesquelles la réponse convient (« Adapté si », « Adapté à toutes les hypothèses », « Réponse partielle »), le coût en infrastructure, les emplois restants de l'équipe cyber et, si le joueur l'a demandé, la pastille « Conseillé ». Ces indications lisent les preuves et la table `EFF`, jamais la vérité.
- **Fenêtres :** les panneaux gauche et droit se réduisent, se redimensionnent à la souris ou au clavier et se rétablissent par double clic. La taille est gardée dans `seuil.win` (`WIN`, `applyWin`, `saveWin`). Sur téléphone, le dock réduit les fenêtres.
- **Couches (`LAY`) :** Capteurs, Trafic, Vols et Noms.

### 5.13 bis Identité de l'accueil

L'anglais est la langue par défaut et FOGLINE le titre affiché ; un choix enregistré dans `seuil.lang` reste respecté. L'accueil adopte une lecture d'observation monochrome : carte grise, grain, balayage lent, repères d'angle (`.brk`), texte à chasse fixe, ambre pour ce qui reste à estimer, vert pour un théâtre déjà joué. Les étiquettes affichent de vraies données du jeu, jamais du décor. La référence est le principe du générique de Person of Interest (Imaginary Forces) : ni sa police, ni son code couleur, ni ses libellés, ni ses images ne sont repris. Les écrans de partie gardent l'interface de situation.

### 5.13 ter Moteurs de rendu et placement

Trois moteurs se partagent l'écran. Le moteur de jeu reste indépendant et ne connaît aucun d'eux.

- **MapLibre (`baseInit`, `baseSync`) :** dessine sous le canevas la terre, les frontières et le quadrillage, à partir de Natural Earth 1:10 m (`world-atlas`). Les géométries sont projetées dans le repère 1440 × 900 du jeu. `fakeLL` les convertit en fausses longitudes et latitudes, de sorte que la projection de Mercator redevient linéaire et que la caméra du jeu s'applique sans déformation. Zoom maximal : 8.
- **Canevas (`draw`) :** unités, navires, zones, symboles et étiquettes. Si MapLibre échoue ou ne charge pas en 6 s, `drawVecFallback` trace les mêmes côtes sur le canevas.
- **three.js (`globeStart`) :** globe de l'accueil, arrêté dès qu'on quitte l'écran. Sans WebGL, l'accueil revient à la carte plate.
- **Chevauchements (`spreadSyms`, `flushLabels`) :** seul l'affichage change, jamais les positions du jeu. Les symboles qui se recouvrent s'écartent de 30 px au plus, avec un trait de rappel vers leur position réelle. Les sites et l'objet sélectionné ne bougent pas. Les étiquettes essaient plusieurs emplacements par priorité. Noms de lieux, câbles et traces anciennes disparaissent s'il n'y a plus de place ; les priorités 3 et plus restent toujours affichées.
- **Côtes fines (`landGrid`, `offLand`) :** à partir d'un zoom de 1,3, un navire qui croise sur une côte fine est affiché sur l'eau la plus proche, à 24 unités au plus. La navigation reste calculée sur le masque de 360 × 225.
- **Clics (`pickAt`) :** ils visent la position affichée.

### 5.13 quater Compte à rebours de décision

Le briefing propose deux modes, gardés dans `seuil.timer`. **Facile :** 90 s par décision, pause à chaque crise en commandement guidé. **Difficile :** 30 s par décision, sans pause automatique, avec une réserve de pause de 90 s même en guidé. Ce mode ne dépend pas du niveau du scénario (`diff`).

- **Crises concernées (`DECIDE`) :** `incursion`, `cyber`, `desinfo`, `sar`, `site`, `seize`, `mine`, `evac`, `seabed`, `mirror`. Les autres gardent leur rythme propre : `jam`, `sub`, `swarm`, `salvo`, `raid`, `ghost`, `sabotage`.
- **Hypothèse `adv.cycle` :** elle réduit le délai en facile. En difficile, le délai ne descend jamais sous 30 s.
- **Affichage (`renderClock`) :** le délai le plus court reste visible en haut de l'écran, ambre puis rouge, avec un son par seconde dans les 10 dernières. Un clic ouvre la crise. Il suit le temps simulé : il s'arrête en pause et va plus vite en x2 et x4.
- **Tutoriel :** il garde ses délais.

### 5.13 quinquies Faux positifs et zones de recherche

- **Crise `alarm` :** hypothèses `fauxp` (70 %) et `vrai` (30 %). Réponses : classer sans suite, ou répondre. Répondre à tort compte comme une erreur (`falseEng`). Classer une vraie alerte coûte très cher. 2 alertes prévues en local et 3 à l'international, si le rythme le permet, plus le tirage du directeur.
- **Faux échos (`falseEcho`) :** des cercles de signal sans navire. Les suivre coûte un jeton et se termine par « écho sans objet ».
- **Bilan :** une ligne compte les faux positifs écartés et traités à tort.
- **Zones :** signal 110 à 150, sous-marin 150, fantôme 140, mines 75, câble 70, alerte de sabotage 110. Les capteurs ne changent pas : chercher prend donc plus de temps. Limites d'emploi relevées : `recon` et `fighter` 8, 6, 5 ; `team` 9, 8, 6.

### 5.13 sexies Lisibilité et niveau Simple

Inspiration, d'après des sources écrites seulement : DEFCON (carte vectorielle, pas de production, un niveau d'alerte central) et ICBM (ordre court : sélectionner, choisir, cliquer ; moins de micro-gestion). Aucun de ces jeux n'a été joué.

- **Symboles :** la forme donne le milieu et la couleur le camp (`mark`, `markURL`). Losange : navire. Triangle : aéronef. Triangle pointe en bas : sous-marin. Carré : site. Rond : force spéciale. Décision de Naully du 5 novembre 2026 : les symboles APP-6 sont actifs par défaut (`SYM.app6`, `seuil.app6`). Depuis le 10 novembre 2026, les navires suivent les symboles V2 de la charte (5.23) ; OTAN et losanges restent des options. Les marques simples restent une option de la légende.
- **Carte, afficher par exception :** cercle de capteur de l'unité sélectionnée seulement, trafic neutre en petits points, routes et avions civils dans la couche Trafic détaillé, étiquette d'un site ou d'un câble seulement s'il est endommagé ou si l'on zoome. Un seul bouton Couches.
- **Niveau Simple (`guided`, par défaut) :** pas de diplomatie ni de réglage de posture, une seule action Vérifier, l'hypothèse la plus probable sans barres, une crise de moins en parallèle, panneau gauche réduit à Situations et Forces. La barre haute garde seuil, jetons, infrastructures et confiance ; options et services n'y paraissent qu'en cas de problème.
- **Niveau Complet :** garde tous les systèmes. Les tests `stress.js` jouent ce niveau, sauf avec `SIMPLE=1`.

### 5.13 septies Objectifs variables et missions sans câble

- **Objectifs tirés à chaque partie (`drawExtras`) :** 1 en local, 2 à l'international, en phases 2 et 3, comptés dans le total des objectifs. Types (`GUARD`) : garder un site au-dessus de 70 %, ne pas ouvrir le feu (hors scénarios de combat), aucune unité touchée, aucune réaction à tort, garder le seuil à 3 ou plus, identifier des contacts sans transpondeur. Ils réussissent en fin de phase s'ils n'ont pas été rompus, sauf l'identification, qui doit être atteinte.
- **Missions sans câble :** tag `sanscable`, `n1`, `n2`, `g7`, `a7`, `e7`, `m7`. Sans câble, `sabotage` et `seabed` deviennent `ghost`, et `anchorPt` remplace les tirages sur les câbles.
- **Lecture retenue :** « ne pas utiliser les câbles » est lu comme « des missions qui n'en dépendent pas ». Autre lecture possible, à confirmer : une consigne interdisant au joueur d'utiliser ces liaisons.

### 5.13 octies Son

Fond de salle en 3 boucles (`room`, `srv`, `ops`), mixé selon l'état : accueil, briefing, partie, pause, bilan. La charge sonore vaut `0,55 × crises ouvertes / 3 + 0,45 × tension / 4,2` et ne lit jamais `truth`. Le bouton a trois états : ambiance, effets seuls, coupé (`seuil.snd`, `sndCycle`, `sndKey`). Décision de Naully du 6 novembre 2026 : en partie, le fond de salle et les bruits d'ambiance sont nettement plus discrets qu'à l'accueil (table `M` de `sndTick`, `sndAmb(i,game)`). Les vidéos de démo sont mixées hors ligne par `tools/son/mix_video.py` avec les mêmes réglages.

- **Crises :** `sub` et `seabed` sonar, `jam` parasite et souffle, `cyber` accroc, `desinfo` téléscripteur, `sar`, `evac` et `mine` radio, `alarm` réglage radio. Compte à rebours : `tick`, `tick2`.
- **Garde-fous :** aucun bruit d'arme ni d'explosion. Les bruits passent par `Math.random`, jamais par `R()`. Le son ne porte aucune information exclusive.
- **Test :** `uia.js` contrôle le chargement, les modes et les événements, pas la qualité à l'oreille.
- **Avant diffusion :** confirmer sur Freesound les licences de kyles 452454, thaighaudio 349689, dergraph 832122 et cloyen 800349.

### 5.13 nonies Parcours de patrouille

Demande de Naully du 6 novembre 2026. Dans l'onglet Forces, sélectionner une unité sur carte affiche « Tracer une patrouille ». Chaque clic sur la carte ajoute un point (12 au maximum), puis « Lancer » démarre la boucle (2 points au minimum). Boutons : retirer le dernier point, annuler, redessiner, arrêter.

- **Fonctions :** `patrolPt`, `patrolStart`, `patrolStop`, `patrolStep`, `patrolHtml`, variable `patrolEdit`. Champs de l'unité : `u.patrol`, `u.pi`.
- **Points :** pour une unité navale, un point sur terre est recalé sur la mer la plus proche du masque, puis sur l'eau visible de la côte fine (`offLand`, 12 au plus). Un point que la mer ne permet pas d'atteindre (route nulle ou arrêtée à plus de 14) est refusé, avec un message.
- **Tracé (`patrolLine`) :** pour un navire, la boucle et l'aperçu suivent la route maritime entre les points, et non la ligne droite. Les points restent numérotés.
- **Liberté de mouvement (`covers`), décision de Naully du 7 novembre 2026 :** une unité navale fait progresser un objectif de présence (`ob.patrol`, `ob.lane`) dès que son rayon de détection touche la zone, à 90 % (`dist < r + 0,9 × sensorR`). Elle n'a plus à entrer dans le cercle. La zone devient pleine et nomme les unités qui la couvrent. Le silence radar réduit donc cette couverture. Le conseil, le tutoriel et les scripts suivent la même règle.
- **Priorité :** la patrouille ne reprend que si l'unité n'a ni trajet, ni tâche, ni poursuite, ni escorte, ni arraisonnement, ni retour à la base, ni attente. Après une mission, elle reprend seule. Un nouvel ordre de déplacement l'arrête. Drone et drone armé attendent si le satellite est coupé.
- **Coût :** gratuit, comme tout déplacement. La patrouille n'ajoute aucune règle de détection : elle répète seulement des déplacements.
- **Carte :** boucle bleue, points numérotés pour l'unité sélectionnée, tracé en cours en ambre.
- **Tests :** `uip.js` (tracé avec de vrais clics, passages aux points, arrêt après ordre, couverture dedans, au bord et au loin, 390 px, textes) ; `bots.js` accepte `mkBot({patrol:true})`, qui trace une boucle autour de la zone. Mesure du 7 novembre, niveau Simple, 24 scénarios × 1 tirage : référence 728 et 75 %, avec patrouille 736 et 79 %, objectifs de présence 6 sur 6 dans les deux cas. Écart non significatif.
- **Limite :** comme les déplacements ordinaires, une route navale frôle parfois une case de côte du masque (environ 1 % des pas dans `uip.js`). Défaut de lissage de `route`, antérieur à la patrouille.

### 5.14 Théâtres

Six théâtres (`TH_ORDER`) : Atlantique Nord (`natl`), Europe (`eu`), golfe de Guinée (`gn`), golfe d'Aden et mer Rouge (`ad`), Méditerranée orientale (`em`), détroit de Malacca (`ml`). `useTheatre(id)` change carte, masque, sites, câbles, secteurs, trafic et partenaires. Hors Atlantique Nord, les partenaires sont désignés par leur rôle. Les données sont dans `proto/th/theatres.json`, les cartes dans `proto/th/`. Géographie réelle, événements fictifs, aucun conflit réel ni groupe nommé.

### 5.15 Forces spéciales et limites d'emploi

- **Unité `sof` :** 14 points, vitesse 55. `USES` limite les emplois selon la difficulté 1, 2 ou 3 : `sof` 3, 2, 1 ; `fighter` 5, 4, 3 ; `recon` 5, 4, 3 ; `team` 6, 5, 4. La fiche (`unitSpec`) et le bilan (`useEnd`) les affichent.
- **Crise `seize` :** reprise d'un site ou d'un navire. Hypothèses résolu, revendication, embuscade ; délai 110 s. Elle n'apparaît que si la force spéciale est présente. `sc.req` impose une unité à un scénario. L'hypothèse `sup.sof` retire une partie de cette capacité.

### 5.16 Crises de profondeur

Ces crises s'inspirent de thèmes de titres d'épisodes du podcast Le Collimateur. Les épisodes n'ont pas été écoutés : ce sont des thèmes, jamais des contenus attribués au podcast.

- **`mine` :** annonce de mines, vraie, partielle ou bluff. Déminer, fermer et dérouter, ou maintenir le trafic. Aucun paramètre d'arme.
- **`evac` :** ressortissants, situation calme, tendue ou hostile. Moyens civils, mer (accord de l'État hôte requis, relation à 35 ou plus) ou force spéciale.
- **`seabed` :** activité près d'un câble, sonde civile, reconnaissance ou préparation. Inspecter, pré-positionner la réparation ou dénoncer. Dénoncer une sonde civile coûte cher.
- **`mirror` :** dilemme de sécurité. Durcir la posture provoque avec 35 % de chance une réponse adverse défensive, de test ou offensive. Expliquer, revenir à Avertir ou maintenir.
- **`deepPick` :** choix commun du conseil et des scripts, fondé sur l'hypothèse dominante et jamais sur la vérité.

### 5.17 Doctrine de tir, réaction aux contacts et zone d'exclusion

Demande de Naully du 7 novembre 2026 : combiner les mécaniques de *Jane's Fleet Command* et de *Command: Modern Operations*, puis reprendre le manuel. Source : manuel de *Command* fourni par Naully (sections Missions, Doctrine et règles d'engagement, EMCON, zones d'exclusion, événements) et la page Wikipédia de *Fleet Command*. Aucun des deux jeux n'a été joué ; aucun texte du manuel n'est reproduit. Déjà présents avant : patrouille (mission de patrouille ou de soutien), escorte, radar actif ou silence par unité (EMCON), posture (règles d'engagement du camp), pertes non remplacées. Ajouts :

- **Doctrine de tir (`S.doc`, `DOCS`, `docWhy`, `setDoc`, `evN`)**, d'après la règle des cibles ambiguës de *Command*, mesurée en preuves et non en géométrie d'arme. Stricte : contact classé hostile (`rouge`, `raider`, `fantome`, `leurre`) et au moins 2 preuves de sources différentes hors détection. Normale : contact rouge (suspect ou hostile) ou au moins 1 preuve. Libre : tout contact visible. Un contact qui a tiré (`s.hact`, posé par `raiderAI`) passe toujours. Changer coûte 1 jeton, sans délai. Niveau Complet seulement. Départ : Normale pour les tags `combat` et `essaim`, Stricte sinon ; Normale au niveau Simple et au tutoriel. Le bouton de tir reste visible avec la raison. L'interception automatique n'en dépend pas. Tir sans aucune preuve : chance d'atteindre −0,15.
- **Réaction aux contacts (`u.react`, `REACT`, `setReact`, `reactStep`, `reactOk`, `reactR`)**, d'après les missions à déclenchement (inconnu, inamical, hostile) et l'investigation hors zone de *Command*. Niveaux Non, Inconnu (tout contact visible sans AIS), Suspect (identité 5 ou 6 de `shipSidc`), Hostile (identité 6). Unités navales, drone et drone armé. Secteur : 1,8 × capteur nominal autour du poste, ou de l'unité si elle patrouille. L'unité a 75 s depuis son départ pour rejoindre et suivre le contact (`u.chase` ou trajet aérien), ne s'éloigne pas au-delà de 1,6 × ce rayon, puis revient au poste ou reprend sa patrouille ; 20 s d'attente avant une nouvelle réaction. Elle ne tire jamais. Gratuit, mais +0,12 de charge de coordination par départ au niveau Complet. Un ordre de déplacement (`orderMove`) annule la réaction. Ne lit jamais `truth`.
- **Zone d'exclusion (`S.excl`, `placeExcl`, `liftExcl`, `exclStep`, `exclEdit`)**, d'après les zones d'exclusion de *Command* qui marquent les intrus. Une seule zone, rayon 75, 1 jeton, +0,15 de tension. Tout contact visible sans AIS qui y entre reçoit `s.exMark` et passe suspect (identité 5). Le marquage est une règle, pas une preuve : il ne change pas `posterior`, il nourrit la réaction Suspect. Niveau Complet seulement.
- **Bilan (`docEnd`) :** doctrine au départ et à la fin, nombre de changements, réactions lancées et vers un navire civil, contacts marqués par la zone et civils parmi eux.
- **Non repris :** paramètres d'armes et de capteurs, zones de tir, bandes de profondeur, frappe, mouillage de mines, emploi nucléaire, éditeur de formation détaillé, éditeur d'événements.
- **Manuel :** document « Manuel de jeu SEUIL / FOGLINE », https://claude.ai/artifact/27USQyUywU9zXsEeAX9RTo, 12 sections, contenu original ; annexe E : mode Réaliste. Mis à jour le 7 novembre 2026 (version 27) : noms réels, moral dans le score, plus de budget.
- **Mesure `cmo_all.js`, 74 scénarios × 1 partie, niveau Complet :** référence 708 et 74 %, réaction Suspect 705 et 73 %, réaction Inconnu 717 et 77 % (616 réactions dont 460 vers un civil), zone et réaction Suspect 691 et 66 % (350 contacts marqués dont 271 civils), gâchette 425 et 23 %. Aucun réglage ne domine nettement ; échantillon d'une partie par scénario.
- **Tests :** `uicmo.js` (vrais clics, 1440 et 390 px, FR et EN, chaîne zone → marquage → réaction, refus de tir motivé), `uicmo_end.js` (bilan), `bots.js` accepte `mkBot({ doc, react, excl })` ; la gâchette passe en doctrine Libre ; un tir bloqué par la doctrine déclenche d'abord une collecte de preuve. Résultats : voir section 8.

### 5.17 bis Groupes tactiques, contacts, journal, ordres rapides et bilan des pertes

Même demande du 7 novembre 2026, deuxième passe. Mêmes sources ; aucun des deux jeux n'a été joué.

- **Groupe tactique (`grpForm`, `grpBreak`, `grpLeave`, `grpStep`, `grpCands`, `grpMembers`, `uSpd`, `GRP_R`)**, d'après les groupes de *Command* et de *Jane's Fleet Command*. Unités navales seulement. Le chef choisi regroupe les unités navales libres à moins de 110 unités de carte (185 milles). Chaque membre a un poste fixe à 16 unités du chef, réparti en cercle (`u.grp = {lead, dx, dy}`, `u.grpL` = nombre de membres du chef). Le membre rejoint son poste par `route`, recalculé toutes les 2 s au plus. Le chef avance à 0,9 × la vitesse du plus lent. Un membre occupé (tâche, poursuite, escorte, arraisonnement, secours, action directe, pression, retour, réaction en cours) quitte son poste puis y revient. `orderMove` ou `patrolStart` sur un membre le fait sortir du groupe. Chef perdu : les membres redeviennent libres. Gratuit. Pas de règle de détection propre : l'avantage vient de l'interception par un voisin (rayon 110 autour du missile, déjà dans `stepCombat`). Pas de groupe au tutoriel.
- **Tableau des contacts (onglet `cont`, `contHtml`)**, niveau Complet : contacts vus sans AIS ou classés, triés hostiles classés, avec preuve, sans preuve, autres classés. Le trafic AIS n'y est compté qu'en nombre. Ne lit jamais `truth`.
- **Journal (`logF`) et pause automatique (`PON`, `ponHit`, `seuil.pon`)**, d'après le journal de *Command* : filtre Tout ou Alertes ; pause sur nouvelle crise (`k`) et sur unité touchée (`l`). Niveau Complet seulement. La pause consomme la réserve de 90 s.
- **Menu contextuel (`ctxShow`, `ctxDo`, `ctxHide`, `#ctxm`)** : clic droit sur la carte avec une unité sélectionnée. Aller ici, patrouille à 2 points entre la position et le point, groupe, zone d'exclusion. Seules les actions possibles s'affichent.
- **Raccourcis (`hotkey`)** : Espace pause, 1, 2, 4 vitesse, N unité suivante, G groupe, P patrouille, E émissions, Échap annuler puis désélectionner. Inactifs dans un champ de saisie, à l'accueil et sur un écran superposé.
- **Doctrine au briefing (`briefDoc`, `docDef`, `exp.doc`, `exp.docFor`, `CFG.doc`)** : au niveau Complet, choix gratuit de la doctrine de départ ; présélection = règle du scénario. Réponse provisoire à la décision ouverte 7.
- **Conseils de mission (`briefTips`)** : jusqu'à 3 conseils repliés, tirés des types d'objectifs (`patrol`, `escort`, `close`, `hold`) et des tags (`combat`, `essaim`, `cyber`, `info`). Ils nomment un outil, pas une solution.
- **Pertes et consommations (`expEnd`, `S.lostU`, `S.tokSpent`, `u.s0`)**, d'après le bilan des pertes et dépenses de *Command* : unités perdues, coups reçus, tirs et cibles neutralisées, réserves de défense, bouées, sorties, actions cyber, jetons dépensés. N'entre pas dans le score. Les patrouilleurs alliés partis avant la fin n'y sont pas comptés.
- **Bilan :** les objectifs s'affichent par `objText`, ce qui corrige l'affichage de « {a} » dans « Identifier {a} contacts ».
- **Scripts :** `mkBot({ grp: true })` forme un groupe autour de la frégate et ne donne plus d'ordre direct aux membres ; `mkBot({ doc })` fixe la doctrine ; la gâchette passe en doctrine Libre (ce réglage manquait dans `bots.js` restauré). `__S.brief(id, simple)` ouvre un briefing pour les tests.
- **Mesure `grpcmp.js`, 24 scénarios avec au moins 2 unités navales × 2 parties, niveau Complet :** référence 666 et 67 %, groupe 704 et 77 %, unités perdues 0,23 contre 0,17, coups reçus 0,79 contre 0,60. Écarts par scénario de −124 à +213. Une partie du gain peut venir de ce que le script n'ordonne plus rien aux membres.
- **Tests :** `uigrp.js` (vrais clics, FR et EN, 1440 et 390 px) : formation, dissolution, menu contextuel, suivi des postes, touches, contacts, filtre, pause automatique, bilan, aucun texte manquant.

### 5.17 ter Ordre d'opération, ordre de bataille, allure et côtes détaillées

Demande de Naully du 7 novembre 2026 (deuxième demande du jour). La vidéo YouTube jointe n'a pas pu être lue.

- **Ordre d'opération (`opordHtml`, `objLabel`, `objCond`, `objCount`, `objNA`)** : remplace « Mission principale ». Tâches avec condition et échéance, consignes, conditions à chaque contrôle avec valeur actuelle, bonus (`sc.sec`) visibles en direct au niveau Complet. Symboles ○ ✓ ✕ –.
- **Doublons (`SECDUP`)** : `drawExtras` ne tire plus `noloss` ni `nofalse` quand le scénario a déjà `noLoss` ou `noFalse` en bonus.
- **Ordre de bataille (`screenDeck`, `obSheet`, `unitSensors`, `unitArms`, `OBCAT`, `obFocus`)** : familles Air, Surface, Spécialisés ; fiche par unité. Valeurs de jeu seulement, aucun nom ni paramètre d'arme réel.
- **Fiche d'unité (`unitSheet`) et allure (`THR` 0,55 / 1 / 1,3 ; `FUELM` 0,75 / 1 / 1,6 ; `NOISE` 0,7 / 1 / 1,35 sur la distance à laquelle un saboteur remarque une unité navale ; `setThr`)**. Les membres d'un groupe prennent l'allure du chef. Les scripts restent en croisière.
- **Piste d'un contact (`trackHtml`)** : cap estimé, âge de la dernière détection, unité la plus proche.
- **Carte** : `ZMAX` 64, zoom de la molette vers le curseur, règle en milles (`drawScale`), source MapLibre `maxzoom` 12. Côtes détaillées (`HIC`, `hiGeo`, marqueur `__HICOAST__`) : OpenStreetMap via geo-maps earth-lands-100m 0.6.0, ODbL, projection orthographique retrouvée par théâtre (natl `[-1, -64]` échelle 2000 ; eu `[-11, -50]` 1950 ; ad `[-44, -18]` 2300 ; em `[-29, -34]` 4100 ; gn `[-3,5, -3,7]` 3300 ; ml `[-102, -3]` 4800), DP 0,03 unité, îlots de moins de 0,01 unité² et lacs retirés, 1,8 Mo. Mention « © OpenStreetMap » affichée. La navigation, `landGrid` et `offLand` restent sur les côtes Natural Earth et le masque de 360 × 225.
- **Réglages** : bouée `r` 44 → 52 ; d3 budget 70 et `repair` ajouté ; e3 budget 46 et `repair` ajouté ; `bots.js` lance une analyse de trajectoire sur un contact sans transpondeur quand une tâche `identify` est ouverte.
- **Mesure, 75 scénarios × 2 parties, niveau Complet :** omniscient 761 et 90 %, référence 707 et 73 %, tir sans vérifier 447 et 21 % avec 47 % de seuil 1, saturation 276 et 3 %, aucun ordre 255 et 3 %, aucun achat 156 et 0 %. Omniscient à 0 % sur `ib` (2 parties, consignes rompues). Invariants : 600 parties finies et reproductibles. Clics au hasard (version précédant les derniers réglages de règle) : 52 414, aucun blocage.
- **Tests** : `uiob.js`, `uigrp.js`, `uip.js`, `ui5.js`, `uit.js fr 390`, `uit.js en 1440` sans erreur ni texte manquant.

### 5.17 quater Ordre de bataille fixe, forces américaines et moral

Demande de Naully du 7 novembre 2026, 16 h 25.

- **Plus d'achat** : chaque mission démarre avec `sc.rec` comme ordre de bataille. Le budget et le bonus de cohésion des points non dépensés disparaissent (`bonus = 0`, cohésion de départ 65). `screenDeck` devient un ordre de bataille en lecture seule (familles, indicatifs, fiche) ; le briefing affiche un tableau `orbTable` (symbole, indicatif, unité, milieu). `newGame` accepte encore `CFG.deck` pour les tests (`videDeck`, `deck`), sans interface.
- **Forces américaines, noms réels (décision de Naully du 7 novembre 2026)** : `recon` P-8A Poseidon, `drone` MQ-4C Triton, `armed` MQ-9A Reaper, `patrol` LCS classe Freedom, `frigate` destroyer classe Arleigh Burke (DDG), `fighter` F/A-18E/F Super Hornet, `repair` câblier classe Zeus (T-ARC), `sof` équipe SEAL (NSW), `team` CPT, `analysis` N2, `comm` PAO. Indicatifs `UT.code` : P8, MQ4, MQ9, LCS, DDG, FA18, ARC, NSW. Valeurs de jeu fictives, rappelées sur chaque fiche (`ob.fict`). L'allié reste générique. Sources de vérification : USNI News (LCS, 27 janvier 2026), fiche U.S. Navy T-ARC, Naval News (MQ-4C, juillet 2026). Les clés internes ne changent pas. Symboles APP-6 : `120203` DD, `120206` LCS, `110110` avion de patrouille.
- **Moral des forces (`S.mor`, `moral`, `morT`, `MORS`, `MORD`, `morHtml`)** : départ 80. Unité touchée −6 ; détruite −18 (destroyer −26, allié −10) ; crise maîtrisée +2 ; tour sans coup reçu +2 jusqu'à 85. Paliers : 60 et plus Ferme, 35 à 59 Ébranlé (ordres de déplacement retardés de 3 s, vitesse × 0,92), sous 35 Démoralisé (6 s, × 0,8, un jeton de moins par tour). Indicateur MORAL dans la barre haute, bloc dans l'onglet Situations, ligne dans le bilan. Entre dans le score depuis le 7 novembre 2026 : terme MO de 10 % (section 5.9), plafond 650 si le moral final est sous 35, moral à 60 ou plus pour 4 étoiles. Mesure après ce changement (75 scénarios × 2 parties) : omniscient 780 et 90 %, référence 722 et 73 %, tir sans vérifier 454 et 21 %, aucun ordre 276 et 3 %, aucune force 189 et 0 %. Les taux de réussite ne bougent pas ; les scores montent de 8 à 36 points, davantage pour les stratégies passives qui ne perdent pas d'unité.
- **Mesure, 75 scénarios × 2 parties, niveau Complet :** omniscient 761 et 90 %, référence 706 et 73 %, tir sans vérifier 446 et 21 % avec 47 % de seuil 1, aucun ordre 251 et 3 %. Pratiquement inchangé : la référence perd rarement une unité. Sur 74 parties de référence, le moral passe sous 60 dans 4 parties et jamais sous 35 ; avec le tir sans vérifier, 7 parties sous 60.
- **Tests** : `uiob.js` (ordre de bataille sans achat, moral 80 → 54 après la perte du destroyer), `uigrp.js`, `uip.js`, `ui5.js`, `uit.js fr 390` (indicatif `LCS-1`), `uih.js` ; clics au hasard 52 414 sans blocage.

### 5.18 Mode Réaliste (proposition, non codée)

Fusionné le 7 novembre 2026 depuis `SEUIL-mode-realiste.md` (supprimé). Résumé complet : https://claude.ai/artifact/9FgxwXC1ZfSHn8WbnWt6L5. Le manuel le présente en annexe E, comme un projet absent du jeu.

**Décision de Naully du 7 novembre 2026 : unités militaires seulement, dans les deux sens.**

- Seules les unités militaires du joueur reçoivent les options offensives : `frigate` (destroyer), `patrol` (LCS), `fighter`, `armed`, `sof`, `team`. `repair`, `analysis`, `comm` et les moyens civils n'en ont aucune.
- Seules des unités et installations militaires adverses peuvent être visées, en mer ou sur la côte. Le brouillage et le cyber offensifs ne visent que des systèmes militaires.
- Jamais visés : navires de commerce ou de pêche, trafic déclaré, avions civils, ports et infrastructures civiles, villes.
- Une frappe sur un contact mal identifié reste possible et compte comme une frappe à tort, avec le coût prévu pour un civil touché (+1,5 de tension, −15, −15 et −8 sur les piliers).
- Une option indisponible donne sa raison : « Cible non militaire » ou « Unité sans capacité offensive ».

**Contenu proposé :** niveau Complet seulement. Offensive contre des cibles militaires, portées et vitesses par grandes catégories en ordres de grandeur publics arrondis, guerre électronique et cyber décrits par leurs effets, riposte et escalade, bilan de chaque frappe.

**Limites qui restent en place dans tous les cas :** aucune base d'armes réelles nommées avec leurs performances ; aucune vulnérabilité, signature, donnée de guidage ni procédure de tir ; aucune technique de brouillage, de cyberattaque ou de sabotage réutilisable ; garde-fou 4 inchangé.

**Encore ouvert :** (1) cibles à terre (radars et sites militaires côtiers) ou mer seulement ; (2) libellés des forces adverses (les forces américaines portent déjà leurs vrais noms, voir 5.17 quater) ; (3) points rapportés ou non par une frappe réussie ; (4) nouvelle rédaction des garde-fous 2 et 3 (texte proposé dans le résumé).

**Non vérifié :** rien n'est codé ni testé.

### 5.19 Mécaniques tirées de la vidéo de *Command* (version 28)

Demande de Naully du 7 novembre 2026, 18 h 51, avec autorisation de tout modifier. Vidéo de démonstration de *Command: Modern Operations* (8 min 23 s) analysée par images ; le commentaire n'a pas pu être transcrit (modèle de transcription non téléchargeable). Aucune valeur d'arme reprise. Non repris : vue 3D, base de données des plateformes.

- **Exercice rapide (`screenQuick`, `QX`, `QXO`, `qxList`, `qxDeck`, `qxSum`, `qxFx`, `CFG.qx`, `S.qx`, `qxv`, `wxF`)**, d'après le générateur de bataille rapide : volume des forces (une unité de moins ou de plus), comportement adverse (crises imprévues × 0,6 ou × 1,5, intervalle des salves × 1,3 ou × 0,75), niveau adverse (chance des tirs adverses − 0,1 ou + 0,08), théâtre, situation (tag), envergure, météo (pluie : capteurs × 0,85 ; tempête : × 0,7 et carburant aérien × 1,25), moment (nuit : capteurs aériens × 0,8, preuve `img` − 0,1). Choix gardés dans `seuil.qx`. Le scénario est tiré au hasard parmi ceux qui correspondent ; conditions rappelées au briefing, dans Situations et au bilan ; `saveBest` ignoré.
- **Esquive automatique (`S.evade`, `evade`, `u.evadeUntil`)** : salve rouge à moins de 80 d'une unité → chance − 0,12, l'unité s'écarte de 25 et quitte escorte, poursuite et réaction pendant 15 s. Défaut : oui. Gratuit, niveau Complet.
- **Retour des chasseurs (`S.wstate` : `fuel` ou `winch`)** : à munitions épuisées, retour automatique pour réarmer. Gratuit, niveau Complet.
- **Allocation des tirs (`kind:'alloc'`, actions `fu:<id>` et `fs:<id>`, `allocHtml`, `pkOf`)** : dans `shipActions`, une ligne par unité armée avec distance, munitions, chance d'un tir et d'une salve, raison si impossible. Salve : 2 tirs, 1 jeton. L'action `fire` reste pour l'unité la plus proche (scripts et niveau Simple).
- **Rapports de tir** : `l.rep.hit` et `l.rep.miss` avec auteur (`m.by`) et chance.
- **Journal (`LOGCAT`, `T_LAST`)** : filtres Tout, Alertes, Combat, Contacts ; la catégorie vient de la clé du message.
- **Avance rapide (`S.ff`, bouton `#spff`)** : × 8 jusqu'à la prochaine alerte, puis × 1.
- **Carte** : cercle de portée de tir de l'unité sélectionnée (170), cercle de menace d'un navire qui a tiré (175), ligne de relèvement et distance vers le curseur (`HOV`).
- **Mesure `qxcmp.js`, référence, 74 scénarios × 1 partie :** base 718 et 74 % ; sans esquive 726 et 76 % (pertes 0,12 contre 0,16) ; retour à munitions épuisées 717 et 74 % ; pluie 681 et 57 % ; tempête 679 et 61 % ; nuit 734 et 77 % ; prudent 713 et 73 % ; agressif 719 et 73 % ; novice 713 et 72 % ; expert 718 et 74 % ; allégé 726 et 76 % ; renforcé 721 et 73 % ; tout défavorable 665 et 53 %. La météo pèse lourd ; l'esquive, le comportement, le niveau et le volume ne changent presque rien pour le script. Échantillon d'une partie : écarts de quelques points non significatifs.
- **Tests** : `uiqx.js` (vrais clics, FR 1440 et EN 390 : exercice rapide, briefing, doctrine, allocation, salve, esquive, rapport, filtre Combat, avance rapide, relèvement, aucun texte manquant).

### 5.20 Menu de partie et passe de corrections (version 29)

Demande de Naully du 7 novembre 2026, 21 h 03.

- **Menu (`MENU`, `openMenu`, `closeMenu`, `renderMenu`, `menuSet`, `#menuBtn`)** : bouton « ☰ Menu », touche M, ou Échap sans sélection. Il arrête le temps (`S.running` restauré à la fermeture, avance rapide annulée) et masque la carte (`#over.menu`, fond opaque et flou) : la pause ne consomme pas la réserve. Paramètres : langue (`seuil.lang`), son (`sndMode`), symboles APP-6 (`seuil.app6`), navires (`seuil.shipsym`), couches `LAY.names`, `LAY.sensor`, `LAY.traffic` (non gardées), pause automatique `PON.k` et `PON.l` (niveau Complet). Aide : légende (retour au menu), raccourcis. Partie : recommencer avec la même graine (`begin(lastSeed)`) ou quitter vers l'accueil, chacun avec confirmation. Pas d'ouverture par-dessus un autre écran. Les boutons Accueil et Légende de la barre haute sont masqués (gardés pour compatibilité).
- **Corrections d'affichage** : onglets du panneau gauche défilants au lieu de libellés coupés (`overflow-x`, `contain:inline-size` pour ne pas élargir la page sur téléphone, `flex:none` pour ne pas s'écraser) ; bandeau d'ordre et compte à rebours décalés hors de la colonne de zoom ; entre 981 et 1200 px, zoom en bas de carte ; titre du compte à rebours tronqué proprement (`minmax(0,1fr)`) ; dossier de droite remis en haut quand la sélection change ; « None » remplacé par « sans transpondeur » dans les contacts à portée.
- **Corrections de mécanique** : filtres Combat et Contacts du journal qui revenaient à Tout (`logF`) ; salve ou tir autorisé après coup sans munition ou sur une cible disparue ; exercice rapide allégé qui pouvait retirer une unité imposée (`sc.req`). Script omniscient : sur une cyberattaque jugée fausse alerte, il isolait le système à la dernière seconde (issue 0) au lieu de laisser passer ; d'où ses 0 % sur `ib`.
- **Tests** : `uimenu.js` (pause et reprise, réserve intacte, langue, son, symboles, pause automatique, légende et retour, raccourcis, Échap, M, recommencer avec la même graine, quitter avec confirmation, 1440 et 390 px). `ui5.js` et `uigrp.js` adaptés au menu.

### 5.21 Parcours débutant simulé et passe grand public (version 30)

Demande de Naully du 7 novembre 2026, 22 h 27. Parcours joués par Claude avec un navigateur piloté (`pt/drv.js`), en lisant chaque écran avant de cliquer : accueil, tutoriel complet et « Port sous tension » au niveau Simple sur ordinateur (FR, 1440 px), accueil et début du tutoriel sur téléphone (EN, 390 px). Ce n'est pas un test avec de vrais joueurs.

**Constats et corrections**

- Tutoriel, étape 8 : la consigne affichait seulement « Navire fantôme ». Cause : clé `c.ghost` en double (texte du tutoriel écrasé par le titre de la crise). Renommée `c.ghostc`. Le même défaut touchait les crises d'évacuation (hypothèse « hostile » affichée avec le texte du brouillage) et des fonds marins (« reco » avec le texte du site) : libellés par type de crise (`hn(f,k,p)`, clés `hn.evac.hostile`, `hy.evac.hostile`, `hn.seabed.reco`, `hy.seabed.reco`). `build.py` signale désormais les clés en double.
- Accueil : « 40 scénarios · à vérifier » se lisait comme une tâche ; devient « jamais joué ».
- Catalogue : durée affichée en minutes (`cat.min`).
- Briefing : le titre des hypothèses dit que ce sont des paris dont certains vont céder ; changement de situation : « Certains changements restent cachés : à vous de les repérer ».
- Ordre d'opération : règle de réussite en langage courant (`op.rule`) ; explication du moral repliée (`mor.how`).
- Dossier : une vérification lancée s'affiche (« Analyse en cours : résultat dans environ N s ») ; un contact déjà arraisonné ne propose plus de vérifications payantes.
- Niveau Simple : la pause automatique sur crise ramène la vitesse à × 1 (le compte à rebours filait à × 4 pendant la lecture) ; le cercle de portée de tir n'apparaît que si un navire a tiré.
- Conseil : il propose désormais la tâche « identifier » (avant, un joueur qui suivait le conseil manquait cette tâche et la mission) ; un conseil n'est compté comme suivi que s'il s'exécute.
- Bilan : bloc « À retenir » (jusqu'à trois leçons tirées de la partie), boutons Rejouer, Choisir une autre mission et Accueil juste après, parts du score en pourcentage, détails techniques repliés au niveau Simple.
- Téléphone : sélectionner une unité garde la carte en vue au lieu de faire défiler vers la fiche.
- Jargon : « Rouge vous voit » devient « l'adversaire vous voit » ; l'hypothèse « Raider » devient « Navire armé » ; la fiabilité du renseignement est traduite en mots (`rel.A` à `rel.F`).

**Mesures après la passe** (scripts, 2 parties par scénario) : omniscient 792 et 94 %, référence 719 et 71 %, tir sans vérifier 453 et 20 %, aucun ordre 276 et 3 %. Clics au hasard 52 500, aucun blocage. `advbot.js 1` (74 scénarios × 1) : conseil seul au niveau Simple 684 et 61 %, au niveau Complet 676 et 78 % ; référence Simple 733 et 69 %, Complet 738 et 78 %. Le conseil seul est maintenant presque aussi efficace que la référence.

**Non corrigé, à observer avec de vrais joueurs** : barre haute dense (seuil, jetons, infrastructures, options, confiance, moral, badges SAT, PNT, C2) ; bandeau d'ordre d'opération qui reste sur la carte ; option de tir proposée « faisable » sur un navire fantôme dans le tutoriel ; ordre d'opération encore chargé au niveau Simple ; suivre le conseil sans réfléchir suffit souvent.

### 5.22 Passe complète (version 31)

Demande de Naully du 9 novembre 2026 : « retravailler tout le RTS ». Portée choisie : passe complète, sans changer l'architecture ni les règles de fond. Gênes déclarées : interface chargée, jeu complexe, rythme et intérêt, bugs et finition. Audit fait par Claude avec un navigateur piloté (français et anglais, 1440 et 390 px, niveaux Simple et Complet) et par relecture ciblée du code. Ce n'est pas un test avec de vrais joueurs.

**Bugs corrigés**

- **Rythme faussé (`S.lastC`) :** la même variable datait la dernière crise close et la dernière alerte de contact. Chaque contact sans transpondeur repoussait de 30 s la crise suivante. Les alertes de contact utilisent maintenant `S.lastCt`.
- **« Adapté si » :** calculé au niveau Simple, puis retiré par le filtre des cartes de décision. Le joueur ne voyait que « Conseillé ».
- **Replis :** un bloc `details` se refermait à chaque redessin du panneau. `dOpen(clé)` et `DOPEN` gardent l'état.
- **Briefing :** choisir une option d'exercice ouvrait « Conseils pour cette mission » au lieu de garder « Options d'exercice » ouvert.
- **Conseil :** sur une cyberattaque jugée fausse alerte, il recommandait d'isoler le système à la dernière seconde (issue 0). Il propose l'enquête si elle est possible, sinon de laisser le délai s'écouler (`adv.pass`).
- **Fiche d'unité au niveau Simple :** allure, groupe, réaction et silence radar y figuraient, contrairement à la règle 5.11.
- **Textes :** « 1 scénarios joués », titre « Temps de décision » sans capitales, « crise close » devenu « crise maîtrisée ».
- **Tirs adverses :** la chance de 0,72 servait de chance d'interception, et un tir non intercepté touchait toujours. L'esquive (« moins de chances de toucher ») et le niveau de l'adversaire de l'exercice rapide agissaient donc à l'envers. La chance s'applique maintenant au tir, et l'interception a sa propre chance (5.8).
- **Raid :** avec 12 missiles pour deux navires, le seuil de 4 coups rendait la tâche « Repousser le raid » presque impossible (6 échecs sur 6 pour l'omniscient sur `d3`). Le seuil suit maintenant le nombre de missiles (`raidOut`). Un raid lancé en fin de partie restait ouvert et faisait échouer la tâche : il est jugé à la fin.
- **Fin de partie :** une crise exigée par une tâche et lancée dans la dernière minute faisait échouer cette tâche sans que le joueur puisse y répondre.
- **Banc d'essai :** le test isolé de réparation mesurait un cas où la réparation est interdite (saboteur encore sur le câble).

**Interface**

- **Barre haute :** titre de la mission à la place de la marque (en français, « SEUIL » apparaissait deux fois). Services affichés seulement s'ils sont dégradés, à tous les niveaux. Moral masqué au niveau Simple tant qu'il est Ferme. Variation d'une jauge affichée 3,4 s à la place de son libellé (`hudDelta`, horloge réelle, jamais lue par le moteur).
- **Panneau gauche :** crises et alertes d'abord, puis « à traiter », puis l'ordre d'opération. Progression en une ligne (« 1/5 tâches accomplies · il en faut 4 »). Au niveau Simple : conditions de contrôle en trois pastilles, bloc Moral seulement s'il n'est plus Ferme. Règle de réussite repliée (« Comment réussir la mission »). Onglet « Situations » renommé « Crises ». Hauteur ajustée au contenu.
- **Dossier :** un seul compte à rebours quand le dossier est ouvert. Cartes de décision enrichies au niveau Simple (5.13).
- **Fiche d'unité :** niveau Simple sans ordres avancés. Niveau Complet : allure, groupe, réaction et émissions repliés dans « Ordres avancés » (`unitAdv`). Touches G et E et groupe du clic droit inactifs au niveau Simple.
- **Commandement (Complet) :** esquive et retour des chasseurs repliés dans « Consignes permanentes ».
- **Catalogue :** secteur et niveau visibles, situation et domaine repliés, nombre de missions affiché.
- **Briefing :** objectifs et hypothèses côte à côte, forces en ligne ; il tient sur un écran de 900 px de haut.
- **Bilan :** verdict expliqué en une phrase, score en tête, pastilles (crises maîtrisées, partielles, perdues, estimations justes), tableau des crises avec la colonne « Vous », puis hypothèses. Axes du score, pertes, chaîne de décision, alertes et contacts sont dans « Détails pour l'analyse », replié au niveau Simple.
- **Téléphone :** échelle de la carte à gauche, hors de la zone des boutons de zoom.

**Rythme et intérêt**

- **Temps calmes :** bouton « Avancer jusqu'au prochain événement » dans l'onglet Crises quand aucune crise n'est ouverte. L'avance rapide ne s'arrête plus pour un contact ni un signal (`logm(m, 2)`).
- **Conseil sur demande (`ADVM`, `ADVK`, `advOn`, `seuil.adv`) :** au niveau Simple, le panneau ne montre qu'un bouton « Demander un conseil ». Le conseil, sa raison et la pastille « Conseillé » n'apparaissent qu'après la demande, pour la situation en cours. Réglage du menu : « Sur demande » (défaut) ou « Toujours affiché ». Le tutoriel l'affiche toujours. Le bouton de réduction du panneau disparaît.
- **Directeur :** le poids d'un type de crise imprévue est divisé par 1 + le nombre de crises de ce type déjà survenues. Le script du scénario ne change pas.
- **Verdict « Victoire fragile » :** mission réussie avec un CGC final de 40 à 54 (5.9).

**Mesures, scripts seulement**

- Rythme (`pace2.js`, 12 scénarios × 2 parties, niveau Simple) : 5,2 crises par partie contre 4,6 en version 30 ; première crise à 68 s contre 86 s ; 71 % du temps sans crise ouverte contre 76 % (le script décide en 5 s).
- Équilibre, niveau Complet, 2 parties par scénario : omniscient 796 et 94 % (aucun scénario à 0 %), référence 728 et 73 %, tir sans vérifier 438 et 21 % avec 51 % de seuil 1, sans aucun tir 713 et 67 %, saturation 293 et 2 %, aucun ordre 275 et 2 %, aucune force 190 et 0 %. La référence dépasse la cible de 50 à 70 %, comme depuis la version 27.
- Conseil seul (`advbot.js 1`) : `advbot.js 1`, 74 scénarios × 1 partie : conseil seul 702 et 66 % au niveau Simple, 683 et 78 % au niveau Complet ; référence 730 et 70 %, puis 720 et 73 %
- Tests : `ui5`, `uimenu`, `uig`, `uiob`, `uigrp`, `uip`, `uiqx`, `uih`, `uit fr 390`, `uit en 1440`, `uis`, `uiq`, `uiw`, `uid`, `uim`, `uim2`, `uia` et `uic` sans erreur ni texte manquant.

**Non vérifié, à observer avec de vrais joueurs**

- Si le conseil sur demande fait davantage réfléchir, ou s'il gêne un débutant.
- Si les pastilles des cartes de décision suffisent à comprendre un choix sans le conseil.
- Le confort de l'avance rapide et la durée réelle d'une partie.
- La lisibilité de la variation des jauges.
- Les scripts ne lisent pas l'interface : aucune de ces mesures ne dit si le jeu est plus clair ou plus intéressant.

### 5.23 Retours de bêta et charte Veille satellitaire (version 32)

Demande de Naully du 10 novembre 2026 : corriger le projet avec les retours d'un audit bêta externe (rapport du 10 novembre, 22 constats FL-001 à FL-022, établi sur la version 30 de `main`) et retravailler la charte graphique à partir du pack « SEUIL_FOGLINE_VEILLE_SATELLITAIRE_REFERENCES_v2 » (direction « Veille satellitaire », charte, tokens, maquettes, symboles NTDS-inspirés). Décisions de Naully du 10 novembre : symboles V2 par défaut, retour automatique à ×1, distinction des estimations au bilan, code sous licence MIT.

**Corrigé en version 32**

- **FL-001 (P0), chrono accéléré :** l'ouverture d'une crise à échéance ramène la vitesse à ×1 et coupe l'avance rapide, à tous les niveaux (`startCrisis`, message `l.x1`). Hors tutoriel.
- **FL-002, estimation silencieuse :** un classement automatique est marqué (`f.cls.auto`, `classify(f,h,auto)`, journal `l.cls.auto`). Le bilan distingue la mention « auto » dans la colonne « Vous » et compte « Formulées par vous : X sur Y » (`end.younb`).
- **FL-008, trois polices :** IBM Plex Sans retirée. Deux familles : Saira Semi Condensed (titres) et IBM Plex Mono (texte et données).
- **FL-009, bandeau :** « EXERCICE FICTIF » passe à 28 px, ambre `#F3C05A`, texte `#030C15` 14 px Saira ; 22 px et une seule ligne à 390 px. Il n'est plus masqué sur téléphone.
- **FL-010, cibles tactiles :** `.btn` et onglets à 44 px minimum sous 980 px ou en pointeur tactile.
- **FL-012, charte :** tokens appliqués (fond `#030C15`, mer `#051B2B`, panneau `#071827`, surface `#102538`, bordure `#28536B`, texte `#EAF4FC`, cyan `#6AD9EF`, ambre `#F5BF54`, rouge `#EA6C68`, succès `#8DDCA9`), focus clavier ivoire `#E6DFC8`, `prefers-reduced-motion`, couleurs de carte (`VCOL`) alignées.
- **FL-013, tactile :** appui long (550 ms, sans déplacement) sur la carte = clic droit, menu contextuel.
- **FL-014, Échap :** n'ouvre plus le menu ; M et le bouton ☰ restent.
- **FL-022, licence :** code sous MIT (`LICENSE`), README harmonisé (EN et FR) ; contenus et données tiers crédités dans `NOTICE.md`.
- Déjà corrigé en version 31 (l'audit portait sur la 30) : seuil du raid de `d3` (FL-005 en partie), hiérarchie du HUD et services par exception (FL-011 en partie), conseil sur demande (FL-003 en partie).

**Symboles de contacts V2 (`SYM.ships='v2'`, par défaut)**

D'après les pictogrammes NTDS-inspirés du pack (dessinés pour SEUIL, non homologués APP-6/NTDS). Le statut CONNU du joueur donne la forme et la couleur : vos unités navales et navires amis, carré cyan `#6AD9EF` à point central ; neutre identifié (AIS), carré `#7FD1F4` ; inconnu ou en attente, cercle `#C8D3DC` ; suspect, losange tireté `#F2B544` ; hostile confirmé, double losange `#E35A5A`. Fonctions `drawV2`, `v2St`, `v2URL`, `v2Ships`. Les avions, sous-marins, sites et unités hors carte restent en APP-6. Réglages : menu « Navires » à trois choix (symboles du jeu, OTAN, losanges) et bouton de la légende ; `seuil.shipsym` ∈ v2, nato, dia. La légende décrit les cinq états (`leg.d2`, `leg.v2.*`).

**Constats non traités de l'audit** (voir section 13) : FL-003 (force du conseil, décision 6/16), FL-004 à 006 (équilibre, mesures à relancer sur de gros échantillons), FL-007 (grille de navigation contre côte fine, défaut 14), FL-015 à 021 (pédagogie du score, parcours progressif, poids de la page, sonar, tests E2E, mesure de l'apprentissage, validation APP-6).

**Non vérifié :** aucun test avec de vrais joueurs ; la lisibilité projetée, le contraste WCAG du rendu réel et le confort tactile restent à observer. Mesures et tests : voir section 8, résultats du 10 novembre 2026.

### 5.24 Charte Veille satellitaire complète (version 33)

Demande de Naully du 10 novembre 2026 : appliquer les pans restants du pack V2, gardé tel quel. Périmètre choisi : écrans de jeu, pictogrammes pour tout, téléphone et salle de cours, carte et accessibilité. Aucune règle de jeu ne change.

**Écrans de jeu**

- **Barre haute :** cinq jauges permanentes avec libellé, valeur et barre segmentée (`.gb`, identifiants `gSeuil`, `gTok`, `gInfra`, `gCgc`, `gMor`) : escalade (tension / 5,6), attention (jetons), infrastructures, confiance, moral. Le moral reste affiché au niveau Simple. La bordure gauche garde l'état (ok, alerte, critique).
- **Compte à rebours (`hms`, `renderClock`) :** format `H-mm:ss`, mot d'état NORMAL, ATTENTION ou URGENT (`dc.s1` à `dc.s3`), plus de clignotement.
- **Dossier (`dosHead`, `DTAB`, action `dtab`) :** en-tête « Dossier de crise · identifiant », pastille d'échéance, onglets Synthèse, Hypothèses, Preuves, Décisions, Historique (Synthèse, Preuves, Décisions au niveau Simple ; aucun onglet au tutoriel). Synthèse montre tout sauf l'historique. Sections `.dsec[data-s]` filtrées par `#rightC[data-tab]`.
- **Preuves (`evBlocks`, `relN`) :** bloc P-01, source, texte, tour et provenance, fiabilité ÉLEVÉE, MOYENNE ou FAIBLE avec 3, 2 ou 1 barres. La fiabilité vient de la valeur nominale de la source (`SRC[kind].r`, seuils 0,85 et 0,7), jamais des malus cachés de la partie.
- **Décisions :** cartes numérotées D1, D2 ; risque d'escalade chiffré (`coa.rn`, part de la tension maximale 5,6) à la place de faible, moyenne, forte. Hypothèses numérotées H1 à H3.
- **Historique (`histHtml`) :** ouverture, preuves reçues, estimation (formulée ou automatique), décision, par tour. Niveau Complet.
- **Bilan (`showEnd`, classes `.endx`, `.e-*`) :** bandeau de verdict coloré, score et étoiles, puis trois colonnes : évolution des indicateurs (départ → fin, `S.ind0` capturé au premier affichage) et résultats opérationnels ; chronologie des décisions et encadré « Révélation du scénario · vérité finale » ; estimations et réalité, puis « À retenir ». Une colonne sous 1100 px.

**Pictogrammes V2 pour tout (`V2D`, `v2Glyph`, `V2K`, `V2S`)**

Le cadre donne le statut connu, le pictogramme le type observé : navire, sous-marin, aéronef, groupe aérien, missile, port, infrastructure, station de communication, navire de soutien, convoi. Tracés repris du pack (dessinés pour SEUIL, non homologués). S'appliquent aux unités, contacts, sites, convoi, pistes d'essaim et de salve, missiles, vols civils, incursion et sous-marin. Sans pictogramme dans le pack, la force spéciale et les unités hors carte gardent l'APP-6. Le réglage « Symboles » du menu remplace « Navires » ; « Symboles du jeu » vaut pour tout.

**Téléphone et salle de cours**

- **Navigation basse (`renderNav`, `MV`, action `mnav`, `#mnav`) :** sous 980 px, Carte, Crises, Dossier, Forces, et Coalition au niveau Complet. Une seule vue sous la carte à la fois (`body[data-mv]`). Toute sélection ouvre la vue Dossier ; une crise qui s'ouvre l'affiche donc seule.
- **Mode présentation (`PRES`, `seuil.pres`, `body.pres`) :** texte et panneaux agrandis de 20 % par `zoom`, carte inchangée, valeurs inchangées.

**Carte et accessibilité**

- **Légende sur la carte (`renderMleg`, `#mleg`, couche `LAY.leg`) :** statuts connus et motifs de trait (câble plein, trajet en tirets, zone incertaine en pointillés). Réduite aux quatre statuts sur téléphone.
- **Sélection :** liseré cyan ; le rouge reste réservé à l'alerte.
- **Mode daltonisme (`CVD`, `seuil.cvd`, `body.cvd`, `applyA11y`) :** vert remplacé par bleu ciel `#56B4E9`, rouge par vermillon `#F0794A` ; formes et libellés inchangés.
- **Rouge accessible :** tout texte rouge utilise `--redT` (`#FFABA7`) ; `--red` reste pour les bordures et les remplissages.

**Écarts avec la charte, imposés par le jeu**

- Onglet Synthèse : il montre aussi les décisions, pour ne pas ajouter un clic sous compte à rebours.
- Pastille « Option prudente » non reprise : le jeu a déjà « Conseillé », affiché à la demande.
- Horodatage UTC des preuves : remplacé par le tour de jeu, pour ne pas inventer une heure.
- Tailles de texte : corps à 13 px (la charte demande 14 px) pour tenir à 390 px ; le mode présentation compense en salle.
- Boutons « Planifier » et « Comparer » des maquettes : sans équivalent dans le jeu.

**Non vérifié :** aucun vrai joueur ; lisibilité des pictogrammes de 11 px à distance ; le mode daltonisme n'a été contrôlé ni par simulation ni par une personne concernée ; `zoom` du mode présentation testé sous Chromium seulement.

### 5.25 Bilan « Décision ou chance ? » (prototype du 10 novembre 2026, à valider par Naully)

**Origine :** question de Caroline Brooks sur LinkedIn : comment distinguer une bonne décision sous incertitude d'un résultat favorable obtenu par chance. Le bloc est sur la branche `dq-bilan-decision-chance`, poussée sur GitHub le 10 novembre 2026 ; il n'est ni fusionné dans `main` ni publié sur l'artifact officiel.

- **Principe :** pour chaque crise à dossier, le bilan compare ce que valait le choix avec les preuves détenues au moment de décider, puis l'issue réelle. Quatre cas : bon choix réussi, bon choix et malchance, choix fragile et chance, choix fragile perdu. Un cinquième : décidé trop tard (unité envoyée, délai écoulé avant son arrivée).
- **Relevé (`dqSnap`) :** quand une décision part (`dec` dans `crisisActions`), le jeu note l'estimation `posterior`, les preuves, le temps restant et les réponses alors possibles (`kind: 'decide'`, `ok`), plus « ne pas répondre ». Quand le délai s'écoule sans réponse, `dqNone` fait le même relevé.
- **Valeur d'une réponse (`dqOut`) :** part des cas où elle réussit (issue de 0,5 ou plus) et issue moyenne, pour chaque hypothèse, pondérées par l'estimation. Les tirages de `resolveChoice` (chasse et contre-attaque cyber, sauvetage délégué) y sont recopiés. C'est un calcul exact : aucun tirage n'est consommé.
- **Bon choix :** issue moyenne à 0,15 au plus de la meilleure réponse disponible (`DQ_GAP`). L'affichage donne la part de réussite sur 20 (« réussit 14 fois sur 20 »).
- **Décidé sans vérifier :** aucune preuve en main, une preuve collectable, et au moins la durée d'une analyse plus 10 s avant la fin du délai. Ce signal complète le classement, qui juge le choix à preuves données et ne dit rien de l'effort de vérification.
- **Types couverts (`DQT`) :** `incursion`, `cyber`, `desinfo`, `sar`, `alarm`, `mine`, `evac`, `seabed`, `mirror`, `site`. Non couverts : `seize` (plusieurs décisions successives), `jam`, et les crises à navires ou de combat (`sabotage`, `ghost`, `sub`, `swarm`, `salvo`, `raid`), dont l'issue dépend du déroulement dans le temps.
- **Sans effet sur le moteur ni sur le score :** aucun tirage, aucun état de partie modifié. 600 parties rejouées avant et après (75 scénarios, 2 tirages, 4 stratégies) donnent des résultats identiques.
- **À maintenir :** tout tirage modifié dans `resolveChoice` doit être recopié dans `dqOut`. `stress.js dq` le contrôle sur la ligne « tirages recopiés ».
- **Affichage :** troisième colonne du bilan, après « Estimations et réalité » : pastilles de synthèse, six crises au plus, une phrase d'explication par cas. Visible du seul joueur (garde-fou 7). La note rappelle qu'il s'agit d'un modèle de jeu (garde-fou 9).

**Résultats du 10 novembre 2026, 2 parties par scénario sur 75, scripts :** référence 94 % de bons choix, 1 % sans vérifier ; réponses sans preuve 100 % de bons choix, mais 98 % sans vérifier ; hasard 74 % de bons choix ; aucun ordre 0 %. Omniscient : 83 % de bons choix pour 98 % de réussites, donc 17 % rangés en « chance », puisqu'il réussit sans preuve. Calibrage, stratégies qui ignorent la vérité : réussite annoncée 39 %, 67 % et 90 % ; observée 42 %, 69 % et 90 % (326, 660 et 860 décisions). Tirages recopiés : 74 % attendus, 74 % observés (1 852 décisions).

**Limites :** l'estimation est celle du jeu, pas celle que le joueur avait en tête. Les effets sur les piliers, la tension et les infrastructures ne sont pas comptés. Une issue partielle de 0,5 à 0,69 compte comme réussie, alors que le tableau des crises l'affiche « Partielle ». `mine` est moins bien calibré (81 % annoncés, 91 % observés, 54 décisions). Aucun vrai joueur.

### 5.26 Dynamique navale, domaines et unités terrestres (version 34)

Demande de Naully du 12 novembre 2026 : adopter des mécaniques de *Jane's Fleet Command* pour les scénarios navals, corriger des incohérences (force spéciale activable depuis des sous-menus), ralentir les déplacements, ajouter des onglets Terre, Mer, Air, Cyber. Réponses de Naully : classer l'existant **et** ajouter des unités terrestres ; hélicoptère embarqué, classification par étapes, formation du groupe, temps élargi ; environ −30 % ; partir de la branche du bilan « Décision ou chance ? ». Source : page Wikipédia de *Fleet Command* et manuel de *Command* déjà cités en 5.17. Aucun des deux jeux n'a été joué. Branche `v34-fleet-command`.

**Vitesses (table 5.6 remplacée par ces valeurs)**

- Unités : P-8A 29 (autonomie 155 s), MQ-4C 14, MQ-9A 17, LCS 13, destroyer 18, F/A-18 66 (autonomie 100 s), câblier 10, équipe SEAL 38, allié 13. L'autonomie des avions est allongée d'autant : leur rayon d'action ne change pas.
- Navires civils et adverses : vitesse × 0,7 à la création (`SEAV`, dans `addShip`). Sans cela, un navire fantôme sortait de zone avant d'être rattrapé (banc isolé : 180 s pour le rattraper contre 92 s sur zone).
- Non ralentis : missiles, pistes d'essaim et de salve, avions civils, incursion aérienne, convoi.
- **Temps :** vitesses × 8 et × 16 en plus de × 1, × 2, × 4 (touche 8). Sur téléphone, la barre garde × 1, × 2, × 4 et l'avance rapide. Une crise à échéance ramène toujours à × 1 (5.23).

**Domaines (`UT[k].dom`, `OBCAT`, `FD`, `FTAB`, `OBT`)**

- Quatre domaines : Terre (`sof`, `guard`, `battery`), Mer (`patrol`, `frigate`, `repair`, `ally`), Air (`recon`, `drone`, `armed`, `fighter`, `helo`), Cyber et information (`team`, `analysis`, `comm`).
- Onglets Tous, Terre, Mer, Air, Cyber, avec le nombre d'unités, dans l'onglet Forces du panneau gauche (`ftab`) et dans l'ordre de bataille (`obt`). Un onglet vide est grisé. L'onglet Cyber liste l'équipe cyber (emplois restants, occupée ou non) et les cellules.

**Unités terrestres (nouvelles)**

| Clé | Unité | Indicatif | Vitesse | Capteur | Rôle |
|---|---|---|---:|---:|---|
| `guard` | Peloton de protection (FAST) | FAST | 20 | 20 | Sécurise sans délai le site où il est posté ; +0,15 de chance à la reprise d'un site (`seizeResolve`) s'il est à moins de 30 de la zone |
| `battery` | Batterie de défense côtière (MLR) | MLR | 12 | 90 | Défense 6. Intercepte les missiles à moins de 110, comme un navire, et défend contre salves et essaims l'objet visé à moins de 120. Aucun tir offensif |

- Unités `fixed` : placées sur un site au départ (batterie sur le premier site du scénario, peloton sur le deuxième) ; un ordre de déplacement les envoie vers le site le plus proche du point cliqué (`orderMove`). Pas de patrouille, pas d'allure.
- Noms : FAST (Fleet Antiterrorism Security Team) et MLR (Marine Littoral Regiment) sont des unités réelles du Corps des Marines. Valeurs de jeu fictives, aucun nom ni paramètre d'arme (garde-fou 2).
- Scénarios (`gen_db.py`) : batterie ajoutée aux 18 scénarios dont le script prévoit une salve, un raid ou un essaim ; peloton aux 18 scénarios dont le script prévoit une menace sur un site ou une prise.
- Symboles : APP-6 (infanterie, défense aérienne), faute de pictogramme dans le pack (décision 23).

**Cohérence de la force spéciale**

- L'équipe SEAL passe dans le domaine Terre. Elle n'a plus d'escorte de convoi, de silence radar ni d'allure, qui n'avaient pas de sens pour elle.
- **Sous-menu « Emplois possibles » (`empHtml`, action `uact`) :** la fiche de l'équipe liste les actions que les crises ouvertes lui offrent (action directe, évacuation par la force) et les lance. Ce sont les actions de `crisisActions`, pas une seconde liste.
- Lecture retenue de « les forces spéciales peuvent être activées dans des sous-menus » : pouvoir les engager depuis leur fiche. Autre lecture possible, à confirmer : les embarquer sur un navire.
- Sur téléphone, toucher une unité déjà sélectionnée rouvre son dossier.

**Hélicoptère embarqué (`helo`, MH-60R Seahawk, `heloLaunch`, `heloStep`, `heloOf`, `heloFree`, `embHtml`)**

- Destroyer et LCS en portent un (`UT.helo`). Sous-menu « Moyens embarqués » de leur fiche : lancer (gratuit), puis clic sur la carte pour l'envoyer. Niveau Complet seulement, pas au tutoriel.
- Vitesse 45, capteur 40, autonomie 60 s, 3 bouées. Il suit son bâtiment porteur comme base. Rappel par bouton, ou retour seul à carburant épuisé ; inactif 6 s près du bâtiment, il se pose. 45 s de remise en condition. Détruit, il n'est pas remplacé. Bâtiment porteur perdu : il rejoint le site le plus proche.
- Dossier d'un contact : « Envoyer l'hélicoptère identifier » (1 jeton, comme le drone). Crise `sub` : sans avion à bouées, l'hélicoptère pose 3 bouées.
- Bilan : décollages et contacts identifiés à vue (`exp.helo`, `exp.idd`).

**Classification par étapes (`stgOf`, `idR`, `stgHtml`, `s.trk`, `s.idd`)**

- Contact sans AIS : **Détecté** (position seule), **Classé** (8 s sous capteur, ou localisé, ou une preuve), **Identifié** (une unité à distance d'identification pendant 3 s, ou pavillon vérifié, ou visite).
- Distance d'identification : navire 0,4 × capteur (26 au moins), hélicoptère 30, drone 0,5 × capteur.
- L'identification à vue donne une preuve `visual` (source CONTACT, fiabilité nominale 0,85), sans jeton : le prix est le déplacement. Elle peut être fausse comme toute preuve et ne révèle jamais la vérité.
- Affichage : ligne « Classification » du dossier avec ce qu'il faut faire pour passer à l'étape suivante, et étape dans le tableau des contacts.

**Formation du groupe (`FORMS`, `grpPost`, `postOf`, action `grpf`)**

- Quatre formations, choisies sur la fiche du chef : Cercle (défaut, inchangé), Écran avant (arc à 24 devant le chef), Ligne de file (derrière, tous les 16), Piquet radar (une unité à 45 devant, les autres en garde arrière).
- Les postes tournent avec le cap du chef. Aucune règle de détection ni de combat nouvelle : l'effet vient de la géométrie (capteurs et défense placés devant).

**Corrigé au passage :** les onglets du dossier (5 au niveau Complet) élargissaient la page sur téléphone en anglais (`.dtabs`, défaut de la version 33).

**Mesures du 12 novembre 2026, scripts seulement, niveau Complet, 2 parties par scénario (148 parties par stratégie, tutoriel exclu)**

| Stratégie | Version 33 | Version 34 |
|---|---|---|
| Omniscient | 795 et 94 % | 797 et 95 % |
| Référence | 728 et 74 % | 734 et 82 % |
| Sans aucun tir | 713 et 68 % | 728 et 79 % |
| Tir sans vérifier | 434 et 20 %, seuil 1 dans 52 % | 458 et 24 %, seuil 1 dans 47 % |
| Saturation de messages | 293 et 2 % | 295 et 3 % |
| Aucun ordre | 275 et 2 % | 274 et 3 % |
| Aucune force | 190 et 0 % | 188 et 0 % |

- **La référence passe à 82 %, nettement au-dessus de la cible de 50 à 70 %.** Causes probables, non isolées une à une : la preuve à vue gratuite, les unités terrestres ajoutées à 36 ordres de bataille, des navires adverses plus lents. Aucun réglage n'a été fait pour revenir dans la cible (décision 30).
- Omniscient à 0 % sur `n1` en 2 parties, puis 6 réussites sur 6 sur un second tirage (`scr.js n1 6`) : effet d'échantillon. Aucun ordre réussit parfois `l11`, `c4`, `f2` et `n1` (défaut 31).
- Invariants : 600 parties finies et reproductibles. Clics au hasard : 52 134, aucun blocage, aucun texte manquant, aucune erreur.
- Bancs isolés (8 parties chacun) : hélicoptère, contact identifié 8 fois sur 8 et appareil toujours récupéré ; batterie seule près de l'objet visé par une salve, 1,25 coup reçu contre 6 sans défense ; peloton déjà sur le site, sécurisé sans délai contre 9 s pour un patrouilleur à distance ; navire fantôme rattrapé en 90 s pour 131 s sur zone (68 s pour 92 s en version 33).
- Rythme (`pace2.js`, 12 scénarios × 2, niveau Simple) : 5,0 crises par partie, première crise à 71 s, 74 % du temps sans crise ouverte (5,2, 68 s et 71 % en version 33).
- Conseil seul (`advbot.js 1`, 74 × 1) : 744 et 81 % au niveau Simple, 704 et 78 % au niveau Complet ; référence 775 et 82 %, puis 741 et 74 %. Le conseil seul reste presque aussi efficace que la référence (défaut 12).
- Bilan « Décision ou chance ? » : référence 95 % de bons choix, hasard 77 %, aucun ordre 0 % ; calibrage 40 %, 67 % et 90 % annoncés pour 42 %, 67 % et 89 % observés.
- Tests d'interface : `uiv34`, `uidq`, `ui5`, `uim`, `uim 844`, `uim2`, `uimenu`, `uig`, `uid`, `uih`, `uigrp`, `uiob`, `uip`, `uiqx`, `uit fr 390`, `uit en 1440`, `uis`, `uiq`, `uiw`, `uia` et `uic` sans erreur ni texte manquant.

**Non vérifié :** aucun vrai joueur. Les scripts n'utilisent ni l'hélicoptère (sauf pour les bouées, sans avion), ni les formations, ni les sous-menus : leur intérêt en jeu n'est pas mesuré. La batterie et le peloton sont mesurés sur un banc isolé de 8 parties. Le ressenti du ralentissement et du temps × 8 et × 16 n'est pas observé.

### 5.27 Décisions validées et parcours joués à terre, en mer et dans les airs (version 34, 12 novembre 2026)

**Décisions validées par Naully le 12 novembre 2026** (« Tu peux valider toutes les décisions »), lues comme les cinq décisions posées après la version 34 :

- La force spéciale s'engage depuis sa fiche (décision 27).
- Les noms FAST et MLR sont gardés, la batterie reste défensive (décision 28).
- L'identification à vue reste sans jeton (décision 29).
- La difficulté n'est pas durcie avant des essais avec de vrais joueurs (décision 30).
- L'hélicoptère reste au niveau Complet (décision 31).
- Le bilan « Décision ou chance ? » est gardé tel quel (décision 24).

Les décisions plus anciennes de la section 13 restent ouvertes.

**Méthode.** Trois parties jouées par Claude avec `pt34.js` : vrais clics, tirage fixe, lecture du texte de chaque écran avant de décider, captures aux moments clés. Terre : « Double prise » (`d3`), niveau Simple, jusqu'au bilan. Mer : « Voie Nord » (`ic`), niveau Complet, jusqu'à la crise sous-marine. Air : « Bastion du Nord » (`i9`), niveau Simple, jusqu'à la première incursion. Ce n'est pas un test avec de vrais joueurs.

**Défauts trouvés et corrigés**

| Domaine | Constat | Correction |
|---|---|---|
| Terre | Le site du peloton de protection était capturé sous son nez | Une prise se reporte sur un site non gardé (`l.guard.det`) : poster le peloton devient un choix |
| Terre | Batterie posée sur le site visé, réserve intacte : le destroyer, premier de la liste, prenait toutes les interceptions | Le défenseur le plus proche du missile intercepte |
| Terre | Redéployer en cliquant près d'un site sélectionnait l'unité déjà là | Sous-menu « Redéployer vers », un bouton par site avec la durée du trajet (`fixHtml`, action `redep`) |
| Terre | « Tracer une patrouille » proposé au peloton, à la batterie et à l'équipe SEAL | Retiré pour les unités terrestres |
| Terre | Les navires du raid venaient se poser sur le site attaqué | Ils s'arrêtent à 70 du site |
| Terre | Fiche SEAL : « Emplois restants » et « Sorties restantes » en double ; « Plus aucune action » pendant l'action | Une seule ligne ; « Action en cours » |
| Terre | Niveau Simple : le raid conseillait de régler la posture, absente de ce niveau | Conseil propre au niveau Simple (`tip.raid.s`) |
| Mer | **Hypothèse du carburant cédée : un avion à sa base se ravitaillait en boucle et perdait toutes ses sorties en une seconde.** Défaut antérieur à la version 34 | Le seuil de ravitaillement suit la dotation réduite |
| Mer | Écran avant : l'escorteur ne rattrapait jamais son poste, le chef avançant presque aussi vite | Hors du cercle, le chef ralentit (× 0,55) tant qu'un membre est à plus de 10 de son poste |
| Mer | L'hélicoptère envoyé identifier donnait deux preuves pour un jeton, dont une « Image du drone » | Une seule preuve, l'observation directe |
| Mer | « Sonar héliporté » du destroyer sans lien avec l'hélicoptère | Au niveau Complet, l'hélicoptère va tremper son sonar sur zone (destroyer à moins de 220 de la zone) ; indisponible si l'hélicoptère est perdu |
| Mer | Une alerte ou une zone ne pouvait être observée que par l'avion | Sans avion, l'hélicoptère d'un navire à moins de 220 observe (`eyeAct`, `a.visualh`) |
| Mer | Un navire qui a tiré restait « Classé » | Il est « Identifié » |
| Air | Incursion : « Vous avez une minute », alors que le délai est de 90 s ou de 30 s | Le texte renvoie au compte à rebours |

**Constats non corrigés**

- Sélection : donner un ordre de déplacement ferme la fiche de l'unité. Pour enchaîner (route, puis hélicoptère), il faut la resélectionner.
- Carte chargée autour d'un site défendu : peloton, batterie, équipe SEAL, destroyer et navires adverses se recouvrent (défaut 8).
- Deux minutes sans rien à décider avant la première crise de `d3` ; l'avance rapide est nécessaire.
- `d3` gagnée (641 points, 3 étoiles) en laissant trois crises sans réponse (défaut 33).
- Incursion : la preuve radar reprend mot pour mot l'indice déjà affiché dans la situation.
- Alerte radar en pleine mer : la réponse proposée est un navire, pas les chasseurs.
- Les unités traversent la carte en une minute environ, même ralenties : l'échelle de temps reste abstraite.
- Partie aérienne courte : une seule incursion jouée. Essaim et salve n'ont pas été rejoués à la main.

**Mesures après ces corrections :** voir section 8.

### 5.28 Vues, ordres par domaine, guerre électronique et cyberattaque révélée (version 35)

Demande de Naully du 12 novembre 2026, avec deux vidéos. « Mode macro » : réponse de Naully « Les deux » (vue d'ensemble et vue tactique, plus des ordres par domaine). Les deux vidéos sont des tutoriels du jeu *Sea Power* (version 0.1.0.x), analysés par images toutes les 25 s ; le commentaire n'a pas été transcrit et le jeu n'a pas été joué. Retenu de la vidéo sur la guerre électronique : un brouilleur agit dans un secteur dessiné sur la carte, et l'unité qui émet se dévoile. Aucune valeur ni aucun nom de système n'est repris. Existaient déjà : la détection des émissions (cercles de signal, `emitSignal`) et le brouillage adverse (crise `jam`). Branche `v34-fleet-command`, non fusionnée dans `main`.

**Vues (`VIEW`, `setView`, `viewFree`, `tacPt`, `TAC_R`, `renderMacro`)**

- **Vue d'ensemble**, bouton de la colonne de zoom ou touche V : tout le théâtre, trafic déclaré masqué, crises nommées avec leur délai, bandeau par domaine (nombre d'unités, dernier ordre) qui ouvre l'onglet Forces sur ce domaine. Le même bouton rend la caméra précédente.
- **Vue tactique**, bouton ou touche T : la carte se centre sur la sélection (unité, contact ou crise), zoome sur un rayon d'environ 190 et la suit. Cercles de distance à 50, 100 et 150, cercle d'identification à vue, cercle de brouillage, capteurs de toutes les unités. Sans sélection, elle s'explique et ne s'active pas.
- Déplacer la carte quitte la vue ; zoomer quitte la vue d'ensemble. Affichage seulement : aucune règle n'en dépend. Disponibles aux deux niveaux.

**Ordres par domaine (`DOMO`, `domUnits`, `domTargets`, `domOrder`, `domHtml`, action `domo`)**

- Dans l'onglet Forces, sous l'onglet Terre, Mer ou Air. Terre : rallier les crises, tenir la position. Mer : rallier les crises, protéger les sites, tenir la position. Air : rallier les crises, rappeler, tenir la position.
- Ils ne touchent que les unités libres : ni en visite, secours, action directe, pression, escorte ou retour, ni membres d'un groupe, ni câblier, ni allié, ni hélicoptère embarqué.
- « Rallier les crises » envoie chaque unité vers la crise ouverte ou le contact sans transpondeur non identifié le plus proche, une cible différente par unité tant qu'il en reste. À terre, seules les crises proches d'un site comptent.
- Ce sont des déplacements ordinaires (`orderMove`) : gratuits, soumis aux mêmes retards. Pas au tutoriel. Le bilan compte les ordres donnés.

**Brouillage (`jamShip`, `JAM_R` 150, `UT[k].jam`, action `jam`)**

- Destroyer et chasseurs portent un brouilleur. Niveau Complet, contact sans transpondeur visible, unité à moins de 150 : 1 jeton, posture Contraindre.
- Pendant 30 s, un navire armé brouillé ne vise plus qu'à 110 au lieu de 175 et ses tirs perdent 0,2 de chance. L'unité qui brouille repasse en radar actif : l'adversaire la voit. Secteur violet sur la carte.
- Tension +0,05 contre un navire armé, saboteur ou fantôme. Contre un autre navire : −1, −2 et −1 sur les piliers, sans message, révélé au bilan (le journal ne dit pas la vérité).

**Cyberattaque sur un contact (`cyberStrike`, `CYB`, actions `blind` et `cslow`)**

- Aveugler (25 s sans tir, existant) ou ralentir (vitesse × 0,5 pendant 40 s, niveau Complet). Équipe cyber, 1 jeton, posture Contraindre.
- **Changement de règle :** l'aveuglement réussissait toujours. La cyberattaque réussit maintenant avec une chance de 0,75, 0,85 si le contact est identifié.
- **Repérage :** chance de 0,3, +0,2 si l'attaque a échoué, +0,25 si la cible n'était ni navire armé, ni saboteur, ni fantôme. Repérée, elle ouvre une crise publique dans 55 % des cas (toujours si la cible n'était pas hostile), 20 à 40 s plus tard ; sinon tension +0,2 et −2 en cohésion sociale. La carte de décision affiche « Repérage : 30 % au moins ».
- Garde-fou 3 : effets seulement, aucune technique.

**Crise `expose`, « Cyberattaque révélée »**

- Hypothèses : accusation étayée (40 %), accusation sans preuve (35 %), révélation par un tiers (25 %). Délai 60 s, compte à rebours de décision. À l'ouverture : −2, −4 et −1 sur les piliers (−6 en cohésion sociale si la cible n'était pas hostile).
- Vérifier : recoupement de sources, partenaire. Répondre : assumer et expliquer, démentir, ne pas commenter (gratuit).
- Issues (`EFF.expose`) : assumer 0,9 / 0,3 / 0,8 ; démentir 0 / 0,8 / 0,2 ; ne pas commenter 0,3 / 0,7 / 0,5 ; sans réponse 0 / 0,4 / 0,1. Assumer une accusation sans preuve donne à l'adversaire l'aveu qui lui manquait.
- Prise en charge par le conseil et les scripts (`deepPick`), par le bilan « Décision ou chance ? » (`DQT`).

**Bilan et fiches :** cyberattaques, repérées et crises publiques ; brouillages, dont sur un navire non hostile ; ordres par domaine. Dossier d'un contact : ligne « Guerre électronique » (brouillé, aveuglé, ralenti). Fiche d'unité : brouilleur.

**Corrigé au passage :** sur téléphone, les boutons +, − et Couches étaient sous la carte et ne recevaient pas les clics.

**Mesures du 12 novembre 2026, scripts seulement**

- Équilibre, niveau Complet, 2 parties par scénario : identique à la version 34 corrigée (section 8). Les scripts de référence n'emploient pas ces mécaniques.
- Bancs isolés : 200 cyberattaques par cas. Contre un navire armé : effet 74 %, repérée 34 %, crise publique 17 %. Contre un navire civil : effet 70 %, repérée 62 %, crise publique 62 %. Brouillage : un navire armé à 140 du destroyer tire dans les 25 s 8 fois sur 8 sans brouillage, 0 fois sur 8 avec.
- @@EW@@
- Tests : `uiv35.js` (vrais clics, FR 1440 et EN 390, niveaux Complet et Simple) et les 21 autres tests d'interface sans erreur ni texte manquant ; clics au hasard sans blocage.
- Un raid de « Double prise » joué pas à pas (`pt34.js`) : le navire armé tire à 175 alors que le brouilleur porte à 150 ; il faut s'approcher ou envoyer les chasseurs.

**Non vérifié :** aucun vrai joueur. L'utilité des deux vues et des ordres par domaine n'est mesurée par aucun script. Le dilemme de la crise publique n'a été lu que sur ses tables. Le commentaire des vidéos n'a pas été entendu.

## 6. Structure du code

`src.html` est volontairement compact : certaines lignes sont très longues. Cherche par nom de fonction ou par chaîne exacte. Ne reformate pas tout le fichier, sauf si Naully demande une migration.

| Zone | Éléments |
|---|---|
| Textes | `I18N.fr`, `I18N.en`, `t(clé, {a,b})`, `L10(objet)` |
| Carte | `isLand`, `seaAt`, `nearSea`, `route`, `lane`, `qb` |
| Données | `DBD`, `SC`, `ASM`, `SECT`, `SPOTS`, `UT`, `CR`, `EFF`, `SRC`, `DECK` |
| Partie | `newGame`, `revealPhase`, `drawAssumptions`, `applyAsm`, `newTurn`, `step`, `stepOps` |
| Preuves | `addEv`, `posterior`, `shared`, `classify`, `evText` |
| Prise en main | `escAct`, `runAfterP`, `autoCls`, `leading`, `autoPause`, `resumeAfterOrder`, `advise`, `applyAdvice`, `COACH`, `coachEnter` |
| Diplomatie | `mkDip`, `dipAdj`, `dipReact`, `dipTick`, `dipTurn`, `dipActions`, `dipBest`, `dipPanel`, `dipEnd`, tables `DIP`, `DIP_AFF`, `DIP_EV`, `DIP_REQ` |
| Crises | `startCrisis`, `crisisActions`, `shipActions`, `doAct`, `respond`, `resolveChoice`, `failCrisis`, `closeCrisis`, `applyEff` |
| Directeur | `launch`, `warn`, `director`, `friction` |
| Combat | `stepCombat`, `stepSwarm`, `raiderAI`, `fireAt`, `hitUnit`, `hitShip`, `pkPen` |
| Doctrine et missions | `docWhy`, `setDoc`, `evN`, `setReact`, `reactStep`, `reactOk`, `placeExcl`, `liftExcl`, `exclStep`, `docHtml`, `reactHtml`, `docEnd` |
| Objectifs et fiches | `opordHtml`, `objCond`, `objCount`, `objNA`, `isGuard`, `WIN_SHARE`, `screenDeck`, `obSheet`, `unitSheet`, `setThr`, `trackHtml`, `hiGeo`, `drawScale` |
| Groupes et commandes | `grpForm`, `grpBreak`, `grpLeave`, `grpStep`, `uSpd`, `grpHtml`, `contHtml`, `ponHit`, `ctxShow`, `ctxDo`, `hotkey`, `briefDoc`, `briefTips`, `expEnd` |
| Fin | `score`, `chain`, `recordRun`, `compareHtml`, `showEnd` |
| Décision ou chance | `DQT`, `DQ_GAP`, `dqOut`, `dqSnap`, `dqMark`, `dqNone`, `dqEval`, `dqAll`, `dqHtml` |
| Interface | `screenHome`, `screenHow`, `renderDock`, `coachTick`, `renderLay`, `actsHtml`, `coaMeta`, `screenMode`, `screenBrief`, `screenDeck`, `showFrago`, `renderLeft`, `renderRight`, `renderHud`, `draw` |
| Affichage par exception | `dOpen`, `DOPEN`, `hudDelta`, `HUDP`, `advOn`, `unitAdv`, `thrHtml` |
| Charte et symboles V2 | tokens `:root`, `V2C`, `v2St`, `v2Path`, `drawV2`, `v2URL`, `v2Ships`, `SYM.ships`, `V2D`, `v2Glyph`, `V2K`, `V2S` |
| Version 35 | `VIEW`, `setView`, `viewFree`, `tacPt`, `renderMacro`, `DOMO`, `domUnits`, `domTargets`, `domOrder`, `domHtml`, `JAM_R`, `CYB`, `ewHost`, `cyberStrike`, `jamShip`, `ewHtml` |
| Version 34 | `fixHtml`, `siteOf`, `eyeAct`, `SEAV`, `FD`, `FTAB`, `OBT`, `empHtml`, `embHtml`, `heloLaunch`, `heloStep`, `heloOf`, `heloFree`, `heloShip`, `heloFly`, `idR`, `stgOf`, `stgHtml`, `FORMS`, `grpPost`, `postOf` |
| Écrans v33 | `hms`, `dosHead`, `DTAB`, `evBlocks`, `relN`, `histHtml`, `renderNav`, `MV`, `renderMleg`, `applyA11y`, `PRES`, `CVD` |
| Tests | `window.__S`, à garder à la fin du script |

**Principe clé :** `crisisActions`, `shipActions` et `dipActions` sont la seule source des actions possibles. L'interface et les scripts lisent la même liste. Ne crée jamais un bouton ou une règle de test qui contourne cette liste.

## 7. Modifier le contenu

### Ajouter un scénario

Dans `gen_db.py`, ajoute un appel `S.append(sc(...))` avant la boucle `for x in S:`.

1. Donne un identifiant unique, le secteur (`shet`, `north`, `gap`, `nsea` ou `all`), le mode et la difficulté de 1 à 3.
2. Écris le titre, la description et le briefing en français et en anglais. Le briefing doit paraître crédible et rester partiellement faux en hypothèses contestées.
3. Propose une liste de forces recommandées dans le budget. `gen_db.py` affiche le coût pour le vérifier.
4. Donne 4 ou 5 hypothèses, liées au thème.
5. Définis 3 phases et leurs objectifs : `patrol`, `close`, `escort`, `hold`.
6. Ajoute un `script` de crises `[tour, type, argument]`, et un `pool` pour le directeur.
7. Prévois pour chaque objectif `close` une crise de ce type dans le script.
8. Vérifie que le joueur omniscient peut réussir (section 8).

### Ajouter une hypothèse

Ajoute `H(id, famille, plan fr, plan en, changement fr, changement en)` dans `gen_db.py`, puis un `case` dans `applyAsm`. Le `case` renvoie `false` si l'effet est impossible avec le deck, par exemple sans unité navale. Mesure ensuite son effet avec `stress.js pair`.

### Ajouter un type de crise

1. Déclare-le dans `CR`, avec hypothèses, probabilités, délai et alerte.
2. Crée-le dans `startCrisis` : `title`, `desc`, `zone`, données propres.
3. Ajoute ses actions dans `crisisActions`.
4. Ajoute ses effets dans `EFF` et sa résolution dans `resolveChoice`.
5. Si elle évolue dans le temps, ajoute sa logique dans `stepOps` ou `stepCombat`.
6. Ajoute ses textes : `c.x`, `c.x.d`, `w.x`, `hn.*`, `hy.*`, `ob.*`.
7. Ajoute son dessin dans `draw`, sa prise en charge dans `bots.js` et un test isolé dans `stress.js`.

### Ajouter une unité

Déclare-la dans `UT`, puis dans `DECK` et dans chaque entrée de `SPOTS`. Ajoute `u.x`, `s.x` et `d.x` dans les deux langues. Mets à jour son prix dans le dictionnaire de contrôle de `gen_db.py`, et vérifie toutes les listes recommandées.

### Textes

- Tout texte visible passe par `I18N`, en français et en anglais, dans le même commit de travail.
- Français : guillemets « », espace avant `:`, `;`, `?`, `!`, `%`. Apostrophe typographique dans les textes affichés.
- Évite le jargon, les slogans et les tirets longs. Une action se nomme par un verbe. Une erreur explique pourquoi l'action est impossible.
- `__S.missing()` doit rester vide.

## 8. Tests obligatoires

Après chaque modification du moteur :

```bash
cd proto
python3 build.py
TAG=essai node stress.js 2 monkey labo   # rapide
```

Avant toute publication :

```bash
TAG=essai node stress.js 4 inv exploit pair labo   # plus de 5 minutes
node ui5.js                                        # parcours avec vrais clics et mobile
node uih.js; node uis.js; node uiw.js; node uid.js; node uiq.js   # accueil, forces spéciales, théâtres, diplomatie, nouvelles crises
node uip.js                                            # parcours de patrouille, 1440 et 390 px
node uicmo.js; node uicmo_end.js                      # doctrine, réaction, zone d'exclusion, bilan, 1440 et 390 px
node uigrp.js; node grpcmp.js 2                        # groupe tactique, clic droit, raccourcis, contacts, pertes ; référence contre groupe
node uiob.js                                           # ordre de bataille, ordre d'opération, fiche, allure, zoom, côtes
node uimenu.js; node uiqx.js                           # menu de partie ; exercice rapide, allocation, esquive, avance rapide
node pace2.js t.html 2 simple                          # rythme : crises par partie, première crise, temps sans crise
node ../cmo_all.js                                     # référence, réactions, zone et gâchette sur 74 scénarios
node uit.js fr 390; node uit.js en 1440                # tutoriel
node mkt.js 1                                          # clics au hasard par scénario, avec durées, environ 6 min
node uim.js; node uim.js 844 390; node uim2.js          # écrans au format téléphone, compte à rebours et losanges
TIMER=hard node stress.js 2 exploit                    # équilibre en mode difficile
node scr.js f1,f2 4                                    # référence, omniscient, aucun ordre par scénario
node uih.js                                        # écran d'accueil, entrée en jeu, retour, 390 et 1920 px
node uit.js fr 1440 && node uit.js en 390          # tutoriel complet avec de vrais clics
node uig.js                                        # escalade, pause automatique, conseil, mobile
node advbot.js 2                                   # rien, conseil seul et référence, guidé ou complet
node uid.js                                        # règles diplomatiques, demandes, mobile
node dipm.js 1                                     # cohésion, retraits, demandes et canal par stratégie
node stress.js 2 dq; node uidq.js                  # bilan « Décision ou chance ? » : calibrage, stratégies, affichage
node uiv34.js                                      # version 34 : domaines, terrestres, hélicoptère, étapes, formations, temps
node uiv35.js; node ewcmp.js 4                     # version 35 : vues, ordres par domaine, brouillage, cyber ; référence avec brouillage ou cyber
```

Ces commandes sont longues : lance-les en arrière-plan quand l'environnement le permet.

| Partie | Ce qu'elle contrôle | Critère |
|---|---|---|
| `inv` | Valeurs invalides, bornes, terres, crises bloquées, reproductibilité | Aucun défaut sérieux, aucune partie non finie, même résultat à tirage identique |
| `exploit` | Stratégies abusives et joueur omniscient | Omniscient > référence > aucun ordre. Spam, aucun ordre et deck vide très bas |
| `pair` | Tenues, contestées, horloge idéale sur un même tirage | Écart interprété avec prudence, et hypothèses dont l'effet a le bon signe |
| `labo` | Chaque mécanique isolée | Chaque système sert à quelque chose et reste jouable |
| `deck` | Valeur des cartes sur des decks au hasard | Aucune carte indispensable ni inutile partout |
| `monkey` | Clics au hasard dans les deux langues | Aucune erreur page, aucun texte manquant, bilan toujours atteint |
| `dq` | Bilan « Décision ou chance ? » sur cinq stratégies | Réussite annoncée proche de l'observée, tirages recopiés exacts, le hasard fait plus de choix fragiles que la référence |

**Résultats du 12 novembre 2026, version 35 et version 34 après les corrections des parties jouées, niveau Complet, 2 parties par scénario :** omniscient 788 et 92 %, référence 741 et 82 %, sans aucun tir 740 et 81 %, tir sans vérifier 464 et 24 % avec 45 % de seuil 1, saturation 296 et 3 %, aucun ordre 275 et 3 %, aucune force 188 et 0 %. Les deux versions donnent les mêmes chiffres : les scripts n'emploient ni brouillage ni cyberattaque. Omniscient à 0 % sur `e3` et `n1` en 2 parties, puis 6 réussites sur 6 sur un autre tirage (`scr.js e3,n1,d3 6`) : effet d'échantillon. Invariants : 600 parties finies et reproductibles. Clics au hasard : 52 315, aucun blocage, aucun texte manquant, aucune erreur. Rythme (`pace2.js`) : 4,9 crises par partie, première crise à 71 s, 76 % du temps sans crise ouverte. Conseil seul (`advbot.js 1`) : 747 et 82 % au niveau Simple, 708 et 78 % au niveau Complet ; référence 767 et 80 %, puis 745 et 74 %. Détail de la version 35 : section 5.28.

**Résultats du 12 novembre 2026, version 34 avant ces corrections (dynamique navale, domaines, unités terrestres), niveau Complet, 2 parties par scénario :** omniscient 797 et 95 %, référence 734 et 82 %, sans aucun tir 728 et 79 %, tir sans vérifier 458 et 24 % avec 47 % de seuil 1, saturation 295 et 3 %, aucun ordre 274 et 3 %, aucune force 188 et 0 %. **La référence dépasse nettement la cible de 50 à 70 %** (74 % en version 33). Invariants : 600 parties finies et reproductibles. Clics au hasard : 52 134, aucun blocage, aucun texte manquant, aucune erreur. Détail, bancs isolés et tests d'interface : section 5.26.

**Résultats du 10 novembre 2026, version 33 (charte complète) puis branche `dq-bilan-decision-chance`, niveau Complet, 2 parties par scénario :** omniscient 795 et 94 %, référence 728 et 74 %, tir sans vérifier 434 et 20 %, aucun ordre 275 et 2 % (moyennes par partie, tutoriel exclu). Les 2 100 parties du volet `exploit` donnent le même score et la même issue en version 32, en version 33 et avec le bilan « Décision ou chance ? » : ni la charte ni ce bilan ne touchent au moteur. Invariants : 600 parties finies et reproductibles. Clics au hasard : 52 414, aucun blocage, aucun texte manquant, aucune erreur. `stress.js dq` : voir 5.25. Tests d'interface sur la branche du bilan : `uidq`, `ui5`, `uim`, `uim 844`, `uim2`, `uimenu`, `uig`, `uid`, `uih`, `uigrp`, `uiob`, `uip`, `uiqx`, `uit fr 390`, `uit en 1440`, `uis`, `uiq`, `uiw`, `uia` et `uic` sans erreur ni texte manquant.

**Résultats du 10 novembre 2026, version 32 (retours de bêta, charte), niveau Complet, 2 parties par scénario :** omniscient 796 et 94 % (aucun scénario à 0 %), référence 728 et 73 %, tir sans vérifier 438 et 21 % avec 51 % de seuil 1, sans aucun tir 713 et 67 %, saturation 293 et 2 %, aucun ordre 275 et 2 %, aucune force 190 et 0 %. Identique à la version 31 : les changements sont d'interface, de charte et de règles de temps que les scripts ne ressentent pas. Invariants : 600 parties finies et reproductibles. Clics au hasard : 52 500, aucun blocage, aucun texte manquant, aucune erreur. Rythme (`pace2.js`, 12 scénarios × 2, niveau Simple) : 5,2 crises par partie, première crise à 68 s, 71 % du temps sans crise ouverte. Conseil seul (`advbot.js 1`, 74 × 1) : 702 et 66 % au niveau Simple, 683 et 78 % au niveau Complet ; référence 730 et 70 %, puis 720 et 73 %. Tests d'interface : `ui5`, `uimenu`, `uig`, `uiob`, `uigrp`, `uip`, `uiqx`, `uih`, `uit fr 390`, `uit en 1440`, `uis`, `uiq`, `uiw`, `uid`, `uim`, `uim 844`, `uim2`, `uia` et `uic` sans erreur ni texte manquant ; `ui5`, `uimenu`, `uim`, `uim 844` et `uim2` relancés sur l'assemblage final après le correctif du bandeau mobile.

**Résultats du 9 novembre 2026, version 31 (passe complète), niveau Complet, 2 parties par scénario :** omniscient 796 et 94 % (aucun scénario à 0 %), référence 728 et 73 %, tir sans vérifier 438 et 21 % avec 51 % de seuil 1, sans aucun tir 713 et 67 %, saturation 293 et 2 %, aucun ordre 275 et 2 %, aucune force 190 et 0 %. La référence dépasse la cible de 50 à 70 %, comme depuis la version 27. Invariants : 600 parties finies et reproductibles. Clics au hasard : 52 500, aucun blocage, aucun texte manquant, aucune erreur. Rythme (`pace2.js`, 12 scénarios × 2, niveau Simple, script) : 5,2 crises par partie contre 4,6 en version 30 ; première crise à 68 s contre 86 s ; 71 % du temps sans crise ouverte contre 76 % (le script décide en 5 s). Tests d'interface : `ui5`, `uimenu`, `uig`, `uiob`, `uigrp`, `uip`, `uiqx`, `uih`, `uit fr 390`, `uit en 1440`, `uis`, `uiq`, `uiw`, `uid`, `uim`, `uim2`, `uia` et `uic` sans erreur ni texte manquant.

**Résultats du 7 novembre 2026, version 29 (menu, corrections), niveau Complet, 2 parties par scénario :** omniscient 792 et 94 % (plus aucun scénario à 0 %), référence 719 et 71 %, tir sans vérifier 453 et 20 % avec 47 % de seuil 1, saturation 294 et 3 %, aucun ordre 276 et 3 %, aucune force 189 et 0 %. Invariants : 600 parties finies et reproductibles. Clics au hasard : 52 414, aucun blocage. `uimenu`, `uiqx`, `uiob`, `uigrp`, `uip`, `ui5`, `uit fr 390`, `uit en 1440`, `uih` sans erreur.

**Résultats du 7 novembre 2026, version 28 (exercice rapide, esquive, allocation), niveau Complet, 2 parties par scénario :** omniscient 779 et 90 %, référence 716 et 71 %, tir sans vérifier 452 et 19 % avec 47 % de seuil 1, saturation 294 et 3 %, aucun ordre 276 et 3 %, aucune force 189 et 0 %. Invariants : 600 parties finies et reproductibles. Clics au hasard : 52 500, aucun blocage. `uiqx`, `uiob`, `uigrp`, `uip`, `ui5`, `uit fr 390`, `uih` sans erreur. Omniscient à 0 % sur `ib`.

**Objectifs actuels d'équilibre :**

- Joueur omniscient : au moins 80 % de réussite, et jamais 0 % sur un scénario.
- Référence : entre 50 et 70 %.
- Aucun ordre et saturation de messages : moins de 10 %.
- Tirer sans vérifier : nettement sous la référence et souvent au seuil 1.

**Résultats du 7 novembre 2026, après refonte des objectifs (règle à 80 %, consignes obligatoires, tâches sans objet), 2 parties par scénario :** omniscient 761 et 90 %, référence 707 et 73 %, tir sans vérifier 447 et 21 % avec 47 % de seuil 1, aucun ordre 255 et 3 %. La référence dépasse un peu la cible ; le script identifie maintenant les contacts, il est donc plus fort qu'avant.

**Résultats du 7 novembre 2026, après groupes tactiques, contacts, pause automatique et bilan des pertes, niveau Complet, 2 parties par scénario :** omniscient 755 et 89 %, référence 693 et 67 %, tir sans vérifier (doctrine Libre) 465 et 29 % avec 45 % de seuil 1, saturation 278 et 2 %, aucun ordre 258 et 2 %, aucun achat 160 et 0 %. Invariants : 600 parties, toutes finies et reproductibles. Clics au hasard : 52 414, aucun blocage, aucune erreur. Omniscient à 0 % sur `e3` et `c3` (2 parties). `ui5.js`, `uip.js`, `uigrp.js` sans erreur. `uicmo.js`, `uicmo_end.js` et `cmo_all.js` n'étaient pas dans l'archive de cette session et n'ont pas été relancés.

**Résultats du 7 novembre 2026, après doctrine de tir, réaction et zone d'exclusion, niveau Complet, 4 parties par scénario sur 75 :** omniscient 750 et 87 %, référence 696 et 69 %, tir sans vérifier (doctrine Libre) 471 et 34 % avec 45 % de seuil 1, saturation 278 et 4 %, aucun ordre 257 et 4 %, aucun achat 160 et 0 %. Invariants : 1 200 parties, toutes finies et reproductibles. Clics au hasard : 52 414, aucun blocage. Omniscient jamais à 0 % ; plus bas : `l11`, `d3`, `e3`, `m5`, `c3` à 25 %. La référence touche le haut de la cible.

**Résultats après allongement, 5 novembre 2026, 2 parties par scénario, mode facile :** omniscient 761 et 92 %, référence 692 et 68 %, tir sans vérifier 441 et 33 %, aucun ordre 236 et 5 %. **Rythme sur 12 parties :** 4,8 crises par partie contre 6,3, écarts de moins de 45 s 11 % contre 63 %, temps avec 2 crises ou plus 2 % contre 13 %. 

**Résultats précédents :** mode facile, omniscient 728 et 89 %, référence 662 et 59 %, tir sans vérifier 492 et 39 %, aucun ordre 222 et 3 %. Mode difficile, omniscient 730 et 91 %, référence 640 et 54 %, tir sans vérifier 480 et 39 %, aucun ordre 213 et 4 %. Les scripts réagissent toutes les 5 s et ne ressentent pas la pression : cet écart ne mesure pas le stress.

**Résultats antérieurs**, 5 novembre 2026, 2 parties par scénario sur 69, à lire comme un ordre de grandeur : omniscient 730 et 90 %, référence 657 et 59 %, réponses sans preuve 639 et 61 %, arraisonner tout suspect 638 et 55 %, tir sans vérifier 490 et 38 %, saturation 223 et 4 %, aucun ordre 217 et 4 %, aucun achat 120 et 0 %.

**Toujours :**

- Annonce la taille d'échantillon. Avec 4 parties, seuls les grands écarts comptent.
- Compare scénario par scénario, pas uniquement la moyenne.
- Regarde au moins une capture après un changement d'interface. Teste aussi à 390 px de large : pas de défilement horizontal.
- Ne cale pas les réglages jusqu'à obtenir exactement la cible sur un seul tirage.
- Ne fais pas confiance à une moyenne qui contredit un résultat isolé : cherche la cause.

## 9. Erreurs déjà rencontrées

Vérifie ces points avant de chercher ailleurs :

- `display:flex` annule l'attribut `hidden` : la règle `[hidden]{display:none!important}` doit rester.
- `authAt` à 0 vaut faux en JavaScript : dans un test, utilise `0.01` si `S.t` vaut 0.
- Une unité détournée doit libérer sa crise : voir le nettoyage au début de `crisisActions`.
- Réparer un câble est interdit si un adversaire attaque n'importe quel point de ce câble, pas seulement à proximité de la réparation.
- Les pertes survenues avant la révélation d'un objectif ne doivent pas le faire échouer : champ `since`.
- Une crise exigée par un objectif ne doit pas rester bloquée dans la file : fonction `needed`.
- Le script de test réagit toutes les 5 s. `BOTCAD` règle cette cadence. Un script à 1 s masque les problèmes de temps.
- Le script ne ressent pas la pression. Ne conclus jamais que l'horloge est bonne à partir de lui seul.
- Une hypothèse qui améliore le score doit être examinée : soit elle retire un coût caché, comme la traque de signaux, soit l'échantillon est trop petit.
- Les navires doivent suivre `route` ou `retreat`, jamais une ligne droite à travers les terres.
- Toute valeur aléatoire du moteur passe par `R()`, sinon la reproductibilité est perdue. `Math.random` reste réservé au son et au choix d'un nouveau tirage.
- Le stockage local passe par `try/catch` : il peut être indisponible.
- Une variable d'état ne sert qu'à une chose. `S.lastC` datait à la fois la dernière crise close et la dernière alerte de contact : chaque contact retardait la crise suivante (corrigé en version 31, `S.lastCt`).
- Un bloc `details` écrit par `innerHTML` se referme à chaque redessin. Utilise `dOpen('clé')`, qui garde l'état dans `DOPEN`. Ne cherche jamais un repli par `document.querySelector('details.more')` : il y en a plusieurs.
- Un test d'interface qui clique sur la carte peut tomber sur un panneau si la mise en page change. Vérifie la cible avec `elementFromPoint` avant de conclure à un défaut du jeu.
- Ne reconstruis pas `t.html` pendant qu'un banc d'essai tourne : chaque nouvelle page chargerait la version suivante.

## 10. Publication

- Publie toujours `proto/seuil-prototype.html` sur le même artifact : https://claude.ai/artifact/KaK2ridxo66GrAZPuQUVU7. Depuis une autre conversation, lis-le d'abord avec l'action de lecture, puis publie avec son URL.
- Ne publie pas si un test obligatoire échoue ou si un texte manque.
- Le son démarre après un clic. Tout est embarqué dans la page, sauf les polices Google. La page pèse environ 6,3 Mo.
- Après publication, résume le changement en une phrase. Le lien apparaît déjà dans la carte.
- L'artifact est privé tant que Naully ne le partage pas.

## 11. Mise à jour du dossier de conception

Le dossier suit le jeu. La section « Mécanique refondue et prototype » prévaut sur les sections plus anciennes. Après un changement de règle :

1. Lis les modifications depuis ta dernière lecture.
2. Corrige les règles concernées, sans créer de doublon.
3. Remplace les résultats périmés en précisant l'échantillon.
4. Ajoute les sources consultées dans la section Sources.
5. Mets à jour ce fichier, notamment les sections 5, 8 et 13.

## 12. Définition de « terminé »

Une évolution est terminée si :

- elle fonctionne dans les deux langues et à 390 px ;
- les tests adaptés passent et les résultats sont lus ;
- `bots.js` et `stress.js` savent la jouer ;
- le joueur peut comprendre pourquoi une action est impossible ;
- le bilan permet de comprendre ses effets ;
- les garde-fous restent respectés ;
- le dossier et ce fichier sont à jour ;
- la réponse à Naully indique clairement ce qui n'a pas été vérifié.

## 13. Points ouverts

### Décisions qui reviennent à Naully

1. **Attribution :** garder « présumés russes » dans l'incursion, ou anonymiser.
2. **Durée :** un tour de 30 s convient-il à un joueur réel pour analyser ?
3. **Maquettes et vidéos :** les aligner sur cette version ou les archiver.
4. **Suite technique :** quand passer du prototype à TypeScript et three.js.
5. **Noms de pays :** garder Norvège, Royaume-Uni, Danemark et Islande dans le scénario fictif, ou les remplacer avant toute diffusion publique ou institutionnelle.
6. **Force du conseil :** le garder assez fort pour qu'un débutant gagne, ou l'affaiblir pour renforcer l'esprit critique.
7. **Doctrine de départ :** le joueur peut maintenant la fixer au briefing (niveau Complet), avec Stricte hors combat et essaim, Normale sinon, présélectionnée. Garder ce choix libre, ou l'imposer par scénario.
9. **Groupe tactique :** le garder gratuit et réservé aux navires, ou lui donner un coût (coordination) et l'ouvrir aux avions.
10. **Règle de réussite :** garder 80 % des tâches et des consignes obligatoires, ou revenir à 70 %.
11. **Licence des côtes détaillées :** les données OpenStreetMap sont sous ODbL. Pour une diffusion publique ou commerciale, vérifier les obligations de partage de la base dérivée, ou remplacer par une source du domaine public.
12. **Forces américaines :** tranché le 7 novembre 2026, noms réels des plateformes, valeurs fictives. Reste ouvert : noms de bâtiments réels (USS …) et noms d'armes, aujourd'hui exclus ; forces alliées et adverses nommées.
14. **Esquive automatique :** activée par défaut. Le script fait un peu mieux sans (non significatif) : garder ce défaut, ou laisser le joueur la découvrir.
15. **Exercice rapide :** les réglages de l'adversaire pèsent peu. Les renforcer, ou les garder discrets.
13. **Moral :** tranché le 7 novembre 2026, il entre dans le score (10 %). Reste ouvert : autres déclencheurs (tir sur un civil, crise perdue).
8. **Prix de la réaction et de la zone d'exclusion :** les garder légers (coordination, tension) ou y ajouter un coût diplomatique quand ils visent des civils.
16. **Conseil sur demande (version 31) :** au niveau Simple, le conseil n'apparaît plus qu'à la demande, avec un réglage « Toujours affiché » dans le menu. Garder ce défaut, ou revenir au conseil permanent. Lié à la décision 6.
17. **Verdict « Victoire fragile » (version 31) :** mission réussie avec un CGC de 40 à 54. Garder ce libellé intermédiaire, ou revenir à cinq verdicts.
18. **Rythme (version 31) :** la correction de `S.lastC` donne environ une demi-crise de plus par partie. Garder l'écart de 60 s entre deux crises, ou le régler après observation de vrais joueurs.
20. **Symbologie V2 (version 32) :** les symboles de contacts de la charte (carré, cercle, losange tireté, double losange) sont le défaut. Ils sont originaux et non homologués : avant diffusion institutionnelle, les faire valider avec les choix APP-6 (décision liée au défaut 15).
21. **Rouge accessible :** résolu en version 33, tout texte rouge utilise `#FFABA7`.
22. **Écarts avec la charte (version 33) :** onglet Synthèse qui montre aussi les décisions, pas de pastille « Option prudente », tour de jeu au lieu de l'heure UTC, corps à 13 px (5.24). Les garder, ou s'aligner strictement sur le pack.
23. **Force spéciale et unités hors carte :** elles gardent l'APP-6 faute de pictogramme dans le pack. Faire dessiner les pictogrammes manquants, ou garder ce mélange.
19. **Corrections de combat (version 31) :** la chance de 0,72 s'applique maintenant au tir adverse, l'interception a sa propre chance et le seuil du raid suit le nombre de missiles (5.8). Ces corrections touchent aux règles : les valider, ou revenir à l'ancien calcul.
24. **Bilan « Décision ou chance ? » (5.25) :** le garder, le replier dans « Détails pour l'analyse » au niveau Simple, ou l'écarter. Le fusionner dans `main` met à jour le jeu public. **Tranché le 12 novembre 2026 :** gardé tel quel.
25. **Qualité de décision dans le score :** aujourd'hui l'axe D note l'issue réelle. Le remplacer en partie par la valeur du choix à preuves données (5.25) récompenserait le jugement et non la chance, mais change la formule 5.9 et tous les résultats de référence.
26. **Ne pas répondre :** le calcul de 5.25 le traite comme un choix. Quand l'estimation penche pour une fausse alerte, il peut être la meilleure réponse, alors que l'axe d'engagement du score le pénalise. Garder cet écart, ou l'expliquer au bilan.

27. **Lecture de « sous-menus » (version 34) :** la force spéciale s'engage depuis sa fiche. Confirmer, ou demander qu'elle soit embarquée sur un navire comme l'hélicoptère. **Tranché le 12 novembre 2026 :** la force spéciale s'engage depuis sa fiche.
28. **Unités terrestres (version 34) :** FAST et MLR sont des noms d'unités réelles, avec des valeurs fictives. Les garder, ou revenir à des libellés génériques. La batterie est seulement défensive : confirmer. **Tranché le 12 novembre 2026 :** noms FAST et MLR gardés, batterie défensive.
29. **Identification à vue gratuite (version 34) :** elle donne une preuve sans jeton. Garder ce prix en déplacement, ou lui donner un coût. **Tranché le 12 novembre 2026 :** l'identification à vue reste sans jeton.
30. **Référence au-dessus de la cible (version 34) :** voir section 8. Durcir (preuve à vue payante, moins d'unités terrestres), ou accepter jusqu'aux essais avec de vrais joueurs. **Tranché le 12 novembre 2026 :** pas de durcissement avant des essais avec de vrais joueurs.
31. **Hélicoptère au niveau Simple :** absent aujourd'hui. L'y ajouter, ou le garder au niveau Complet. **Tranché le 12 novembre 2026 :** l'hélicoptère reste au niveau Complet.

32. **Cyberattaque qui peut échouer (version 35) :** l'aveuglement réussissait toujours ; il échoue maintenant une fois sur quatre et peut être repéré. Valider ce changement de règle, ou garder l'ancien effet certain.
33. **Chances de repérage (version 35) :** 30 % au moins, puis crise publique dans 55 % des cas. Garder ces valeurs et leur affichage au joueur, ou les cacher.
34. **Navire fantôme (version 35) :** compté comme cible légitime d'un brouillage ou d'une cyberattaque, avec le navire armé et le saboteur. Confirmer.
35. **Ordres par domaine (version 35) :** gratuits, sans charge de coordination. Les garder ainsi, ou leur donner un coût au niveau Complet.
36. **Brouillage (version 35) :** réservé au niveau Complet, comme le ralentissement. L'ouvrir au niveau Simple, ou non.
37. **Mode Réaliste (5.18) :** la cyberattaque peut viser un contact mal identifié et compte alors comme une attaque à tort. Cohérent avec la règle « cibles militaires seulement », à confirmer.

### Défauts connus du jeu

1. Contester les hypothèses change peu le score : 626 contre 640. À revoir après de vrais tests de joueurs.
2. L'horloge idéale n'apporte presque rien selon les scripts : 635.
3. Tirer changeait à peine le score moyen : 620 contre 621. Version 31, après correction des tirs adverses : référence 728 et 73 %, sans aucun tir 713 et 67 %, tir sans vérifier 438 et 21 %. L'écart reste faible et n'est mesuré que par scripts.
4. Dans Le second choc, jouer sans avion peut rapporter davantage.
5. Port sous tension punit trop peu les réponses sans preuve.
6. Engagement en mer de Norvège reste très dur : 5 réussites sur 10 pour l'omniscient, 2 sur 10 pour le script.
7. Après la dernière baisse de prix, la valeur de l'équipe cyber, du drone armé et de la cellule d'analyse n'a pas été remesurée.
8. La carte reste chargée autour des Féroé et de Bergen, même si les couches permettent de l'alléger.
9. Arraisonner tout suspect a fait mieux que la référence sur un tirage précédent (63 % contre 48 %), puis autant sur le tirage suivant (52 %). L'échantillon est petit : à confirmer.
10. Répondre ou non à la diplomatie change peu le score moyen : 657 contre 645, sur un petit échantillon. Les retraits sont rares, sauf pour le tir sans vérifier (10 %).
11. Répondre sans preuve (61 %) reste au niveau de la référence (59 %) sur le dernier tirage : à vérifier scénario par scénario.
12. Suivre seulement le conseil réussit encore beaucoup de missions (`advbot.js 1`, 74 scénarios × 1 partie : conseil seul 702 et 66 % au niveau Simple, 683 et 78 % au niveau Complet ; référence 730 et 70 %, puis 720 et 73 %). Depuis la version 31, il n'apparaît plus qu'à la demande au niveau Simple, mais rien ne mesure si les joueurs réfléchissent davantage.

13. Déminage, évacuation, fonds marins et réponse à la posture sont équilibrés par scripts sur très peu de parties. Leur intérêt reste à vérifier avec des joueurs.

14. La navigation repose encore sur un masque de 4 unités de côté, plus grossier que la côte affichée. Selon le scénario, 0,3 à 4 % des positions de navires tombent sur la côte fine : elles sont décalées à l'affichage, mais la route reste la même.

15. Le losange bleu, désormais en option, contredit la forme du cadre ami de l'APP-6. Les symboles OTAN sont actifs par défaut ; les choix d'identité et d'échelon restent à faire valider par une personne qui dispose du texte de l'APP-6(E).
16. Le stress du compte à rebours n'est pas mesurable par les scripts. Il reste à observer avec de vrais joueurs.

17. Double prise (`d3`) restait très dure : la tâche « Repousser le raid » échouait 6 fois sur 6 avec le seuil fixe de 4 coups. Version 31 : `d3` donne 75 % à l'omniscient comme à la référence sur 4 parties. `m5`, `a5`, `l10` et `i18` restent irréguliers, et la référence y dépasse parfois l'omniscient sur 2 parties. Échantillon trop petit pour conclure.

18. Avec la zone de 150, les bouées détectent moins souvent le sous-marin : 38 % contre 71 % sur le banc isolé. À surveiller avec de vrais joueurs.
19. La référence monte à 68 %, en haut de la cible. L'omniscient reste à 0 % sur `e3` en 4 parties, à cause de la recherche du sous-marin.

20. Le niveau Simple retire la diplomatie sans pénalité. Son intérêt pédagogique et l'écart avec le niveau Complet restent à vérifier avec de vrais joueurs.

21. Une route navale frôle parfois une case de côte du masque, en déplacement ordinaire comme en patrouille. L'utilité de la patrouille pour un joueur réel n'a pas été observée.
22. La couverture par le rayon de détection rend les objectifs de présence plus faciles. L'effet sur l'équilibre reste à mesurer sur plus de parties.
23. Résolu le 8 novembre 2026 : `gen_db.py` est restauré depuis le dépôt GitHub.
24. Réagir à tout contact inconnu a fait mieux que la référence sur 16 parties (666 contre 611), mais presque pareil sur 74 scénarios × 1 (717 et 77 % contre 708 et 74 %). Trois réactions sur quatre visent alors un civil. Écart non significatif : à observer avec des joueurs.
25. La zone d'exclusion n'a qu'un prix de tension (+0,15). Elle marque surtout des civils (environ 7 sur 10 dans les essais), ce qui est voulu, mais ne coûte rien en relations.
26. Le groupe tactique améliore le script (+38 points, +10 points de réussite sur 48 parties). Il pourrait devenir le réglage évident : à observer avec des joueurs avant de lui donner un coût.
27. Résolu le 10 novembre 2026 (version 32) : appui long de 550 ms sur la carte = clic droit. Les mêmes ordres restent aussi dans la fiche d'unité.
28. Au fort zoom, la navigation reste calculée sur une grille d'environ 12 km : un navire peut sembler couper un îlot ou une pointe des côtes détaillées.
29. Corrigé le 7 novembre (version 29) : l'omniscient échouait sur `ib` à cause d'une erreur du script, pas du jeu. La référence reste à 71 %, au-dessus de la cible.
30. Résolu le 10 novembre 2026 (version 32) : Échap n'ouvre plus le menu (FL-014). M et le bouton ☰ restent.
31. Un objectif de présence peut être rempli sans aucun ordre : dans « Port sous tension », l'unité part déjà dans la zone. La première phase ne demande alors aucune décision. Dans `l11`, ne donner aucun ordre réussit une partie sur deux (4 parties, versions 30 et 31) : présence, défense automatique et consignes suffisent.
32. Face à une cyberattaque, « Chasser l'intrus » réussit quelle que soit la vérité (table `EFF`). Tant que l'équipe cyber a des emplois, ce choix n'est pas un dilemme.
33. Une mission peut être réussie en perdant la plupart des crises, si les tâches et les contrôles tiennent. Le verdict « Victoire fragile » le signale, mais le score reste élevé.
34. Même avec la version 31, le script passe 71 % du temps sans crise ouverte. Un joueur réel décide plus lentement, mais les temps calmes restent longs sans l'avance rapide.
35. Audit bêta du 10 novembre (sur la version 30) : constats non traités en version 32, à mesurer ou décider : conseil trop fort (FL-003), preuves trop peu décisives dans certaines missions (FL-004), scénarios trop durs (FL-005, en partie corrigé en v31), mécaniques à faible effet (FL-006), navigation plus grossière que la côte affichée (FL-007, défaut 14), pédagogie du score (FL-015), parcours progressif après le tutoriel (FL-016), poids de la page ~8 Mo (FL-017), sonar (FL-018), tests E2E sans injection (FL-019), mesure de l'apprentissage (FL-020), validation APP-6 (FL-021).
36. Le retour automatique à ×1 (FL-001) rallonge les parties jouées surtout en ×4 : effet sur le confort à observer avec de vrais joueurs.
37. Version 33 : sur téléphone, une seule vue sous la carte à la fois. Le journal et les contacts restent accessibles par les onglets du panneau, pas par la barre basse. À observer : un joueur trouve-t-il le dossier, et revient-il aux crises.
38. Version 33 : les pictogrammes mesurent environ 11 px dans un cadre de 22 px. Leur lecture à distance, sur projecteur, n'est pas vérifiée.
39. Bilan « Décision ou chance ? » : une stratégie qui répond toujours sans preuve obtient 100 % de bons choix, car le classement juge le choix à preuves données. Seul le signal « Décidé sans vérifier » la distingue (98 % contre 1 % pour la référence). La valeur d'une preuve supplémentaire n'est pas mesurée.
40. Bilan « Décision ou chance ? » : les crises à navires et de combat ne sont pas évaluées (5.25), alors qu'elles portent le tir, où la confusion entre chance et jugement est la plus forte.

41. Version 34 : la batterie côtière défend tout objet visé à moins de 120, y compris un navire au large proche de la côte. Simplification de jeu.
42. Version 34 : l'hélicoptère n'a pas de limite de sorties, seulement 45 s de remise en condition. À régler si les joueurs en abusent.
43. Version 34 : les scripts de test n'emploient pas les formations ni l'hélicoptère de reconnaissance. Leur valeur n'est pas mesurée.

44. Version 35 : le brouilleur porte moins loin (150) que le tir d'un navire armé (175). Il faut s'approcher sous le feu ou envoyer les chasseurs. À observer.
45. Version 35 : la crise publique s'ouvre 20 à 40 s après le repérage ; une cyberattaque lancée dans la dernière minute n'a donc presque jamais de suite publique.
46. Version 35 : « assumer » reste la meilleure réponse sans preuve (issue attendue 0,67 contre 0,49 et 0,33). Le dilemme ne naît que si le joueur vérifie.
47. Version 35 : les ordres par domaine et les deux vues ne sont employés par aucun script.

### Absent de cette version

Niveaux de difficulté réglables, missions secondaires au choix, multijoueur, mode animateur, éditeur de formation, groupes aériens.

## 14. Priorités recommandées

1. Faire jouer 5 à 8 personnes sur 3 scénarios, avec observation et entretien court : c'est le manque le plus important.
2. Mesurer le temps réel de décision et les erreurs de compréhension.
3. Rendre le tir plus décisif et corriger les défauts 1 à 7 à partir de ces observations.
4. Observer si le tutoriel suffit et si le conseil remplace la réflexion, puis ajouter les niveaux de difficulté.
5. Prévoir ensuite un mode animateur avec données agrégées et conforme au RGPD et à la nLPD.
6. Migrer vers la cible technique seulement quand la boucle de jeu est validée.
