// PhonoFilm (phonofilm.cc) Exact Content Detail & Comments Controller

class PhonoFilmDetailView {
  constructor() {
    this.homeView = document.getElementById("home-page-view");
    this.contentView = document.getElementById("content-page-view");
    this.lightboxEl = document.getElementById("screenshot-lightbox");
    this.lightboxImg = document.getElementById("lightbox-img");
    this.lightboxCounter = document.getElementById("lightbox-counter");

    this.currentDrama = null;
    this.currentScreenshots = [];
    this.currentScreenshotIndex = 0;
    this.userRating = 5;

    this.initEvents();
  }

  openDrama(id) {
    if (!id || !window.INITIAL_DRAMAS) return;
    const d = window.INITIAL_DRAMAS.find(x => x.id === id);
    if (d) this.open(d);
  }

  initEvents() {
    // Back buttons
    document.querySelectorAll(".btn-back-to-home").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        this.close();
      });
    });

    // Browser back / forward button support
    window.addEventListener("popstate", (e) => {
      const match = window.location.hash.match(/#\/drama\/(.+)/);
      if (match && window.INITIAL_DRAMAS) {
        const d = window.INITIAL_DRAMAS.find(x => x.id === match[1]);
        if (d) {
          this.open(d, false, false, false);
          return;
        }
      }
      this.close(false);
    });

    // Lightbox Controls
    document.getElementById("btn-close-lightbox")?.addEventListener("click", () => this.closeLightbox());
    document.getElementById("lightbox-prev")?.addEventListener("click", () => this.prevScreenshot());
    document.getElementById("lightbox-next")?.addEventListener("click", () => this.nextScreenshot());
    this.lightboxEl?.addEventListener("click", (e) => {
      if (e.target === this.lightboxEl) this.closeLightbox();
    });

    // Keyboard ESC & Arrows
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (this.lightboxEl && !this.lightboxEl.classList.contains("hidden")) {
          this.closeLightbox();
        } else if (this.contentView && !this.contentView.classList.contains("hidden")) {
          this.close();
        }
      } else if (e.key === "ArrowLeft" && this.lightboxEl && !this.lightboxEl.classList.contains("hidden")) {
        this.prevScreenshot();
      } else if (e.key === "ArrowRight" && this.lightboxEl && !this.lightboxEl.classList.contains("hidden")) {
        this.nextScreenshot();
      }
    });

    // Check initial URL hash on page load
    setTimeout(() => {
      const match = window.location.hash.match(/#\/drama\/(.+)/);
      if (match && window.INITIAL_DRAMAS) {
        const d = window.INITIAL_DRAMAS.find(x => x.id === match[1]);
        if (d) this.open(d, false, false, false);
      }
    }, 100);
  }

  open(drama, scrollToDownloads = false, scrollToScreenshots = false, pushState = true) {
    if (!drama) return;
    this.currentDrama = drama;

    // Collect real screenshots
    let shots = [];
    if (Array.isArray(drama.screenshots) && drama.screenshots.length > 0) {
      shots = drama.screenshots.filter(s => s && typeof s === 'string' && !s.includes('picsxtra.com') && !s.includes('envs.sh'));
    }
    if (shots.length === 0) {
      if (drama.banner && drama.banner !== drama.poster && !drama.banner.includes('picsxtra.com')) shots.push(drama.banner);
      (drama.episodes || []).forEach(ep => {
        if (ep.thumbnail && ep.thumbnail !== drama.poster && !shots.includes(ep.thumbnail) && !ep.thumbnail.includes('picsxtra.com') && !ep.thumbnail.includes('envs.sh')) {
          shots.push(ep.thumbnail);
        }
      });
    }
    if (shots.length === 0 && drama.banner && !drama.banner.includes('picsxtra.com')) shots.push(drama.banner);
    if (shots.length === 0 && drama.poster && !drama.poster.includes('picsxtra.com')) shots.push(drama.poster);
    this.currentScreenshots = shots;

    // Render all PhonoFilm content sections
    this.renderContent();

    // Switch view smoothly
    if (this.homeView) this.homeView.classList.add("hidden");
    const watchlistView = document.getElementById("watchlist-page-view");
    if (watchlistView && !watchlistView.classList.contains("hidden")) {
      this.previousWasWatchlist = true;
      watchlistView.classList.add("hidden");
    } else {
      this.previousWasWatchlist = false;
    }
    if (this.contentView) {
      this.contentView.classList.remove("hidden");
      window.scrollTo({ top: 0, behavior: "instant" });
    }

    if (pushState) {
      history.pushState({ dramaId: drama.id }, drama.title, `#/drama/${drama.id}`);
    }

    // Scroll helpers
    if (scrollToDownloads) {
      setTimeout(() => {
        document.getElementById("content-downloads-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    } else if (scrollToScreenshots) {
      setTimeout(() => {
        document.getElementById("content-screenshots-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    }
  }

  close(updateHistory = true) {
    if (this.contentView) this.contentView.classList.add("hidden");
    const watchlistView = document.getElementById("watchlist-page-view");
    if (this.previousWasWatchlist && typeof window.showWatchlistView === "function") {
      window.showWatchlistView();
    } else {
      if (this.homeView) this.homeView.classList.remove("hidden");
      if (watchlistView) watchlistView.classList.add("hidden");
    }
    if (updateHistory && window.location.hash) {
      history.pushState(null, "", window.location.pathname);
    }
  }

  renderContent() {
    const d = this.currentDrama;
    if (!d) return;

    // 1. Hero Backdrop Image
    const backdropEl = document.getElementById("content-hero-backdrop");
    if (backdropEl) {
      const bgImg = d.banner || d.poster;
      backdropEl.style.backgroundImage = `linear-gradient(to bottom, rgba(14,14,13,0.3) 0%, rgba(14,14,13,0.7) 60%, #0e0e0d 100%), url('${bgImg}')`;
      backdropEl.style.backgroundSize = "cover";
      backdropEl.style.backgroundPosition = "center 25%";
    }

    // 2. Poster & Key Metadata
    const posterEl = document.getElementById("content-poster-img");
    if (posterEl) {
      posterEl.src = d.poster;
      posterEl.alt = d.title;
    }

    const titleEl = document.getElementById("content-title");
    if (titleEl) titleEl.textContent = d.title;

    const nativeEl = document.getElementById("content-native-title");
    if (nativeEl) nativeEl.textContent = d.nativeTitle || `${d.title} (தமிழ் Dubbed)`;

    const ratingBadge = document.getElementById("content-rating-badge");
    if (ratingBadge) ratingBadge.textContent = `★ ${d.rating || 8.6}`;

    const typeBadge = document.getElementById("content-type-badge");
    if (typeBadge) {
      typeBadge.textContent = d.type === 'kdrama' ? '🇰🇷 K-Drama' : '🇨🇳 C-Drama';
    }

    const yearMeta = document.getElementById("content-year-meta");
    if (yearMeta) yearMeta.textContent = `${d.year || 2024} • ${d.episodesCount || 16} Episodes • ${d.network || 'HD 1080p'}`;

    const genresEl = document.getElementById("content-genres-chips");
    if (genresEl) {
      genresEl.innerHTML = (d.genres || ['Drama']).map(g => `
        <span class="rounded-full border border-[#2b2b29] bg-[#181816] px-3 py-1 text-xs font-medium text-neutral-300">
          ${g}
        </span>
      `).join('');
    }

    // 3. Synopsis
    const synopsisEl = document.getElementById("content-synopsis");
    if (synopsisEl) {
      synopsisEl.textContent = d.synopsis || `Discover and download ${d.title} in verified 100% Tamil Dubbed audio.`;
    }

    // 4. Action Buttons (Download, Watchlist, Share)
    const dlJumpBtn = document.getElementById("btn-jump-download");
    if (dlJumpBtn) {
      dlJumpBtn.onclick = () => {
        document.getElementById("content-downloads-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
      };
    }

    const watchlistBtn = document.getElementById("content-btn-watchlist");
    if (watchlistBtn) {
      const isSaved = this.isDramaInWatchlist(d.id);
      this.updateWatchlistBtnUI(watchlistBtn, isSaved);
      watchlistBtn.onclick = () => {
        this.toggleWatchlist(d.id);
        const updatedSaved = this.isDramaInWatchlist(d.id);
        this.updateWatchlistBtnUI(watchlistBtn, updatedSaved);
        this.showToast(updatedSaved ? "Added to Watchlist!" : "Removed from Watchlist");
        if (typeof window.renderWatchlistGrid === "function") {
          window.renderWatchlistGrid();
        }
      };
    }

    const shareBtn = document.getElementById("content-btn-share");
    if (shareBtn) {
      shareBtn.onclick = () => {
        navigator.clipboard.writeText(window.location.href);
        this.showToast("Link copied to clipboard!");
      };
    }

    // 5. Seasons & Episodes
    const epCountHeader = document.getElementById("content-episodes-count");
    if (epCountHeader) {
      epCountHeader.textContent = `1 season • ${d.episodes ? d.episodes.length : (d.episodesCount || 16)} episodes`;
    }

    const epCarousel = document.getElementById("content-episodes-carousel");
    if (epCarousel) {
      const episodes = d.episodes || [];
      const firstDl = (d.downloadLinks && d.downloadLinks[0]) ? d.downloadLinks[0].url : '#';
      epCarousel.innerHTML = episodes.map(ep => `
        <div class="group relative flex flex-col w-48 sm:w-56 shrink-0 rounded-2xl bg-[#181816] border border-[#2b2b29] overflow-hidden">
          <div class="relative aspect-video overflow-hidden bg-black">
            <img src="${ep.thumbnail || d.poster}" alt="${ep.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" onerror="this.onerror=null;this.src='${d.banner || d.poster}';">
            <div class="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/80 font-mono text-[10px] text-white">${ep.duration || '60m'}</div>
            <div class="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-sky-600 font-bold text-[10px] text-white">EP ${ep.epNum}</div>
          </div>
          <div class="p-3 flex-1 flex flex-col justify-between space-y-2">
            <div>
              <h4 class="text-xs font-bold text-white line-clamp-1">${ep.title}</h4>
              <p class="text-[11px] text-neutral-400 line-clamp-1 mt-0.5">${ep.summary || `${d.title} Episode ${ep.epNum}`}</p>
            </div>
            <a href="${ep.downloadUrl || firstDl}" target="_blank" rel="noopener noreferrer"
               onclick="window.detailView.showToast('Opening Telegram... Press [START] in chat!')"
               class="btn-telegram w-full py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-md">
              <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.19-.08-.05-.19-.02-.27 0-.12.03-1.99 1.27-5.63 3.73-.53.36-1.02.54-1.45.53-.48-.01-1.4-.27-2.09-.49-.84-.27-1.51-.42-1.45-.88.03-.24.37-.49 1.02-.75 3.99-1.74 6.66-2.89 8.01-3.45 3.81-1.6 4.6-1.88 5.12-1.89.11 0 .37.03.54.17.14.12.18.28.2.45-.02.09-.02.24-.04.4z"/></svg>
              <span>Download</span>
            </a>
          </div>
        </div>
      `).join('');
    }

    // 6. TELEGRAM DOWNLOAD LINKS (Clean PhonoFilm card)
    const dlGrid = document.getElementById("content-download-cards");
    if (dlGrid) {
      let links = d.downloadLinks || [];
      if (links.length === 0 && d.episodes && d.episodes.length > 0) {
        const epWithDl = d.episodes.filter(e => e.downloadUrl);
        if (epWithDl.length > 0) {
          links = [
            { label: 'HD 720p Complete Season', quality: 'HD 720p Web-DL', size: 'Batch Download', url: epWithDl[0].downloadUrl },
            { label: 'Full HD 1080p Season', quality: 'Full HD 1080p', size: 'Full Season', url: epWithDl[0].downloadUrl }
          ];
        }
      }

      if (links.length > 0) {
        dlGrid.innerHTML = links.map(l => {
          const qName = l.quality || l.label || 'HD 720p Web-DL';
          const fSize = l.size || '';
          const tgUrl = l.url || 'https://t.me/KsVIPStorageBot';
          const appUrl = l.appUrl || tgUrl;

          return `
            <div class="rounded-2xl bg-[#181816] border border-[#2b2b29] hover:border-sky-500/50 p-4 sm:p-5 flex flex-col justify-between gap-4 transition-all shadow-md group">
              <div class="space-y-2">
                <div class="flex items-center justify-between gap-2 flex-wrap">
                  <span class="text-sm font-extrabold text-white flex items-center gap-2">
                    <span class="text-sky-400">📁</span> ${qName}
                  </span>
                  ${fSize ? `
                    <span class="px-2.5 py-1 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-xs font-bold">
                      📦 ${fSize}
                    </span>
                  ` : ''}
                </div>
                <p class="text-xs text-neutral-400">
                  ${d.title} • Season 1 (Tamil Dubbed)
                </p>
              </div>

              <div class="pt-2 border-t border-white/5">
                <a href="${tgUrl}" target="_blank" rel="noopener noreferrer"
                   onclick="window.detailView.showToast('Telegram opening... Press [START] button at bottom of chat to get file!')"
                   class="btn-telegram w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md">
                  <svg class="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.19-.08-.05-.19-.02-.27 0-.12.03-1.99 1.27-5.63 3.73-.53.36-1.02.54-1.45.53-.48-.01-1.4-.27-2.09-.49-.84-.27-1.51-.42-1.45-.88.03-.24.37-.49 1.02-.75 3.99-1.74 6.66-2.89 8.01-3.45 3.81-1.6 4.6-1.88 5.12-1.89.11 0 .37.03.54.17.14.12.18.28.2.45-.02.09-.02.24-.04.4z"/>
                  </svg>
                  <span>Download Telegram File</span>
                </a>
              </div>
            </div>
          `;
        }).join('');
      } else {
        dlGrid.innerHTML = `
          <div class="col-span-full p-6 rounded-2xl bg-[#181816] border border-[#2b2b29] text-center space-y-3">
            <p class="text-sm text-neutral-300">Files available directly on official Telegram Channel</p>
            <a href="https://t.me/dramafytamildubs" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 btn-telegram px-6 py-2.5 rounded-full text-xs font-bold shadow-md">
              <span>Open @dramafytamildubs</span>
            </a>
          </div>
        `;
      }
    }

    // 7. REAL SCREENSHOTS (HD Video Stills)
    const scSection = document.getElementById("content-screenshots-section");
    const scGrid = document.getElementById("content-screenshots-grid");
    if (scGrid) {
      const validShots = (this.currentScreenshots || []).filter(s => s && typeof s === 'string' && !s.includes('picsxtra.com'));
      if (validShots.length === 0) {
        if (scSection) scSection.classList.add("hidden");
      } else {
        if (scSection) scSection.classList.remove("hidden");
        scGrid.innerHTML = validShots.map((imgUrl, idx) => `
          <div class="screenshot-card relative group aspect-video rounded-xl overflow-hidden bg-neutral-900 border border-[#2b2b29] cursor-pointer shadow-md"
               onclick="window.detailView.openLightbox(${idx})">
            <img src="${imgUrl}" alt="${d.title} Screenshot ${idx + 1}"
                 class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                 loading="lazy"
                 onerror="this.onerror=null; const c = this.closest('.screenshot-card'); if (c) c.remove();">
            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span class="px-3 py-1.5 rounded-full bg-black/75 text-white text-xs font-semibold backdrop-blur-md flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5 fill-none stroke-current" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"/></svg>
                Enlarge
              </span>
            </div>
            <div class="absolute bottom-1.5 left-2 px-1.5 py-0.5 rounded bg-black/70 font-mono text-[9px] text-neutral-300">
              Still #${idx + 1}
            </div>
          </div>
        `).join('');
      }
    }

    // 8. Actors & Cast
    const actorsGrid = document.getElementById("content-actors-grid");
    if (actorsGrid) {
      const castList = d.cast && d.cast.length > 0 ? d.cast : ["Official Ensemble Cast", "Lead Actor", "Lead Actress"];
      actorsGrid.innerHTML = castList.map((actor, idx) => `
        <div class="flex items-center gap-3 p-3 rounded-2xl bg-[#181816] border border-[#2b2b29]">
          <div class="w-10 h-10 rounded-full bg-neutral-800 border border-white/10 flex items-center justify-center font-bold text-white text-xs shrink-0">
            ${actor.charAt(0)}
          </div>
          <div class="min-w-0">
            <div class="text-xs font-bold text-white truncate">${actor}</div>
            <div class="text-[10px] text-neutral-400">Actor</div>
          </div>
        </div>
      `).join('');
    }

    // 9. Studios & Tags
    const networkEl = document.getElementById("content-studios-chip");
    if (networkEl) networkEl.textContent = d.network || d.country || "OTT Web-DL";

    const tagsContainer = document.getElementById("content-tags-container");
    if (tagsContainer) {
      const tags = [
        "100% Tamil Dubbed",
        d.type === 'kdrama' ? 'South Korean' : 'Chinese',
        ...(d.genres || []),
        "Multi Audio",
        "HD 1080p",
        "Binge-worthy",
        "Romantic Comedy",
        "Drama Series"
      ];
      tagsContainer.innerHTML = tags.map(t => `
        <span class="rounded-full border border-[#2b2b29] bg-[#181816] px-3 py-1 text-xs text-neutral-300">
          ${t}
        </span>
      `).join('');
    }

    // 10. REVIEWS & COMMENTS (PhonoFilm style)
    this.renderCommentsSection();

    // 11. More Like This (Similar Dramas)
    this.renderSimilarDramas();
  }

  // Comments & Reviews Manager
  renderCommentsSection() {
    const d = this.currentDrama;
    if (!d) return;

    // Rate stars interactive selector
    const starContainer = document.getElementById("content-rate-stars");
    if (starContainer) {
      starContainer.innerHTML = [1, 2, 3, 4, 5].map(star => `
        <button type="button" class="star-rating-btn text-2xl transition-transform hover:scale-125 px-1" data-val="${star}">
          ★
        </button>
      `).join('');

      const stars = starContainer.querySelectorAll(".star-rating-btn");
      const updateStarsUI = (val) => {
        this.userRating = val;
        stars.forEach((s, idx) => {
          s.style.color = (idx < val) ? "#ffb703" : "#3e3e38";
        });
      };
      updateStarsUI(5);

      stars.forEach(s => {
        s.addEventListener("click", () => updateStarsUI(parseInt(s.dataset.val)));
      });
    }

    // Comment form submission
    const commentForm = document.getElementById("content-comment-form");
    if (commentForm) {
      commentForm.onsubmit = (e) => {
        e.preventDefault();
        const nameInput = document.getElementById("comment-user-name");
        const textInput = document.getElementById("comment-user-text");
        const name = nameInput ? nameInput.value.trim() : "Viewer";
        const text = textInput ? textInput.value.trim() : "";

        if (!text) return;

        const newComment = {
          name: name || "Tamil Drama Fan",
          rating: this.userRating * 2, // convert 5-star to 10-scale
          date: "Just now",
          text: text,
          likes: 1
        };

        const existing = this.getStoredComments(d.id);
        existing.unshift(newComment);
        localStorage.setItem(`phonofilm_comments_${d.id}`, JSON.stringify(existing));

        if (textInput) textInput.value = "";
        this.renderCommentsList(d.id);
        this.showToast("Review submitted successfully!");
      };
    }

    this.renderCommentsList(d.id);
  }

  getStoredComments(dramaId) {
    try {
      const stored = localStorage.getItem(`phonofilm_comments_${dramaId}`);
      if (stored) return JSON.parse(stored);
    } catch (e) {}

    // Default sample comments for realistic PhonoFilm showcase
    return [
      {
        name: "Karthik R.",
        rating: 9.5,
        date: "2 days ago",
        text: "Excellent Tamil dubbed audio quality! The voice syncing and background music are super crisp. Downloaded the 1080p full pack via Telegram with no hassle.",
        likes: 24
      },
      {
        name: "Priya S.",
        rating: 9.0,
        date: "5 days ago",
        text: "One of my all-time favorites! So glad to find the authentic Tamil dubbed version here without any irritating ad redirects.",
        likes: 18
      },
      {
        name: "Vijay M.",
        rating: 8.5,
        date: "1 week ago",
        text: "Direct Telegram download worked immediately. Saved both 720p and 1080p episodes. Highly recommended for K-drama fans!",
        likes: 12
      }
    ];
  }

  renderCommentsList(dramaId) {
    const listContainer = document.getElementById("content-comments-feed");
    if (!listContainer) return;

    const comments = this.getStoredComments(dramaId);
    listContainer.innerHTML = comments.map((c, idx) => `
      <div class="rounded-2xl bg-[#181816] border border-[#2b2b29] p-4 sm:p-5 space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-500 to-amber-500 text-white font-bold flex items-center justify-center text-xs shrink-0">
              ${c.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div class="text-xs sm:text-sm font-bold text-white">${c.name}</div>
              <div class="text-[10px] text-neutral-400">${c.date}</div>
            </div>
          </div>
          <span class="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 font-extrabold text-xs">
            ★ ${c.rating}
          </span>
        </div>
        <p class="text-xs sm:text-sm text-neutral-300 leading-relaxed">${c.text}</p>
        <div class="flex items-center gap-3 pt-1 text-xs text-neutral-400">
          <button class="hover:text-white flex items-center gap-1 transition-colors" onclick="this.querySelector('span').textContent = parseInt(this.querySelector('span').textContent) + 1">
            👍 <span>${c.likes || 1}</span> Likes
          </button>
        </div>
      </div>
    `).join('');
  }

  // Similar Dramas Carousel
  renderSimilarDramas() {
    const d = this.currentDrama;
    const container = document.getElementById("content-similar-carousel");
    if (!container || !window.INITIAL_DRAMAS) return;

    const similar = window.INITIAL_DRAMAS
      .filter(x => x.id !== d.id && (x.type === d.type || (x.genres || []).some(g => (d.genres || []).includes(g))))
      .slice(0, 14);

    container.innerHTML = similar.map(item => `
      <div class="phono-card group relative flex flex-col w-32 shrink-0 sm:w-36 md:w-40 lg:w-44 cursor-pointer"
           onclick="window.detailView.open(window.INITIAL_DRAMAS.find(x => x.id === '${item.id}'))">
        <div class="md:drop-shadow-[3.11px_3.11px_8.55px_#00000040]">
          <div class="poster-mask relative aspect-[210/308] overflow-hidden bg-[#161513] border border-[#2e2a26]">
            <img src="${item.poster}" alt="${item.title}" class="poster-img w-full h-full object-cover" loading="lazy">
            <div class="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-black/80 text-amber-300 border border-white/10">
              ★ ${item.rating || 8.5}
            </div>
            <div class="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#e8a13a] text-black">
              🎙️ தமிழ்
            </div>
          </div>
        </div>
        <h4 class="mt-1.5 line-clamp-2 px-0.5 text-xs sm:text-sm leading-snug font-medium text-[#f5f2ea] group-hover:text-[#e8a13a] transition-colors">
          ${item.title}
        </h4>
        <div class="mt-0.5 flex items-center gap-1.5 px-0.5 text-[11px] font-mono text-[#b8afa4]">
          <span>${item.year || 2024}</span>
          <span>•</span>
          <span>${item.episodesCount || 16} eps</span>
        </div>
      </div>
    `).join('');
  }

  // Lightbox Methods
  openLightbox(index) {
    if (!this.currentScreenshots || this.currentScreenshots.length === 0) return;
    this.currentScreenshotIndex = Math.max(0, Math.min(index, this.currentScreenshots.length - 1));
    this.updateLightboxImage();
    if (this.lightboxEl) this.lightboxEl.classList.remove("hidden");
  }

  closeLightbox() {
    if (this.lightboxEl) this.lightboxEl.classList.add("hidden");
  }

  prevScreenshot() {
    if (this.currentScreenshots.length <= 1) return;
    this.currentScreenshotIndex = (this.currentScreenshotIndex - 1 + this.currentScreenshots.length) % this.currentScreenshots.length;
    this.updateLightboxImage();
  }

  nextScreenshot() {
    if (this.currentScreenshots.length <= 1) return;
    this.currentScreenshotIndex = (this.currentScreenshotIndex + 1) % this.currentScreenshots.length;
    this.updateLightboxImage();
  }

  updateLightboxImage() {
    if (this.lightboxImg) this.lightboxImg.src = this.currentScreenshots[this.currentScreenshotIndex];
    if (this.lightboxCounter) {
      this.lightboxCounter.textContent = `${this.currentScreenshotIndex + 1} / ${this.currentScreenshots.length}`;
    }
  }

  // Watchlist helpers
  isDramaInWatchlist(dramaId) {
    try {
      const list = JSON.parse(localStorage.getItem("dramafy_watchlist") || "[]");
      return list.includes(dramaId);
    } catch {
      return false;
    }
  }

  toggleWatchlist(dramaId) {
    try {
      let list = JSON.parse(localStorage.getItem("dramafy_watchlist") || "[]");
      if (list.includes(dramaId)) {
        list = list.filter(id => id !== dramaId);
      } else {
        list.push(dramaId);
      }
      localStorage.setItem("dramafy_watchlist", JSON.stringify(list));
    } catch (e) {
      console.error(e);
    }
  }

  updateWatchlistBtnUI(btn, isSaved) {
    if (!btn) return;
    btn.innerHTML = isSaved ? `<span>★</span> Saved` : `<span>＋</span> Watchlist`;
    btn.classList.toggle("bg-white", isSaved);
    btn.classList.toggle("text-black", isSaved);
  }

  showToast(message) {
    let toast = document.getElementById("app-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "app-toast";
      toast.className = "fixed bottom-16 sm:bottom-6 right-6 z-50 bg-[#1d1d1b] border border-sky-500/40 text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-bold transition-all duration-300 opacity-0 pointer-events-none";
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.remove("opacity-0");
    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      toast.classList.add("opacity-0");
    }, 2500);
  }
}

// Global instance
window.PhonoFilmDetailView = PhonoFilmDetailView;
window.DramaDetailModal = PhonoFilmDetailView; // Compatibility alias
