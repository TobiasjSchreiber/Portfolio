# Tobias Schreiber — Portfolio (Medientechnik)

Willkommen im Quellcode meines digitalen Portfolios! Ich bin Student der Medientechnik mit Fokus auf 3D-Design, Videoproduktion und Webentwicklung.

Dieses Repository enthält den vollständigen Code meiner persönlichen Portfolio-Website, die meine Projekte in den Bereichen 3D-Modeling (Blender), Film, Fotografie und Interaktionsdesign präsentiert.

🌐 **Live-Ansicht:** [https://tobiasjschreiber.github.io/Portfolio/](https://tobiasjschreiber.github.io/Portfolio/) *(falls über GitHub Pages veröffentlicht)*

## 🛠️ Technologien & Design

Dieses Portfolio ist eine performante, statische Webseite:

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Designsprache:** Streng monochromes, randloses Design ("Zero Blue Tint") mit eleganten Serifenschriften (*Cormorant Garamond*, *Cinzel*) und Ambient Blur-Effekten.
- **Animationen & 3D:** 
  - `Three.js` für interaktive 3D-Elemente 
  - `Lenis` für flüssiges Smooth-Scrolling
- **Performance:** Alle Medien-Assets (4K-Videos, große Renderings) wurden für das Web hochgradig komprimiert, um schnelle Ladezeiten zu garantieren.

## 📂 Projektstruktur

- `/assets/`: Strukturierte Ablage für Bilder, optimierte Videos (`.mp4`), Fonts und Icons
- `/css/`: Stylesheets für das Layout
- `/js/`: Logik für den 3D-Renderer, Smooth-Scrolling und das Portfolio-Reflector-Skript
- `/scripts/`: Eigene PowerShell-Skripte zur automatisierten Medienkomprimierung

## 🧰 Automatisierungs-Skripte

Im Ordner `scripts/` liegen zwei nützliche PowerShell-Skripte, die ich entwickelt habe, um große Medien für GitHub und das Web zu optimieren. Sie können frei verwendet werden:
- `compress_video_to_94mb.ps1`: Komprimiert große Videos mit FFmpeg (2-Pass-Encoding) verlässlich unter das 100-MB-Limit von GitHub. Skaliert 4K-Material automatisch auf 1080p herunter.
- `compress_photos_for_web.ps1`: Skaliert große Bilderformate (.jpg, .png) stapelweise auf webfreundliche 1920px Breite und speichert sie hochkomprimiert.

## 📬 Kontakt

Du findest mich und weitere meiner Arbeiten hier:
- [LinkedIn](#) *(Hier Link einfügen)*
- [ArtStation / Vimeo / YouTube](#) *(Hier Link einfügen)*
- [E-Mail](#) *(Hier E-Mail einfügen)*

---
*© Tobias Schreiber*
