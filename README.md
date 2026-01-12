# Pokédex – Angular Version (Portfolio)

Dieses Projekt ist die **Angular-Umsetzung** deiner ursprünglichen Vanilla-JS Pokédex-App.

## Features
- PokeAPI-Anbindung (Pokémon + Species)
- „Mehr laden“ (Batch-Laden, mit begrenzter Parallelität)
- Suche (ab 3 Buchstaben, max. 10 Treffer)
- Sortierung (ID / Name)
- Modal mit Tabs (Overview / Stats / Evolution)
- Evolution klickbar: öffnet das jeweilige Pokémon im Modal
- Caching im Service (weniger APICalls)

## Start (lokal)
```bash
npm install
npm start
```

## Build
```bash
npm run build
```

## GitHub Pages
Für GitHub Pages brauchst du i.d.R. `--base-href=./`:
```bash
npm run build:gh
```
Danach kannst du den Inhalt aus `dist/pokedex-angular/` deployen (z. B. in einen `gh-pages` Branch).

## Projektstruktur (wichtig fürs Portfolio)
- `src/app/services/poke-api.service.ts` → API + Caching + Evolution
- `src/app/pages/pokedex-page.component.ts` → UI-State + Filter/Sort + Modal-Navigation
- `src/app/components/*` → saubere UI-Komponenten (Header, List, Card, Modal, Footer)

