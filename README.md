# Tobias Schreiber — Portfolio (Medientechnik)

Ein minimalistisches, tiefschwarzes Web-Portfolio für **Tobias Schreiber** (Student der Medientechnik). 
Reine statische Webseite (**HTML5, CSS3, ES-JavaScript**) – vollständig kompatibel mit **GitHub Pages**, Vercel, Netlify oder jedem anderen statischen Webhoster.

---

## Besonderheiten der statischen Version

- **100% statisch & autark:** Keine serverseitigen Skripte, keine Build-Tools nötig. Einfach hochladen und fertig.
- **GitHub-optimiert:** 
  - Alle Video-Assets wurden für schnelles Web-Streaming (`H.264`, `AAC`, `+faststart`) optimiert und liegen deutlich unter dem 100-MB-Limit von GitHub.
  - Enthält `.nojekyll`, damit GitHub Pages alle Unterordner und Ressourcen direkt und unverändert ausliefert.
  - Vollständig relative Pfade (`css/`, `js/`, `Ressourcen/`), kompatibel mit benutzerdefinierten Domains sowie Sub-Pfaden wie `https://<username>.github.io/<repo-name>/`.
- **Typografie & Ästhetik:** Elegante Serifenschrift (*Cormorant Garamond* & *Cinzel*), tiefschwarzer Hintergrund (`#020203`), Ambient Blur-Effekte, randlose Medienbühnen und fließendes Smooth-Scrolling (Lenis).

---

## In 3 Schritten auf GitHub Pages veröffentlichen

### 1. GitHub-Repository erstellen
- Erstelle auf [github.com](https://github.com/new) ein neues Repository (z. B. `portfolio` oder `<dein-benutzername>.github.io`).
- Wähle **Public** (damit GitHub Pages kostenlos genutzt werden kann).

### 2. Projekt zu GitHub hochladen (Terminal)
Öffne das Terminal in diesem Ordner (`c:\My_Skripts_Local\Portfolio`) und führe folgende Befehle aus:

```bash
git add .
git commit -m "Initial portfolio release"
git branch -M main
git remote add origin https://github.com/<DEIN-GITHUB-BENUTZERNAME>/<DEIN-REPO-NAME>.git
git push -u origin main
```

*(Ersetze `<DEIN-GITHUB-BENUTZERNAME>` und `<DEIN-REPO-NAME>` mit deinen GitHub-Daten).*

### 3. GitHub Pages aktivieren
1. Gehe in deinem GitHub-Repository auf **Settings** (Einstellungen).
2. Klicke in der linken Seitenleiste auf **Pages**.
3. Wähle unter **Build and deployment**:
   - **Source:** `Deploy from a branch`
   - **Branch:** `main` und Ordner `/ (root)`
4. Klicke auf **Save**.

Nach ca. 1 bis 2 Minuten ist deine Webseite weltweit erreichbar unter:
`https://<DEIN-GITHUB-BENUTZERNAME>.github.io/<DEIN-REPO-NAME>/`

---

## Lokale Vorschau

- **Direkt im Browser öffnen:** Doppelklick auf `index.html`.
- **Mit lokalem HTTP-Server testen:**
  ```bash
  npm start
  ```
  Öffne anschließend [http://localhost:3000](http://localhost:3000) im Browser.
