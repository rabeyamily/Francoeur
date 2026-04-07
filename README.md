# Francoeur ✦

Turn a photo into a perforated postage-stamp frame, add a note on the back, and download PNGs or a two-page PDF.

## What it does

- Upload on the stamp preview (drag-and-drop works there too)
- Adjust perforation size, border width, and border colour
- Flip with the **see the back** control only (the card itself doesn’t flip on tap)
- Download **Stamp** (PNG), **Note** (PNG), or **PDF** (stamp + note). Note and PDF need at least one character of note text; otherwise you get an in-app message instead of a file.
- Static site: HTML, CSS, and a few scripts—no build step

PDF export loads [jsPDF](https://github.com/parallax/jsPDF) from jsDelivr, so you need a network connection the first time that script is fetched.

## Run locally

Opening `index.html` as a `file://` URL can break fonts. Serve the folder instead:

```bash
python3 -m http.server 8080
# or: npx serve .
```

Then open `http://localhost:8080` (or the port your tool prints).

## Deploy

**GitHub Pages:** Repo **Settings → Pages** → source **main**, folder **`/ (root)`**. The site will be at `https://<user>.github.io/<repo>/`.

**Netlify:** Drag-and-drop the project folder at [netlify.com/drop](https://app.netlify.com/drop) if you want a URL without hooking up Git.

## Files

| File        | Role |
|------------|------|
| `index.html` | Layout |
| `style.css`  | Styles |
| `fonts.css`  | Google Fonts `@import` |
| `stamp.js`   | Canvas: stamp front + note card export |
| `flip.js`    | Flip button |
| `app.js`     | Controls, uploads, downloads, toast |

Swatch colours live in `index.html`. Note typography follows Caveat + layout constants in `stamp.js`.

## Credits

Fonts: [Google Fonts](https://fonts.google.com). PDF: jsPDF. Everything else is plain browser APIs.
