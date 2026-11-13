# FOGLINE UI — Annexe à conserver avec le CLAUDE.md existant

**Important : NE PAS remplacer le `CLAUDE.md` existant du dépôt.** Il contient des règles de simulation et tests prioritaires. Cette annexe concerne uniquement l'habillage et la lisibilité.

- Titre officiel FOGLINE dans toutes les langues, y compris les captures et les nouvelles ressources.
- Charte CSS/JSON du kit V4 = source des tokens. Ne pas créer de couleurs ad hoc sans justification.
- Saira Semi Condensed + IBM Plex Mono, exactement deux familles téléchargées depuis Google Fonts.
- Bandeau de fiction fixe à z-index supérieur à tous les panneaux et modales, 32 px min ; ne jamais le masquer à l'accueil, au menu ou sur téléphone.
- Touch target 44 px min ; survol et focus distincts ; boutons désactivés avec raison affichée.
- Contacts : identité connue seulement, formes et libellés systématiques ; ne pas baser leur couleur sur `truth`.
- Conserver milsymbol APP-6. Les SVG NTDS-inspirés sont originaux et facultatifs, jamais revendiqués conformes à une norme officielle.
- Actions : la UI lit `crisisActions` / `shipActions` / `dipActions`, elle ne décide pas seule du coût et ne modifie pas les règles.
- Déploiement : modifier `proto/src.html`, puis `python3 proto/build.py` ; tester à 390 px et 1440 px.
- L'exemple `DEMO_OUVRIR.html` est une maquette interactive : **aucune interaction n'agit sur le moteur**. Il est interdit de remplacer les routines de jeu par son script.
- Accessibilité : contraste AA pour toutes les combinaisons utilisées, aucun état par couleur seule, `prefers-reduced-motion`, clavier, support lecteur d'écran à vérifier.
