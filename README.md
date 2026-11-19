# Rotaract Club of RiiT · Chhath Puja Interactive Experience

A mobile-first website opened by scanning the QR code on a Thekua Prasad packet.
Visitors tap a Thekua five times to take bites, then the site fades in: Chhath Puja story, Thekua story,
a step-by-step preparation journey with individual videos, the distribution clip, the 1:30 club message and a closing greeting.

Plain HTML + CSS + vanilla JavaScript. No frameworks, no build step, no external services. Fonts are self-hosted.

## What is already done

| Part | Status |
|---|---|
| Five-tap Thekua opening (uses your plate photo, cut out; 5 bite stages, crumbs, dots, double-tap protection) | Done: `assets/images/thekua-*.webp` |
| Illustrated hero (sunrise at the ghat) and 2D characters: devotees giving arghya, a man carrying the daura, a girl with a diya, sugarcane, a family walking home | Done: `assets/illustrations/*.svg` (animated, local) |
| Tradition, Thekua, Preparation journey, distribution clip, club message, closing | Done |
| Music button, volume, auto-lowering when any video plays | Done (needs your audio file) |
| Photos, videos, music | **Slots ready**: they fill in the moment you add the files below |

## Files you need to add

Use these exact names. Nothing in the code needs to change. `.webp .jpg .jpeg .png` (images), `.mp4 .webm .mov` (videos) and `.mp3 .m4a .ogg .wav` (music) are detected automatically.

```
assets/audio/background-music.mp3                                 your music: just rename your download to this
assets/videos/preparation-step-01.mp4 ... preparation-step-05.mp4  five prep clips
assets/videos/club-message.mp4                                    the 1:30 club video
assets/videos/distribution-clip.mp4                               the distribution clip
assets/images/chhath-puja/ghat-sunrise.jpg , offerings.jpg
assets/images/thekua/thekua-plate.jpg , ingredients.jpg
assets/images/ingredients/atta, gur, ghee, naariyal, saunf, elaichi   (.jpg etc.)
assets/images/preparation/step-01 ... step-05                     optional covers for each step video
```

Each folder has a `README.txt`. Open the site with `?debug` at the end of the URL (e.g. `index.html?debug`) to see the expected path printed on every placeholder.

**Photo credits:** if you use Creative Commons photos (e.g. from Wikimedia Commons), list them in `assets/images/credits.json` (an example is in `assets/images/credits-example.json.txt`). The site then shows the credit under the photo and in a "Photo credits" list at the bottom.

> **Step titles/descriptions:** the five step texts (in `CONFIG.steps` at the top of `script.js`) follow your brief.
> Once your clips are in, watch each one and edit its title/text if it doesn't match. To add a step (shaping, moulds, frying),
> add one line to that list and upload the clip.

Text you may want to change (steps, ingredient notes, music name/volume, opening messages) is in the `CONFIG` block at the top of `script.js`. Page copy is in `index.html`; colours are the variables at the top of `style.css`.

## Preview on your computer

```bash
python3 -m http.server 8000     # then open http://localhost:8000
```
(Opening `index.html` by double-click also works, but a local server behaves like the real site.)

## Publish on GitHub Pages (free, permanent HTTPS URL)

1. Create a free account at <https://github.com/signup> if you don't have one.
2. This repository already exists. If you need a new one: **New repository**, public, no template.
3. Upload files: on the repo page choose **Add file → Upload files**, drag in the new photos/videos/audio (keeping the folder names), then **Commit changes**.
   Files over 25 MB can't be uploaded in the browser; use GitHub Desktop or `git push` (limit 100 MB per file, so compress videos).
4. Go to **Settings → Pages**. Under *Build and deployment* set **Source: Deploy from a branch**, **Branch: `main`** (or whichever branch holds the site), folder **`/ (root)`**, then **Save**.
   If your site is on a feature branch, merge it into `main` first.
5. Wait 1 to 2 minutes. The page shows **"Your site is live at …"**. It looks like
   `https://<your-username>.github.io/<repository-name>/`
   (for this repo: `https://kamalnayanburnwal-code.github.io/Chhath-Puja/`). That is your permanent URL. Copy it exactly as shown.
6. Open it on your phone and confirm the Thekua appears.

## Make the QR code

1. Use any free static QR generator (e.g. <https://www.qr-code-generator.com/>'s free static option, or <https://goqr.me/>). Choose **URL / Website** and paste the permanent URL from step 5. **Do not choose "dynamic" codes** (they expire or ask for payment).
2. Download as **SVG or high-res PNG**. Print at least **2.5 cm × 2.5 cm** with a quiet white border and strong contrast.
3. **Test before printing:** scan with at least one Android phone and one iPhone, on mobile data as well as Wi-Fi, using the default camera app.

## Update the site later (QR code never changes)

Edit text, swap videos or photos, change the music, restyle: upload or edit the files in the same repository
(**Add file → Upload files** with the same file name replaces the old one, or **✏️ edit** a file).
Pages republishes automatically in 1 to 2 minutes at the same URL. Phones that visited before may need a refresh to see changes.

**Never rename the repository or your GitHub username after printing:** that changes the URL. If you ever want a branded address, you can later add a custom domain in Settings → Pages and keep the old link as the QR target.

## Project structure

```
index.html            page structure and copy
style.css             design (colours at the top)
script.js             opening interaction, music, journey + CONFIG block
assets/
  fonts/              self-hosted Cormorant Garamond, Mukta, Tiro Devanagari
  images/             thekua-original.webp, thekua-bite-1..5.webp (the opening) + photo folders
  illustrations/      2D SVG characters and scenes (hero, devotees, family, ornaments)
  videos/             preparation-step-01…05.mp4, club-message.mp4
  audio/              background-music.mp3
```

## Notes

- Music never autoplays with sound before a tap. It starts on the visitor's first tap on the Thekua and can be paused from the floating button.
- Videos never autoplay or chain. Starting any video fades the music out; it returns when the video pauses or ends.
- Videos are loaded only when their section is near the screen, so the Thekua opening never waits for them.
- Honours *reduce motion* settings, and the site stays readable if animations are off.
