# Blackjack Coach PWA

An installable, offline-first blackjack training app with an original dark/chartreuse interface.

## Included

- 40 hard-hand, soft-hand and pair strategy rules
- 10-question sessions without repeated scenarios
- Prominent answer, explanation and rule reference after every response
- Hi-Lo card-value drills
- 20-card running-count speed drills
- Local rating, streak and session history
- Statistics dashboard
- Offline service worker and installable PWA manifest
- Haptic feedback setting and local-data reset

Strategy examples assume 6–8 decks, dealer stands on soft 17 (S17), double after split (DAS), and no surrender.

This is an educational simulator only. It does not provide real-money gambling.

## Run locally

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

## Publish to GitHub Pages

Upload the contents of this folder to a repository, enable Pages from the repository's root branch, and open the generated Pages URL. All paths are relative, so it works from a repository subpath.
