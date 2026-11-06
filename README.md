# FOGLINE (SEUIL)

A real-time strategy serious game about deciding under uncertainty. You command a small force through fictional crises on real maps: verify, decide before the countdown ends, keep your options open and control escalation.

**Status: playable prototype, looking for beta testers.** The game has mostly been tested by scripts so far, so human feedback on gameplay is what it needs most.

*[Version française plus bas.](#version-française)*

## Play

Open `index.html` in a recent browser, or enable GitHub Pages on this repository (Settings > Pages > Deploy from a branch > `main` / root). The whole game is in that one file. It needs no build and no server. Only the fonts load from the network.

## At a glance

- Six regions and 74 missions, in English and French
- Missions of about 8 to 11 minutes at normal speed
- Easy (90 s per decision) or Hard (30 s), Simple or Full command level
- False alarms, changing plan assumptions and a debrief that reveals the truth
- No nuclear weapons and no strikes on cities

## Feedback wanted

Please open an issue about anything that felt unclear, unfair or dull. The most useful questions: what did you do in your first five minutes? Did the pacing hold up? Were the 30-second decisions tense or just unfair? Did the map stay readable?

## Important limits

- All events are fictional. Real geography does not imply any real situation or attribution.
- Weapons and effects use fictional game values. The game teaches no offensive technique.
- The score and the gauges are game models, not scientific measurements. They do not measure a person's or a unit's ability.
- This is a training exercise, not a real decision aid.

## Build from source

Requires Python 3. Tests also need Node.js and Playwright with Chromium.

```bash
cd proto
python3 gen_db.py   # only if gen_db.py changed
python3 build.py    # writes ../index.html
```

Edit `proto/src.html` and `proto/gen_db.py`, never `index.html`. `CLAUDE.md` holds the rules, code map and test procedure (in French).

## Credits

Design: Naully Nicolas, drawing on his article on cognitive warfare in *Revue diplomatique* no. 28 (IEGA). Inspired by DEFCON and Jane's Fleet Command, with no affiliation. Code written largely with Claude (Anthropic). Third-party components are listed in `NOTICE.md`.

© 2026 Naully Nicolas. All rights reserved for now, except third-party components.

---

## Version française

SEUIL est un serious game de stratégie en temps réel pour apprendre à décider sous incertitude. Vous commandez une petite force dans des crises fictives sur des cartes réelles : vérifier, décider avant la fin du compte à rebours, garder des options et maîtriser l'escalade.

**État : prototype jouable, à la recherche de bêta-testeurs.** Le jeu a surtout été testé par des scripts. Les retours humains sur le gameplay sont donc le plus utile.

Pour jouer, ouvrez `index.html` dans un navigateur récent, ou activez GitHub Pages sur ce dépôt. Pour tout retour, ouvrez une issue.

Tous les événements sont fictifs. Le score et les jauges sont des modèles de jeu, pas des mesures scientifiques. Ce jeu entraîne un raisonnement et n'est pas une aide à la décision réelle.
