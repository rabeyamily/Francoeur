# Francoeur ✦

> *turn any photo into a postage stamp — add a note, download & share*

**Francoeur** is a mobile-first web app that lets you frame photos with beautiful perforated postage stamp edges, write a handwritten-style note on the back, and download both as PNGs.

---

## Features

- 📸 Upload any photo → instant 3:2 stamp frame with perforated edges
- ✍️ Flip the stamp to write a note on the back (Caveat handwriting font)
- 🎨 Customise border color, perforation size, and border width
- 💾 Download the stamp front and/or note back as PNG
- 📱 Fully mobile-first, no frameworks, no build step

---

## Deploy to GitHub Pages

1. Fork or clone this repo
2. Go to **Settings → Pages**
3. Set source to `main` branch, `/ (root)` folder
4. Your app will be live at `https://<your-username>.github.io/<repo-name>`

That's it — no npm, no build, no config.

---

## Local development

Just open `index.html` in a browser. For font loading to work correctly, serve it over HTTP:

```bash
# Python
python -m http.server 8080

# Node
npx serve .
```

---

## File structure

```
francoeur/
├── index.html     ← markup & page structure
├── style.css      ← all styles (vintage, mobile-first)
├── fonts.css      ← Google Fonts imports
├── stamp.js       ← canvas rendering (front + back)
├── flip.js        ← card flip animation controller
├── app.js         ← main controller (navigation, events)
└── README.md
```

---

## Customisation

To change the default border color palette, edit the `.swatch` buttons in `index.html`.

To change the note font, swap `'Caveat'` in `stamp.js` and `fonts.css` for any Google Font with `font-display=swap`.

---

## Credits

Built with vanilla HTML, CSS & Canvas API. Fonts via [Google Fonts](https://fonts.google.com).

---

*Francoeur — free-hearted. A stamp is a little heart you send into the world.*
