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
    └── th/hicoast.json     côtes détaillées OpenStreetMap par théâtre (varints base64), générées par tools/hires.js
    └── dipm.js             mesures de diplomatie par stratégie
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
- Vitesses x1, x2 et x4. En commandement complet, la pause dispose d'une réserve de 90 secondes réelles, sauf en horloge idéale. En commandement guidé, elle est illimitée.
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
- **Tir hostile :** portée 175, chance de 0,72 avant pénalités. Tirer révèle la position du raider.
- **Interception :** automatique, sans posture, par une unité au radar actif ayant une réserve de défense à proximité.
- **Dégâts :** 50 sur une unité, 25 pour un drone d'essaim. Une unité à 0 est perdue et non remplacée. 11 sur un site, un câble ou un convoi touché par un missile.
- **Pénalités d'arme :** système de combat compromis 0,3, temps et position douteux 0,2.
- **Escalade :** tirer le premier ajoute 0,6 de tension. Toucher un civil ajoute 1,5 et coûte 15, 15 et 8 points de piliers.
- **Cyber offensif :** la contre-attaque exige Contraindre et l'équipe cyber. Contre un acteur étatique, elle retire une opération à Rouge. Contre un faux positif, elle coûte très cher. L'aveuglement prive un adversaire de tirs pendant 25 s.
- **Directeur :** après un premier tir ou à un seuil de 2 ou moins, de nouveaux raids et salves peuvent survenir.

### 5.8 bis Symbologie

**Par défaut depuis le 7 novembre 2026 (demande de Naully) :** symboles OTAN classiques APP-6 pour tout, navires compris (`SYM.ships = 'nato'`, `natoShips`, clé `seuil.shipsym`). Navires amis : FF frégate (`120204`), PG patrouilleur (`120502`), AR réparation (`130111`), convoi ami marchand (`140101`). Contacts : identité selon ce que le joueur sait (`shipSidc`), en attente, inconnu, suspect, neutre ou hostile. Échelons sur les unités hors carte (`ech`) : force spéciale Ø équipe (`11`), équipe cyber, cellule d'analyse et de communication •• section (`13`). La légende garde un bouton pour revenir aux losanges du jeu sur les navires. **Ancienne règle, toujours disponible en option :** décision de Naully du 5 novembre 2026. Tous les navires sont des losanges propres au jeu (`drawDia`, `shipTone`) et non des symboles APP-6. Bleu : votre camp (frégate, patrouilleur, réparation, convoi). Gris : navire déclaré. Gris creux : contact sans transpondeur non identifié. Rouge : cible, jugée suspecte ou hostile. La couleur reflète ce que le joueur sait et ne révèle la vérité qu'au bilan. Attention : dans l'APP-6, le losange désigne l'identité hostile. Le reste ci-dessous concerne les avions, les sous-marins, les sites et les unités non navales.

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
- **Plafonds :** 250 si le seuil 1 est franchi, 550 si la mission échoue, 650 si elle réussit avec un CGC final sous 40 ou un moral final sous 35.
- **Verdicts :** Victoire cohérente, Syndrome de Syracuse, Défaite lucide, Effondrement, Seuil 1 franchi.
- **Étoiles :** 4 pour tous les objectifs, au moins 2 missions secondaires CGC à 55 ou plus et moral final à 60 ou plus. 3 pour une mission réussie. 2 pour au moins la moitié des objectifs. 1 pour au moins un objectif. En commandement guidé, le maximum est 3.

### 5.10 Hypothèses et changement de situation

`drawAssumptions` utilise un générateur séparé, pour que le même tirage donne les mêmes changements. Le nombre d'hypothèses qui cèdent vaut la difficulté du scénario, de 1 à 3. Si au moins deux cèdent, la dernière reste cachée. Une partie sur quatre ajoute une bonne nouvelle.

Hypothèses disponibles : `info.sources`, `info.late`, `info.share`, `comm.delay`, `comm.sat`, `comm.pnt`, `comm.c2`, `ally.slow`, `ally.none`, `sup.naval`, `sup.air`, `sup.fuel`, `sup.ana`, `sup.weap`, `adv.early`, `adv.double`, `adv.cycle`, `adv.dep`, `adv.weap`, `mis.zone`, `mis.extra`, et les bonus `pos.ally`, `pos.token`, `pos.calm`.

**Horloge idéale :** `D_(x)` réduit les délais à 0,5 s au maximum. Elle sert à comparer et ne représente jamais la réalité.

### 5.11 Prise en main

- **Estimation automatique :** toute décision qui repose sur un dossier classe l'hypothèse en tête si le joueur n'a rien choisi. En commandement complet, il peut encore classer à la main avant.
- **Commandement guidé, réglage par défaut :** panneau de conseil, pause automatique à chaque crise et à chaque nouvelle phase, reprise du temps dès qu'un ordre est donné, pause illimitée, coordination automatique (`S.debt` reste à 0), confiance publique sur une seule jauge. Silence radar et classement manuel sont masqués. 3 étoiles au plus.
- **Commandement complet :** pause de 90 s, silence radar, coordination et classement manuel. Seul ce niveau donne la 4e étoile.
- **Conseil (`advise`, `applyAdvice`) :** il ne doit jamais lire `truth`. Il part des preuves, des hypothèses et de ce qui est visible, et propose une action à la fois. Le bilan indique combien de décisions conseillées reposaient sur une hypothèse fausse.
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
- **Barre haute :** indicateurs avec état coloré et infobulle.
- **Panneau gauche :** onglets Situations, Forces, Coalition et Suivi (`leftTab`). Les nouvelles crises rouvrent Situations en commandement guidé.
- **Dossier à droite :** il n'apparaît qu'avec une sélection. Il suit l'ordre estimer, vérifier, décider.
- **Réponses (`actsHtml`, `coaMeta`) :** chaque carte indique le coût, la faisabilité et le risque d'escalade. En guidé, elle ajoute les hypothèses pour lesquelles la réponse convient et le conseil. Ces indications lisent les preuves et la table `EFF`, jamais la vérité.
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

- **Symboles :** la forme donne le milieu et la couleur le camp (`mark`, `markURL`). Losange : navire. Triangle : aéronef. Triangle pointe en bas : sous-marin. Carré : site. Rond : force spéciale. Décision de Naully du 5 novembre 2026 : les symboles APP-6 sont actifs par défaut (`SYM.app6`, `seuil.app6`), sauf pour les navires qui gardent les losanges. Les marques simples restent une option de la légende.
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
| Interface | `screenHome`, `screenHow`, `renderDock`, `coachTick`, `renderLay`, `actsHtml`, `coaMeta`, `screenMode`, `screenBrief`, `screenDeck`, `showFrago`, `renderLeft`, `renderRight`, `renderHud`, `draw` |
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

### Défauts connus du jeu

1. Contester les hypothèses change peu le score : 626 contre 640. À revoir après de vrais tests de joueurs.
2. L'horloge idéale n'apporte presque rien selon les scripts : 635.
3. Tirer ne change presque pas le score moyen : 620 contre 621. Le combat doit devenir plus décisif, sans récompenser la gâchette.
4. Dans Le second choc, jouer sans avion peut rapporter davantage.
5. Port sous tension punit trop peu les réponses sans preuve.
6. Engagement en mer de Norvège reste très dur : 5 réussites sur 10 pour l'omniscient, 2 sur 10 pour le script.
7. Après la dernière baisse de prix, la valeur de l'équipe cyber, du drone armé et de la cellule d'analyse n'a pas été remesurée.
8. La carte reste chargée autour des Féroé et de Bergen, même si les couches permettent de l'alléger.
9. Arraisonner tout suspect a fait mieux que la référence sur un tirage précédent (63 % contre 48 %), puis autant sur le tirage suivant (52 %). L'échantillon est petit : à confirmer.
10. Répondre ou non à la diplomatie change peu le score moyen : 657 contre 645, sur un petit échantillon. Les retraits sont rares, sauf pour le tir sans vérifier (10 %).
11. Répondre sans preuve (61 %) reste au niveau de la référence (59 %) sur le dernier tirage : à vérifier scénario par scénario.
12. Suivre seulement le conseil réussit 61 % des missions au niveau Simple et 78 % au niveau Complet (version 30, 74 scénarios × 1), presque autant que la référence : le conseil peut remplacer la réflexion.

13. Déminage, évacuation, fonds marins et réponse à la posture sont équilibrés par scripts sur très peu de parties. Leur intérêt reste à vérifier avec des joueurs.

14. La navigation repose encore sur un masque de 4 unités de côté, plus grossier que la côte affichée. Selon le scénario, 0,3 à 4 % des positions de navires tombent sur la côte fine : elles sont décalées à l'affichage, mais la route reste la même.

15. Le losange bleu, désormais en option, contredit la forme du cadre ami de l'APP-6. Les symboles OTAN sont actifs par défaut ; les choix d'identité et d'échelon restent à faire valider par une personne qui dispose du texte de l'APP-6(E).
16. Le stress du compte à rebours n'est pas mesurable par les scripts. Il reste à observer avec de vrais joueurs.

17. Double prise (`d3`) reste très dure dans les deux modes : 0 % pour l'omniscient sur 2 à 4 parties. Détroit disputé (`a5`) et Contact au centre du bassin (`e3`) restent irréguliers. Échantillon trop petit pour conclure.

18. Avec la zone de 150, les bouées détectent moins souvent le sous-marin : 38 % contre 71 % sur le banc isolé. À surveiller avec de vrais joueurs.
19. La référence monte à 68 %, en haut de la cible. L'omniscient reste à 0 % sur `e3` en 4 parties, à cause de la recherche du sous-marin.

20. Le niveau Simple retire la diplomatie sans pénalité. Son intérêt pédagogique et l'écart avec le niveau Complet restent à vérifier avec de vrais joueurs.

21. Une route navale frôle parfois une case de côte du masque, en déplacement ordinaire comme en patrouille. L'utilité de la patrouille pour un joueur réel n'a pas été observée.
22. La couverture par le rayon de détection rend les objectifs de présence plus faciles. L'effet sur l'équilibre reste à mesurer sur plus de parties.
23. `gen_db.py` à jour est perdu depuis la réinitialisation du 7 novembre : à reconstruire à partir de `scenarios.json` avant d'ajouter des scénarios.
24. Réagir à tout contact inconnu a fait mieux que la référence sur 16 parties (666 contre 611), mais presque pareil sur 74 scénarios × 1 (717 et 77 % contre 708 et 74 %). Trois réactions sur quatre visent alors un civil. Écart non significatif : à observer avec des joueurs.
25. La zone d'exclusion n'a qu'un prix de tension (+0,15). Elle marque surtout des civils (environ 7 sur 10 dans les essais), ce qui est voulu, mais ne coûte rien en relations.
26. Le groupe tactique améliore le script (+38 points, +10 points de réussite sur 48 parties). Il pourrait devenir le réglage évident : à observer avec des joueurs avant de lui donner un coût.
27. Le menu contextuel n'existe pas au toucher (pas d'appui long). Sur téléphone, les mêmes ordres restent dans la fiche d'unité.
28. Au fort zoom, la navigation reste calculée sur une grille d'environ 12 km : un navire peut sembler couper un îlot ou une pointe des côtes détaillées.
29. Corrigé le 7 novembre (version 29) : l'omniscient échouait sur `ib` à cause d'une erreur du script, pas du jeu. La référence reste à 71 %, au-dessus de la cible.
30. Échap ouvre le menu quand rien n'est sélectionné : un joueur qui appuie plusieurs fois pour annuler peut l'ouvrir sans le vouloir.

### Absent de cette version

Niveaux de difficulté réglables, missions secondaires au choix, multijoueur, mode animateur, éditeur de formation, groupes aériens.

## 14. Priorités recommandées

1. Faire jouer 5 à 8 personnes sur 3 scénarios, avec observation et entretien court : c'est le manque le plus important.
2. Mesurer le temps réel de décision et les erreurs de compréhension.
3. Rendre le tir plus décisif et corriger les défauts 1 à 7 à partir de ces observations.
4. Observer si le tutoriel suffit et si le conseil remplace la réflexion, puis ajouter les niveaux de difficulté.
5. Prévoir ensuite un mode animateur avec données agrégées et conforme au RGPD et à la nLPD.
6. Migrer vers la cible technique seulement quand la boucle de jeu est validée.
