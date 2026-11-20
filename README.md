# DRAMAFY - Tamil Dubbed K-Drama & C-Drama Hub

A modern, responsive Asian drama discovery platform inspired by **PhonoFilm (`phonofilm.cc`)** and **DramasMood**. Features **100% Tamil Dubbed** Korean & Chinese dramas with real episode screenshots and direct Telegram download links that completely bypass ad-shorteners (`shrinkme.io`, `klinks.space`, `neolinks.sbs`).

---

## 📊 Catalog Breakdown

| Category | Count | Highlights |
| :--- | :--- | :--- |
| **🇰🇷 K-Dramas (Tamil Dub)** | **106 Series** | *Squid Game, Guardian: The Lonely and Great God, I Am Not a Robot, Reply 1988, Pinocchio, Dr. Romantic, Suspicious Partner, Hospital Ship, Summer Strike, Extraordinary You, and more* |
| **🇨🇳 C-Dramas (Tamil Dub)** | **35 Series** | *The Untamed, Love O2O, Put Your Head on My Shoulder, A Robot in the Orange Orchard, Snow Fall, Mysterious Love, and more* |
| **🎙️ Tamil Dubbed (தமிழ்)** | **141 Series (100%)** | All titles verified with authentic Tamil Dubbed audio tracks and clean English/Tamil titles (zero Korean Hangul titles) |
| **✈️ Direct Telegram Links** | **638 Links (100%)** | Every download link goes directly to Telegram bots/files without ad-shorteners |
| **📸 Real Screenshots** | **141 Series** | Authentic HD episode stills scraped directly from DramasMood releases |

---

## 🌟 Key Features

1. **PhonoFilm-Inspired UI & Layout**:
   * **Hero Spotlight Carousel**: Dynamic auto-sliding featured banners with large title key art, metadata, `#1 Trending` tags, and quick CTAs.
   * **Horizontal Scroll Carousels**: Smooth arrow-controlled rows for *Trending Now (Top Rated)*, *Popular K-Dramas*, *Hit C-Dramas*, *Romance*, and *Action & Fantasy*.
   * **Responsive Discovery Grid**: 6-column to 2-column mobile responsive grid with real posters, rating badges, Tamil Dub tags, and instant search.

2. **DramasMood Style Drama Details (No Video Player Needed)**:
   * **Direct Telegram Downloads**: One-click download cards featuring the official Telegram logo, resolution & format labels (480p, 720p, 1080p, Batch), file sizes, and direct Telegram links.
   * **Real Episode Screenshots Gallery**: High-definition still frames from the actual Tamil Dubbed release.
   * **Fullscreen Screenshot Lightbox**: Click any screenshot to view full resolution with keyboard/touch navigation.
   * **Episodes Guide**: Complete episode cards with duration, synopsis, and direct download buttons.

3. **100% Ad-Free Experience**:
   * All intermediate ad-shortener redirects (`shrinkme.io`, `klinks.space`, `neolinks.sbs`) are completely stripped away. Users land directly on the Telegram file/bot link.

---

## 🚀 How to Run

### Option 1: Node.js (Active on Port 3000)
```bash
node server.js
```
Visit: [http://localhost:3000](http://localhost:3000)

### Option 2: Python
```bash
python server.py
```
Visit: [http://localhost:8000](http://localhost:8000)

---

## 📁 Project Structure

```
e:/kdrama streaming/
├── index.html          # PhonoFilm-style layout with Hero Slider & Detail Modal
├── css/
│   └── styles.css      # Dark cinema aesthetics, glassmorphism, Telegram styles
├── js/
│   ├── data.js         # 141 Tamil Dubbed dramas with real screenshots & direct Telegram links
│   ├── detail.js       # PhonoFilm & DramasMood modal controller (Screenshots & Telegram)
│   ├── player.js       # Compatibility bridge routing to detail modal
│   └── app.js          # Hero slider, horizontal carousels, instant search & filters
├── data/
│   └── dramasmood_tamil_dramas.json  # Raw scraped dataset from DramasMood
├── scripts/
│   ├── scrape_dramasmood.py          # Scraper for DramasMood WordPress API
│   ├── resolve_all_and_clean_korean.py # Unshortens links & removes Hangul
│   └── verify_audit.py               # Integrity checker for links and language tags
├── server.js           # Lightweight static server with JSON links API
└── README.md           # Documentation
```
