# Portfolio Design- & Farbrichtlinien (Tobias Schreiber)

## 1. Strenge Monochromie & Neutralpalette (Zero Blue Tint)
- **Keine Blautöne in UI-Elementen:** Weder für Hintergründe, Rahmen, Schatten, Hover-States, Overlays noch für Links dürfen kühle oder bläuliche Nuancen verwendet werden.
- **Keine blaulastigen Grautöne:** Keine Werte verwenden, bei denen der Blau-Kanal höher ist als Rot oder Grün (z. B. verboten: Apple-Systemgrau `#1c1c1e`, `rgba(28, 28, 30)`, `rgba(34, 34, 38)`).
- **Zulässige Farbtöne:**
  - Reines Tiefschwarz: `#020202`, `#060606`
  - Reines neutrales Anthrazit/Dunkelgrau: `rgba(18, 18, 18, ...)`, `rgba(20, 20, 20, ...)`, `rgba(24, 24, 24, ...)`, `rgba(28, 28, 28, ...)` (immer $R = G = B$)
  - Akzente: Rein neutrales Silber (`#d8d8d8`, `rgba(255, 255, 255, ...)`) oder warme Elfenbein-/Bernstein-Töne (`--accent-warm`, warmer Glow)

## 2. Frosted Glass & Filter
- **Kein `saturate()` auf `backdrop-filter`:** Bei Frosted-Glass-Komponenten ausschließlich `backdrop-filter: blur(...)` ohne `saturate(...)` verwenden, um Farbsättigungseffekte von Subpixeln oder Hintergründen zu vermeiden.

## 3. Randlose Ästhetik (Borderless Design)
- Buttons, Cards, Handles und Viewport-Elemente haben standardmäßig **keine Umrandungen** (`border: none; outline: none; box-shadow: none;`), sofern nicht explizit gewünscht.
- Keine harten Linien oder Trennstriche zwischen Elementen.

## 4. Ruhige, stabile Übergänge (No Bounce)
- Keine übertriebenen Spring- oder Bouncing-Skalierungen (`scale()`) auf UI-Karten, PDF-Bühnen oder Bildwechseln. Sanfte, ruhige Deckkraft-Überblendungen bevorzugen.

## 5. KI-Workflow & Sicherheit
- **Niemals lokale Dateien mit Git überschreiben:** Führe niemals eigenmächtig Befehle wie `git checkout <datei>`, `git reset` oder `git restore` aus. Ungespeicherte oder lokale Änderungen, die noch nicht committed wurden, gehen dadurch unwiderruflich verloren!
- **Keine Git-Uploads ohne ausdrücklichen Befehl:** Führe niemals eigenständig `git commit` oder `git push` aus, es sei denn, der Nutzer fordert dich in der jeweiligen Nachricht ausdrücklich dazu auf (z. B. *"lad das auf Git"*, *"pushe die Änderungen"*). Alle Änderungen verbleiben standardmäßig rein lokal.
