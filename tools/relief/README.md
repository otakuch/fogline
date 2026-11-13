# Relief des théâtres

`relief.py` produit `proto/th/relief_<théâtre>.png` : une grille de 400 × 250 altitudes par théâtre, dans le repère du jeu.
Chaque pixel code l'altitude en mètres + 11 000 sur 16 bits (rouge : poids fort, vert : poids faible).

Source : grille mondiale ETOPO à 10 minutes d'arc (NOAA NCEI, domaine public), fichier `ETOPO_10min_Ice.vtp`
du dépôt `pyvista/vtk-data` (`Data/EarthModels/`). La version exacte d'ETOPO de ce fichier n'a pas été vérifiée.

Pour refaire les grilles :

1. Télécharger `ETOPO_10min_Ice.vtp` et le convertir en tableau `etopo10.npy` de 1081 × 2161 (latitude de 90 à −90,
   longitude de −180 à 180) avec `vtp2npy.py`.
2. `python3 tools/relief/relief.py etopo10.npy`
3. `python3 proto/build.py`

Limite : une maille vaut environ 18 km. Fjords, petites îles et sommets isolés ne sont pas résolus.
