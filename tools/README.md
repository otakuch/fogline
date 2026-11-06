# Generators

Scripts used once to produce the map data in `proto/th/` and `maps/`. They are not needed to build or play the game.

They expect a folder holding `deps/node_modules` with `d3-geo`, `topojson-client` and `world-atlas`. Pass that folder as the first argument. `gen-natl.mjs` is the original script for the North Atlantic map and still needs its paths adjusted.
