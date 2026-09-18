# Tobias Schreiber — Portfolio

Willkommen im Quellcode meines digitalen Portfolios! Ich bin **Tobias Johannes Schreiber**, Student der Medientechnik (B.Eng.), und dies ist der zentrale Showcase für meine Arbeiten aus den Bereichen **3D & CGI, Film, Fotografie, Kunst und UI/UX-Design (Uni-Projekte)**.

🌐 **Live-Ansicht:** [tobiasjschreiber.github.io/Portfolio](https://tobiasjschreiber.github.io/Portfolio)

## 🎨 Design-Philosophie
Das gesamte Interface folgt strikten Gestaltungsrichtlinien für maximale visuelle Ruhe:
- **Zero Blue Tint:** Eine kompromisslos neutrale und warme Monochrom-Farbpalette (echtes Schwarz, neutrales Anthrazit, warmes Silber/Bernstein).
- **Borderless Design:** Bewusster Verzicht auf harte Rahmen, Linien oder störende Drop-Shadows. UI-Elemente sind pillenförmig (fully rounded) und setzen auf weiche Ambient-Blur-Effekte (Frosted Glass) sowie sanfte Deckkraft-Überblendungen statt springender Animationen.
- **Cinematic Experience:** Edge-to-Edge Medien, fließende Scroll-Parallax-Effekte und ein reduziertes Layout stellen die eigentlichen Arbeiten absolut in den Mittelpunkt.

## 🛠️ Technische Umsetzung
Dieses Portfolio ist als performante Single-Page-Application (SPA) in purem HTML5, CSS3 und Vanilla JavaScript konzipiert – komplett ohne aufgeblähte Frameworks.

**Core Features & Custom Components:**
- **Custom PDF & Longboard Viewer:** Eine Eigenentwicklung für die Präsentation von Layouts (z. B. *MagicFlow* oder *Landschaftsstudie*). Beinhaltet Dual-Layer-Crossfades, Seamless-Scroll-Integration (verhindert Scroll-Traps) und UI-Paddles.
- **Cinema Lightbox:** Ein maßgeschneidertes, globales Overlay für Vollbild-Medien (Bilder, Videos, PDFs) mit GPU-beschleunigtem Backdrop-Blur (`backdrop-filter: blur(...)`).
- **Interaktive Parallax-Gallerien:** Horizontal scrollbare Media-Strips (wie im CGI-Bereich und beim Keramikring) mit haptischen Scrubber-Bars, die interaktiv via Drag-and-Drop, Touch oder Klick bedient werden können.
- **Smooth Scrolling:** Gekoppelt mit `Lenis` (60/120fps) für absolut flüssiges, Layout-Thrashing-freies Scrollen durch die Sections.

## 📂 Projektstruktur
- `/assets/`: Strukturierte Medienablage für hochgradig optimierte Bilder (`.webp`, responsive Größen wie `sm`, `md`, `lg`, `full`), Videos (`.mp4`), PDFs (`.pdf`) und Fonts.
- `/css/style.css`: Das Herzstück des Designs. Vollständig responsive, modern aufgebaut (CSS Variables, Flexbox/Grid, Clamp) und streng nach den *Zero Blue Tint* Richtlinien.
- `/js/main.js`: Die Vanilla JS Engine. Steuert alle Interaktionen – vom Parallax-Scrubbing über das Lightbox-Routing, das dynamische Anzeigen des E-Mail-Buttons bis hin zu den Custom Video Controllern.
- `/scripts/`: PowerShell-Tools zur automatisierten Medienkomprimierung (FFmpeg).

## 🧰 Automatisierungs-Skripte
Im Ordner `scripts/` liegen zwei eigens entwickelte PowerShell-Skripte zur Web-Optimierung großer Medien:
- `compress_video_to_94mb.ps1`: Komprimiert Videos mit FFmpeg (2-Pass-Encoding) zielsicher unter das 100-MB-Limit von GitHub.
- `compress_photos_for_web.ps1`: Skaliert und konvertiert Bilderformate (.jpg, .png, .tif) stapelweise in speichersparende `.webp`-Formate für blitzschnelle Lade-Performance.

## 📬 Kontakt
Du möchtest Kontakt aufnehmen oder mehr über meine Projekte erfahren?
- **E-Mail:** [tobiasjschreiber@gmail.com](mailto:tobiasjschreiber@gmail.com)
- **Instagram:** [@tobiashdxd](https://instagram.com/tobiashdxd)

---
*© 2026 Tobias Schreiber. Alle Rechte vorbehalten.*

