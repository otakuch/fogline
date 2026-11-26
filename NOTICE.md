# Third-party notices

| Component | Use | Licence | Text |
|---|---|---|---|
| [MapLibre GL JS](https://maplibre.org/) 4.7.1 | Vector map | BSD-3-Clause | `proto/vendor/maplibre.LICENSE` |
| [three.js](https://threejs.org/) r159 | Home globe, relief, 3D view. `proto/build.py` removes the library's startup deprecation warning when it assembles the page; `proto/vendor/three.min.js` is unmodified | MIT | `proto/vendor/three.LICENSE` |
| [milsymbol](https://github.com/spatialillusions/milsymbol) 3.0.5 | APP-6 symbols | MIT | `proto/milsymbol.LICENSE` |
| [Natural Earth](https://www.naturalearthdata.com/) via [world-atlas](https://github.com/topojson/world-atlas) | Coastlines and borders | Public domain, ISC for world-atlas | |
| OpenStreetMap contributors, through [geo-maps](https://github.com/simonepri/geo-maps) earth-lands-100m 0.6.0 | Detailed coastlines (`proto/th/hicoast.json`) | ODbL 1.0, © OpenStreetMap contributors | |
| IBM Plex and Saira Semi Condensed, through Google Fonts | Fonts, loaded at runtime | SIL OFL 1.1 | |

Mission illustrations (`assets/missions/`): eight fictional atmosphere scenes supplied by Naully Nicolas for the project (pack FOGLINE_MISSIONS_VISUELS_V1). They are not intelligence or evidence. Their licence is not stated here.

No third-party name or logo implies any endorsement. APP-6 symbols have not been validated against the official text of the standard.

## Relief

Altitudes et profondeurs : ETOPO à 10 minutes d'arc, NOAA National Centers for Environmental Information, domaine public. Fichier `ETOPO_10min_Ice.vtp` du dépôt `pyvista/vtk-data`. Grilles par théâtre dans `proto/th/relief_*.png`, générées par `tools/relief/relief.py`.

## Version 50 : sources des données acoustiques

- Ultra Maritime, fiche AN/SSQ-62G DICASS (https://umaritime.com/wp-content/uploads/2026/03/AN-SSQ-62G.pdf), consultée le 24 novembre 2026 : profondeurs de réglage et budget d'émission. La fiche ne publie aucun rayon de détection : les portées du jeu sont des valeurs de simulation.
- NOAA, « What is a thermocline? » et « How far does sound travel in the ocean? » (oceanservice.noaa.gov) : la couche varie selon le lieu et la saison, et peut être absente. Les couches du jeu sont des valeurs de jeu par théâtre.
- Pictogramme « Convoi humanitaire » : `assets/symbols/humanitarian-convoy.svg`, fourni par Naully Nicolas avec le pack de l'extension.

## Illustrations des crises (version 51)

`assets/crises/` : 14 illustrations d'ambiance fournies par Naully Nicolas dans le pack « FOGLINE ASW, mobilité, crises V2.1 » (images générées, fictives, d'après le manifeste du pack). Droits confirmés par Naully Nicolas le 24 novembre 2026 : il déclare les détenir. Elles n'affirment rien sur l'état du jeu.

## Sons (version 56)

`assets/audio/` : pack « FOGLINE Audio complet V1 » fourni par Naully Nicolas le 26 novembre 2026. 170 fichiers WAV conservés à l'identique (empreintes dans `catalogue-audio-complet.json`) : 4 fonds en boucle, 16 effets et 50 signatures d'interface, donnés par le pack comme une synthèse procédurale originale (recettes dans `assets/audio/production/`), et 100 répliques en anglais produites par synthèse vocale, sans prise de voix humaine (trois modèles de voix génériques, d'après le pack). Aucun échantillon tiers n'est déclaré ; la vidéo citée comme référence par le pack n'a fourni aucun son. Les démonstrations MP3 du pack ne sont pas dans le dépôt.

`assets/audio/web/` : dérivés MP3 de ces fichiers, produits par `tools/audio/optimise.py` avec ffmpeg et servis par le jeu. `tools/audio/unit-response-resolver.mjs` et son test viennent du pack ; `proto/audio.js` en porte la logique dans la page.

Les droits de ce pack n'ont pas été vérifiés ici : ils sont à confirmer par Naully Nicolas avant toute diffusion commerciale. Les sons d'origine du jeu (`proto/son-pack.json`, `docs/third-party/SOUND-CREDITS.md`) restent en repli.
