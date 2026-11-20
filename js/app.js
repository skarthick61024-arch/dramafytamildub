// PhonoFilm (phonofilm.cc) Exact Frontend Application Logic

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Detail View Controller
  window.detailView = new PhonoFilmDetailView();
  window.detailModal = window.detailView; // Compatibility alias

  function getStoredDramasSafe() {
    if (typeof getStoredDramas === 'function') {
      try { const d = getStoredDramas(); if (d && d.length) return d; } catch (e) { }
    }
    if (typeof window !== 'undefined') {
      if (window.INITIAL_DRAMAS && window.INITIAL_DRAMAS.length) return window.INITIAL_DRAMAS;
      if (window.TAMIL_DRAMAS_DATA && window.TAMIL_DRAMAS_DATA.length) return window.TAMIL_DRAMAS_DATA;
      if (window.DRAMA_DATA && window.DRAMA_DATA.length) return window.DRAMA_DATA;
    }
    return [];
  }
  let dramas = getStoredDramasSafe();
  let currentFilter = "all";
  let searchQuery = "";
  let onlyTamilDubbed = false;
  let sortBy = "rating";

  // DOM Elements
  const homePageView = document.getElementById("home-page-view");
  const contentPageView = document.getElementById("content-page-view");
  const watchlistPageView = document.getElementById("watchlist-page-view");
  const watchlistGrid = document.getElementById("watchlist-grid");
  const watchlistEmptyState = document.getElementById("watchlist-empty-state");
  const watchlistBadgeCount = document.getElementById("watchlist-badge-count");
  const btnClearWatchlist = document.getElementById("btn-clear-watchlist");

  const heroSliderContainer = document.getElementById("hero-slider-container");
  const heroIndicators = document.getElementById("hero-indicators");
  const heroPrevBtn = document.getElementById("hero-prev-btn");
  const heroNextBtn = document.getElementById("hero-next-btn");
  const dramaGrid = document.getElementById("drama-grid");
  const searchInput = document.getElementById("search-input");
  const searchInputMobile = document.getElementById("search-input-mobile");
  const btnSearchClear = document.getElementById("btn-search-clear");
  const btnSearchClearMobile = document.getElementById("btn-search-clear-mobile");
  const searchDropdownDesktop = document.getElementById("search-dropdown-desktop");
  const searchDropdownMobile = document.getElementById("search-dropdown-mobile");
  const categoryPills = document.querySelectorAll(".category-pill");
  const sortSelect = document.getElementById("sort-select");

  // Summary Count Elements
  const countKdramaEl = document.getElementById("count-kdrama");
  const countCdramaEl = document.getElementById("count-cdrama");
  const countTamilEl = document.getElementById("count-tamil");
  const countTotalEl = document.getElementById("count-total");

  // Hero Slider State
  let heroSlides = [];
  let currentSlideIndex = 0;
  let heroTimer = null;

  // 1. Update Metrics
  function updateMetrics() {
    const kCount = dramas.filter(d => d.type === "kdrama").length;
    const cCount = dramas.filter(d => d.type === "cdrama").length;
    const tamilCount = dramas.filter(d => d.tamilDubbed).length;
    const totalCount = dramas.length;

    if (countKdramaEl) countKdramaEl.textContent = kCount;
    if (countCdramaEl) countCdramaEl.textContent = cCount;
    if (countTamilEl) countTamilEl.textContent = tamilCount;
    if (countTotalEl) countTotalEl.textContent = totalCount;
  }

  // 2. Setup PhonoFilm Hero Showcase Carousel
  function setupHeroSlider() {
    if (!heroSliderContainer) return;

    // Pick top 6 iconic trending titles with high-res banners
    heroSlides = dramas.filter(d => d.banner && d.banner !== d.poster).slice(0, 6);
    if (heroSlides.length === 0) heroSlides = dramas.slice(0, 5);

    heroSliderContainer.innerHTML = "";
    if (heroIndicators) heroIndicators.innerHTML = "";

    heroSlides.forEach((drama, idx) => {
      const slide = document.createElement("div");
      slide.className = `hero-slide absolute inset-0 w-full h-full ${idx === 0 ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"} transition-opacity duration-700 ease-in-out`;

      const bannerImg = drama.banner || drama.poster;
      const isKdrama = drama.type === 'kdrama';

      slide.innerHTML = `
        <!-- High-Definition Backdrop Art (Hardware-accelerated, crystal clear, unclouded) -->
        <img src="${bannerImg}" alt="${drama.title}" class="hero-bg-img absolute inset-0 w-full h-full object-cover object-[50%_25%] filter brightness-95 contrast-105 pointer-events-none select-none" loading="${idx === 0 ? 'eager' : 'lazy'}" decoding="async" onerror="this.onerror=null;this.src='${drama.poster}';">

        <!-- Modern Cinema Vignette: Only shades bottom 35% behind buttons, leaves 70% of artwork bright and vivid -->
        <div class="absolute inset-0 bg-gradient-to-t from-[#0e0e0d] via-[#0e0e0d]/55 to-transparent pointer-events-none"></div>
        <div class="hidden sm:block absolute inset-0 bg-gradient-to-r from-[#0e0e0d]/85 via-[#0e0e0d]/20 to-transparent pointer-events-none"></div>

        <!-- Slide Content Container with Drama Thumbnail prominently and clearly displayed -->
        <div class="max-w-7xl mx-auto h-full px-4 sm:px-8 lg:px-12 flex items-end pb-8 sm:pb-12 gap-4 sm:gap-6 lg:gap-8 relative z-20">
          
          <!-- Prominent Vertical Drama Thumbnail Card (Desktop & Tablet) -->
          <div class="hidden sm:block shrink-0 w-28 sm:w-36 md:w-44 lg:w-48 aspect-[2/3] rounded-2xl overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.9)] border-2 border-white/25 bg-[#161513] relative group/thumb cursor-pointer hover:border-amber-400 transition-all duration-300 btn-hero-info" data-id="${drama.id}">
            <img src="${drama.poster}" alt="${drama.title}" class="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500" loading="${idx === 0 ? 'eager' : 'lazy'}" decoding="async">
            <div class="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/85 backdrop-blur-md text-[10px] sm:text-xs font-bold text-amber-300 border border-amber-400/30 flex items-center gap-1 shadow-md">
              <span>★</span> ${drama.rating || '8.5'}
            </div>
            <div class="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/80 font-mono text-[9px] text-white/90 uppercase font-semibold">
              HD
            </div>
          </div>

          <!-- Text & Actions Area -->
          <div class="flex-1 flex flex-col justify-end space-y-2 sm:space-y-3 max-w-2xl">
            
            <!-- Mobile Mini Thumbnail & Badges Row (Clearly displays drama thumbnail on mobile without obscuring screen) -->
            <div class="flex items-center gap-3 sm:hidden">
              <div class="w-16 h-22 rounded-xl overflow-hidden shadow-2xl border border-white/30 bg-[#161513] shrink-0 cursor-pointer btn-hero-info" data-id="${drama.id}">
                <img src="${drama.poster}" alt="${drama.title}" class="w-full h-full object-cover object-top">
              </div>
              <div class="flex flex-col gap-1 min-w-0">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="rounded-full bg-white text-black px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                    #${idx + 1} TODAY
                  </span>
                  <span class="rounded-full border border-amber-500/30 bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                    🎙️ தமிழ் Dub
                  </span>
                </div>
                <h1 class="font-lufga text-xl font-bold text-white tracking-tight leading-tight line-clamp-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                  ${drama.title}
                </h1>
                <p class="text-[11px] text-neutral-300 font-medium flex items-center gap-1.5">
                  <span>${drama.year || 2024}</span>
                  <span>•</span>
                  <span class="text-amber-300 font-bold">★ ${drama.rating || '8.5'}</span>
                  <span>•</span>
                  <span class="text-sky-400">${isKdrama ? 'K-Drama' : 'C-Drama'}</span>
                </p>
              </div>
            </div>

            <!-- Desktop Badges -->
            <div class="hidden sm:flex items-center gap-2 flex-wrap">
              <span class="rounded-full bg-white text-black px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-wider shadow-md">
                #${idx + 1} TODAY
              </span>
              <span class="rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-white">
                ${isKdrama ? '🇰🇷 K-Drama' : '🇨🇳 C-Drama'}
              </span>
              <span class="rounded-full border border-amber-500/30 bg-amber-500/15 px-2.5 py-0.5 text-xs font-bold text-amber-300">
                🎙️ தமிழ் Dub
              </span>
              <span class="rounded-full border border-white/10 bg-black/60 px-2 py-0.5 text-xs font-extrabold text-amber-300">
                ★ ${drama.rating || '8.5'}
              </span>
            </div>

            <!-- Desktop Title -->
            <h1 class="hidden sm:block font-lufga text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.12] line-clamp-2 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
              ${drama.title}
            </h1>

            <p class="hidden sm:flex text-xs md:text-sm text-neutral-300 font-medium items-center gap-2 flex-wrap drop-shadow-md">
              <span>${drama.year || 2024}</span>
              <span>•</span>
              <span>${drama.episodesCount || 16} Episodes</span>
              <span>•</span>
              <span class="text-sky-400 font-semibold">${drama.network || 'HD 1080p'}</span>
            </p>

            <p class="text-xs sm:text-sm text-neutral-300 line-clamp-2 leading-relaxed max-w-xl drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
              ${drama.synopsis}
            </p>

            <!-- Buttons -->
            <div class="flex items-center gap-2.5 pt-1.5 flex-wrap">
              <button class="btn-hero-watch flex h-10 sm:h-12 items-center justify-center gap-2 rounded-full btn-telegram px-5 sm:px-8 text-xs sm:text-sm font-bold shadow-xl active:scale-95 cursor-pointer" data-id="${drama.id}">
                <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.19-.08-.05-.19-.02-.27 0-.12.03-1.99 1.27-5.63 3.73-.53.36-1.02.54-1.45.53-.48-.01-1.4-.27-2.09-.49-.84-.27-1.51-.42-1.45-.88.03-.24.37-.49 1.02-.75 3.99-1.74 6.66-2.89 8.01-3.45 3.81-1.6 4.6-1.88 5.12-1.89.11 0 .37.03.54.17.14.12.18.28.2.45-.02.09-.02.24-.04.4z"/></svg>
                <span>Download Files</span>
              </button>
              <button class="btn-hero-info flex h-10 sm:h-12 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 px-4 sm:px-6 text-xs sm:text-sm font-semibold text-white backdrop-blur-md transition-colors cursor-pointer" data-id="${drama.id}">
                <span>View Details</span>
              </button>
            </div>
          </div>
        </div>
      `;
      heroSliderContainer.appendChild(slide);

      // Dot Indicator (Modern elongated pill)
      if (heroIndicators) {
        const dot = document.createElement("button");
        dot.className = `transition-all duration-300 cursor-pointer ${idx === 0 ? "bg-amber-400 w-8 h-1.5 rounded-full" : "bg-white/30 hover:bg-white/60 w-2 h-1.5 rounded-full"}`;
        dot.setAttribute("aria-label", `Slide ${idx + 1}`);
        dot.addEventListener("click", () => goToSlide(idx));
        heroIndicators.appendChild(dot);
      }
    });

    // Mobile Touch Swipe Gesture Support
    let touchStartX = 0;
    let touchEndX = 0;

    heroSliderContainer.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    heroSliderContainer.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchEndX - touchStartX;
      if (Math.abs(diff) > 40) {
        if (diff < 0) nextSlide();
        else prevSlide();
        resetHeroTimer();
      }
    }, { passive: true });

    // Button event listeners
    heroSliderContainer.querySelectorAll(".btn-hero-watch").forEach(btn => {
      btn.addEventListener("click", () => {
        const d = dramas.find(x => x.id === btn.dataset.id);
        if (d) window.detailView.open(d, true, false);
      });
    });

    heroSliderContainer.querySelectorAll(".btn-hero-info").forEach(btn => {
      btn.addEventListener("click", () => {
        const d = dramas.find(x => x.id === btn.dataset.id);
        if (d) window.detailView.open(d, false, false);
      });
    });

    if (heroPrevBtn) heroPrevBtn.addEventListener("click", () => { prevSlide(); resetHeroTimer(); });
    if (heroNextBtn) heroNextBtn.addEventListener("click", () => { nextSlide(); resetHeroTimer(); });

    startHeroTimer();
  }

  function goToSlide(index) {
    if (heroSlides.length === 0) return;
    const slides = heroSliderContainer.querySelectorAll(".hero-slide");
    const dots = heroIndicators ? heroIndicators.querySelectorAll("button") : [];

    currentSlideIndex = (index + heroSlides.length) % heroSlides.length;

    slides.forEach((s, idx) => {
      if (idx === currentSlideIndex) {
        s.classList.remove("opacity-0", "pointer-events-none", "z-0");
        s.classList.add("opacity-100", "z-10");
      } else {
        s.classList.remove("opacity-100", "z-10");
        s.classList.add("opacity-0", "pointer-events-none", "z-0");
      }
    });

    dots.forEach((d, idx) => {
      d.className = idx === currentSlideIndex ? "bg-amber-400 w-8 h-1.5 rounded-full transition-all cursor-pointer" : "bg-white/30 hover:bg-white/60 w-2.5 h-1.5 rounded-full transition-all cursor-pointer";
    });
  }

  function nextSlide() { goToSlide(currentSlideIndex + 1); }
  function prevSlide() { goToSlide(currentSlideIndex - 1); }
  function startHeroTimer() { clearInterval(heroTimer); heroTimer = setInterval(nextSlide, 5000); }
  function resetHeroTimer() { clearInterval(heroTimer); startHeroTimer(); }

  // Watchlist Local Storage & Global Toast Helpers
  function isSavedInWatchlist(id) {
    try {
      const list = JSON.parse(localStorage.getItem("dramafy_watchlist") || "[]");
      return list.includes(id);
    } catch {
      return false;
    }
  }

  function toggleWatchlistGlobal(dramaId) {
    try {
      let list = JSON.parse(localStorage.getItem("dramafy_watchlist") || "[]");
      let added = false;
      if (list.includes(dramaId)) {
        list = list.filter(id => id !== dramaId);
      } else {
        list.push(dramaId);
        added = true;
      }
      localStorage.setItem("dramafy_watchlist", JSON.stringify(list));
      return added;
    } catch {
      return false;
    }
  }

  function showToast(message) {
    let toast = document.getElementById("app-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "app-toast";
      toast.className = "fixed bottom-20 left-1/2 -translate-x-1/2 z-50 rounded-full bg-white text-black px-5 py-2.5 text-xs font-bold shadow-2xl transition-all duration-300 pointer-events-none opacity-0 translate-y-3 flex items-center gap-2";
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<span>★</span> <span>${message}</span>`;
    toast.classList.remove("opacity-0", "translate-y-3");
    toast.classList.add("opacity-100", "translate-y-0");
    if (window._toastTimeout) clearTimeout(window._toastTimeout);
    window._toastTimeout = setTimeout(() => {
      toast.classList.remove("opacity-100", "translate-y-0");
      toast.classList.add("opacity-0", "translate-y-3");
    }, 2200);
  }

  // 3. PhonoFilm Poster Card Factory (Exact phonofilm.cc UI)
  function createPhonoCard(drama, isGrid = false) {
    const card = document.createElement("div");
    card.className = `phono-card group relative flex flex-col ${isGrid ? 'w-full' : 'w-[130px] sm:w-36 md:w-40 lg:w-44 xl:w-48 shrink-0 snap-start'} cursor-pointer select-none`;

    const rating = drama.rating || 8.5;
    const year = drama.year || 2024;
    const isKdrama = drama.type === 'kdrama';
    const isSaved = isSavedInWatchlist(drama.id);

    card.innerHTML = `
      <div class="md:drop-shadow-[3.11px_3.11px_8.55px_#00000040]">
        <div class="poster-mask relative aspect-[210/308] w-full overflow-hidden rounded-2xl bg-[#161513] border border-[#2e2a26] hover:border-amber-400/50 transition-colors">
          <img src="${drama.poster}" alt="${drama.title}" class="poster-img h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='https://static.tvmaze.com/uploads/images/original_untouched/576/1440521.jpg';">
          <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-25 pointer-events-none"></div>

          <!-- Badges on top left -->
          <div class="absolute top-1.5 left-1.5 z-10 flex flex-col gap-1 items-start">
            <span class="rounded-md px-1.5 py-0.5 text-[9px] font-extrabold uppercase ${
              isKdrama ? 'bg-indigo-600/90 text-white' : 'bg-amber-600/90 text-white'
            }">
              ${isKdrama ? '🇰🇷 K-Drama' : '🇨🇳 C-Drama'}
            </span>
            <span class="rounded-md px-1.5 py-0.5 text-[9px] font-bold bg-[#e8a13a] text-black">
              🎙️ தமிழ்
            </span>
          </div>

          <!-- Quick Actions on top right -->
          <div class="absolute top-1.5 right-1.5 z-10 flex flex-col gap-1.5 opacity-90 group-hover:opacity-100">
            <!-- Bookmark Button -->
            <button aria-label="Save to watchlist" class="btn-card-quick-watchlist flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-black/70 ${isSaved ? 'text-amber-400 border-amber-400' : 'text-white hover:text-amber-400 hover:border-amber-400'} transition-all shadow-md active:scale-90" title="${isSaved ? 'Remove from Watchlist' : 'Save to Watchlist'}">
              <svg class="w-3.5 h-3.5 ${isSaved ? 'fill-amber-400 text-amber-400' : 'fill-none stroke-current'}" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
              </svg>
            </button>

            <!-- Direct Telegram Download Button -->
            <button aria-label="Quick download" class="btn-card-quick-open flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-black/70 text-white hover:border-[#e8a13a] hover:bg-[#e8a13a] hover:text-black transition-all shadow-md active:scale-90" title="Direct Telegram Links">
              <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.19-.08-.05-.19-.02-.27 0-.12.03-1.99 1.27-5.63 3.73-.53.36-1.02.54-1.45.53-.48-.01-1.4-.27-2.09-.49-.84-.27-1.51-.42-1.45-.88.03-.24.37-.49 1.02-.75 3.99-1.74 6.66-2.89 8.01-3.45 3.81-1.6 4.6-1.88 5.12-1.89.11 0 .37.03.54.17.14.12.18.28.2.45-.02.09-.02.24-.04.4z"/></svg>
            </button>
          </div>
        </div>
      </div>

      <h3 class="mt-1.5 line-clamp-1 px-0.5 text-xs sm:text-sm font-semibold text-[#f5f2ea] group-hover:text-[#e8a13a] transition-colors" title="${drama.title}">
        ${drama.title}
      </h3>
      <div class="mt-1 flex items-center gap-1.5 px-0.5 text-[10px] sm:text-[11px] font-medium text-[#b8afa4]">
        <span class="flex items-center gap-0.5 rounded-full border border-[#2e2a26] bg-[#161513] px-1.5 py-0.5 text-amber-300 font-bold">
          ★ ${rating}
        </span>
        <span class="rounded-full border border-[#2e2a26] bg-[#161513] px-1.5 py-0.5">
          ${year}
        </span>
        <span class="rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-400 px-1.5 py-0.5 font-bold">
          Tamil
        </span>
      </div>
    `;

    // Click handlers
    card.addEventListener("click", () => {
      window.detailView.open(drama);
    });

    card.querySelector(".btn-card-quick-open")?.addEventListener("click", (e) => {
      e.stopPropagation();
      window.detailView.open(drama, true, false);
    });

    card.querySelector(".btn-card-quick-watchlist")?.addEventListener("click", (e) => {
      e.stopPropagation();
      const saved = toggleWatchlistGlobal(drama.id);
      showToast(saved ? `Saved "${drama.title}" to Watchlist!` : `Removed "${drama.title}" from Watchlist`);

      // Update button visual
      const btn = card.querySelector(".btn-card-quick-watchlist");
      if (btn) {
        btn.title = saved ? "Remove from Watchlist" : "Save to Watchlist";
        btn.classList.toggle("text-amber-400", saved);
        btn.classList.toggle("border-amber-400", saved);
        btn.classList.toggle("text-white", !saved);
        const svg = btn.querySelector("svg");
        if (svg) {
          svg.setAttribute("class", `w-3.5 h-3.5 ${saved ? 'fill-amber-400 text-amber-400' : 'fill-none stroke-current'}`);
        }
      }

      // If dedicated Watchlist view is currently open, refresh it
      if (watchlistPageView && !watchlistPageView.classList.contains("hidden")) {
        renderWatchlistGrid();
      }
    });

    return card;
  }

  function renderRow(containerId, list) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = "";
    list.forEach(drama => el.appendChild(createPhonoCard(drama, false)));
  }

  function setupCarouselScrollButtons() {
    document.querySelectorAll(".carousel-container").forEach(wrapper => {
      const scrollEl = wrapper.querySelector(".carousel-scroll");
      const leftBtn = wrapper.querySelector(".btn-scroll-left");
      const rightBtn = wrapper.querySelector(".btn-scroll-right");

      if (scrollEl && leftBtn && rightBtn) {
        leftBtn.addEventListener("click", () => scrollEl.scrollBy({ left: -500, behavior: "smooth" }));
        rightBtn.addEventListener("click", () => scrollEl.scrollBy({ left: 500, behavior: "smooth" }));
      }
    });
  }

  function setupCategoryRows() {
    // 1. Trending Now (top rated)
    const trending = [...dramas].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 16);
    renderRow("row-trending", trending);

    // 2. K-Dramas (Tamil Dub)
    const kdramas = dramas.filter(d => d.type === 'kdrama').slice(0, 16);
    renderRow("row-kdramas", kdramas);

    // 3. C-Dramas (Tamil Dub)
    const cdramas = dramas.filter(d => d.type === 'cdrama').slice(0, 16);
    renderRow("row-cdramas", cdramas);

    // 4. Romance Hits
    const romance = dramas.filter(d => (d.genres || []).includes("Romance")).slice(0, 16);
    renderRow("row-romance", romance.length > 0 ? romance : dramas.slice(12, 28));

    // 5. Action & Fantasy Hits
    const action = dramas.filter(d => (d.genres || []).some(g => ["Action", "Fantasy", "Wuxia", "Mystery", "Thriller"].includes(g))).slice(0, 16);
    renderRow("row-action", action.length > 0 ? action : dramas.slice(25, 41));

    setupCarouselScrollButtons();
  }

  // 4. Main Catalog Grid & Filtering
  function renderGrid() {
    if (!dramaGrid) return;

    let filtered = dramas.filter(d => {
      if (currentFilter === "kdrama" && d.type !== "kdrama") return false;
      if (currentFilter === "cdrama" && d.type !== "cdrama") return false;
      if (currentFilter === "romance" && !(d.genres || []).includes("Romance")) return false;
      if (currentFilter === "action" && !(d.genres || []).some(g => ["Action", "Wuxia", "Fantasy", "Mystery", "Thriller"].includes(g))) return false;
      if (currentFilter === "watchlist") {
        const watchlist = JSON.parse(localStorage.getItem("dramafy_watchlist") || "[]");
        if (!watchlist.includes(d.id)) return false;
      }
      if (onlyTamilDubbed && !d.tamilDubbed) return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const mTitle = (d.title || "").toLowerCase().includes(q);
        const mNative = (d.nativeTitle || "").toLowerCase().includes(q);
        const mCast = (d.cast || []).some(c => c.toLowerCase().includes(q));
        const mGenre = (d.genres || []).some(g => g.toLowerCase().includes(q));
        const mSynopsis = (d.synopsis || "").toLowerCase().includes(q);
        if (!mTitle && !mNative && !mCast && !mGenre && !mSynopsis) return false;
      }
      return true;
    });

    // Sorting
    if (sortBy === "rating") {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === "year") {
      filtered.sort((a, b) => (b.year || 0) - (a.year || 0));
    } else if (sortBy === "title") {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    }

    if (filtered.length === 0) {
      dramaGrid.innerHTML = `
        <div class="col-span-full py-16 text-center">
          <div class="inline-flex p-4 rounded-full bg-[#161513] border border-[#2e2a26] mb-4 text-3xl">🔍</div>
          <h3 class="text-xl font-bold text-white mb-2">No dramas found</h3>
          <p class="text-sm text-neutral-400 max-w-md mx-auto">Try clearing your search query or switching category filters to discover more series.</p>
          <button id="btn-reset-filters" class="mt-4 px-5 py-2 rounded-full bg-white text-black text-xs font-bold shadow-lg">Reset Search & Filters</button>
        </div>
      `;
      document.getElementById("btn-reset-filters")?.addEventListener("click", () => {
        clearSearch();
        currentFilter = "all";
        categoryPills.forEach(p => p.classList.toggle("pill-btn-active", p.dataset.filter === "all"));
        renderGrid();
      });
      return;
    }

    dramaGrid.innerHTML = "";

    // Progressive Batch Rendering for Instant Paint & 60fps Scrolling
    const BATCH_SIZE = 24;
    let renderedCount = 0;

    if (window._gridObserver) {
      window._gridObserver.disconnect();
    }

    const sentinel = document.createElement("div");
    sentinel.id = "grid-sentinel";
    sentinel.className = "col-span-full h-8 w-full";

    window._gridObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && renderedCount < filtered.length) {
        renderNextBatch();
      }
    }, { rootMargin: "350px" });

    function renderNextBatch() {
      const fragment = document.createDocumentFragment();
      const nextBatch = filtered.slice(renderedCount, renderedCount + BATCH_SIZE);
      nextBatch.forEach(drama => fragment.appendChild(createPhonoCard(drama, true)));
      
      if (sentinel.parentNode) sentinel.remove();
      dramaGrid.appendChild(fragment);
      renderedCount += nextBatch.length;

      if (renderedCount < filtered.length) {
        dramaGrid.appendChild(sentinel);
        window._gridObserver.observe(sentinel);
      } else {
        window._gridObserver.disconnect();
      }
    }

    renderNextBatch();
  }

  // 5. Search Engine & Autocomplete System (Desktop + Mobile)
  let searchTimeout = null;

  function renderSearchAutocomplete(query, containerEl) {
    if (!containerEl) return;
    if (!query || query.length === 0) {
      containerEl.classList.add("hidden");
      containerEl.innerHTML = "";
      return;
    }

    const q = query.toLowerCase();
    const matches = dramas.filter(d => {
      const mTitle = (d.title || "").toLowerCase().includes(q);
      const mNative = (d.nativeTitle || "").toLowerCase().includes(q);
      const mCast = (d.cast || []).some(c => c.toLowerCase().includes(q));
      const mGenre = (d.genres || []).some(g => g.toLowerCase().includes(q));
      return mTitle || mNative || mCast || mGenre;
    }).slice(0, 8);

    if (matches.length === 0) {
      containerEl.innerHTML = `
        <div class="p-4 text-center text-xs text-neutral-400">
          No dramas found for "${query}"
        </div>
      `;
      containerEl.classList.remove("hidden");
      return;
    }

    containerEl.innerHTML = `
      <div class="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#b8afa4] border-b border-[#2e2a26] flex items-center justify-between">
        <span>Matching Tamil Dubbed Titles (${matches.length})</span>
        <span class="text-[9px] text-[#e8a13a]">Click to open</span>
      </div>
      <div class="divide-y divide-white/5 py-1">
        ${matches.map(m => `
          <div class="search-dropdown-item group/item" data-id="${m.id}">
            <img src="${m.poster}" alt="${m.title}" class="w-10 h-14 object-cover rounded-lg shrink-0 border border-[#2e2a26]">
            <div class="min-w-0 flex-1">
              <h4 class="text-xs sm:text-sm font-semibold text-white group-hover/item:text-[#e8a13a] truncate transition-colors">
                ${m.title}
              </h4>
              <p class="text-[11px] text-[#b8afa4] truncate font-mono mt-0.5">
                ${m.year || 2024} • ${m.type === 'kdrama' ? '🇰🇷 K-Drama' : '🇨🇳 C-Drama'} • ${(m.genres || []).slice(0, 2).join(', ')}
              </p>
              <div class="flex items-center gap-2 mt-1">
                <span class="text-[10px] font-bold text-amber-300">★ ${m.rating || 8.5}</span>
                <span class="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-[#e8a13a]/20 text-[#e8a13a]">🎙️ தமிழ் Dub</span>
                <span class="text-[9px] text-sky-400">📁 ${(m.downloadLinks || []).length} Telegram links</span>
              </div>
            </div>
            <div class="shrink-0 text-neutral-400 group-hover/item:text-white pr-1">
              →
            </div>
          </div>
        `).join('')}
      </div>
      <div class="p-2 border-t border-[#2e2a26] text-center">
        <button class="btn-see-all-results text-xs text-[#e8a13a] hover:underline font-semibold py-1">
          View all results in catalog (${matches.length}+) →
        </button>
      </div>
    `;

    containerEl.querySelectorAll(".search-dropdown-item").forEach(item => {
      item.addEventListener("click", () => {
        const d = dramas.find(x => x.id === item.dataset.id);
        if (d) {
          hideDropdowns();
          window.detailView.open(d);
        }
      });
    });

    containerEl.querySelector(".btn-see-all-results")?.addEventListener("click", () => {
      hideDropdowns();
      document.getElementById("catalog-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    containerEl.classList.remove("hidden");
  }

  function hideDropdowns() {
    if (searchDropdownDesktop) searchDropdownDesktop.classList.add("hidden");
    if (searchDropdownMobile) searchDropdownMobile.classList.add("hidden");
  }

  function clearSearch() {
    searchQuery = "";
    if (searchInput) searchInput.value = "";
    if (searchInputMobile) searchInputMobile.value = "";
    if (btnSearchClear) btnSearchClear.classList.add("hidden");
    if (btnSearchClearMobile) btnSearchClearMobile.classList.add("hidden");
    hideDropdowns();
    renderGrid();
  }

  function handleSearchInput(val, source) {
    const trimmed = val.trim();
    searchQuery = trimmed;

    // Synchronize desktop & mobile inputs
    if (source === "desktop" && searchInputMobile) searchInputMobile.value = val;
    if (source === "mobile" && searchInput) searchInput.value = val;

    // Toggle clear button
    if (btnSearchClear) btnSearchClear.classList.toggle("hidden", trimmed.length === 0);
    if (btnSearchClearMobile) btnSearchClearMobile.classList.toggle("hidden", trimmed.length === 0);

    // If detail view is open, automatically close it so user sees search results!
    if (trimmed.length > 0 && window.location.hash.startsWith("#/drama/")) {
      window.detailView.close(false);
    }

    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      renderGrid();

      // Autocomplete popup
      if (source === "desktop") {
        renderSearchAutocomplete(trimmed, searchDropdownDesktop);
      } else {
        renderSearchAutocomplete(trimmed, searchDropdownMobile);
      }
    }, 150);
  }

  // Input Listeners
  if (searchInput) {
    searchInput.addEventListener("input", e => handleSearchInput(e.target.value, "desktop"));
    searchInput.addEventListener("focus", e => {
      if (e.target.value.trim().length > 0) {
        renderSearchAutocomplete(e.target.value.trim(), searchDropdownDesktop);
      }
    });
    searchInput.addEventListener("keydown", e => {
      if (e.key === "Enter") {
        hideDropdowns();
        document.getElementById("catalog-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (e.key === "Escape") {
        hideDropdowns();
      }
    });
  }

  if (searchInputMobile) {
    searchInputMobile.addEventListener("input", e => handleSearchInput(e.target.value, "mobile"));
    searchInputMobile.addEventListener("focus", e => {
      if (e.target.value.trim().length > 0) {
        renderSearchAutocomplete(e.target.value.trim(), searchDropdownMobile);
      }
    });
    searchInputMobile.addEventListener("keydown", e => {
      if (e.key === "Enter") {
        hideDropdowns();
        document.getElementById("catalog-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (e.key === "Escape") {
        hideDropdowns();
      }
    });
  }

  if (btnSearchClear) btnSearchClear.addEventListener("click", clearSearch);
  if (btnSearchClearMobile) btnSearchClearMobile.addEventListener("click", clearSearch);

  // Close search dropdowns when clicking outside
  document.addEventListener("click", e => {
    if (!e || !e.target || typeof e.target.closest !== "function") return;
    if (!e.target.closest("#search-input") && !e.target.closest("#search-dropdown-desktop")) {
      if (searchDropdownDesktop) searchDropdownDesktop.classList.add("hidden");
    }
    if (!e.target.closest("#search-input-mobile") && !e.target.closest("#search-dropdown-mobile")) {
      if (searchDropdownMobile) searchDropdownMobile.classList.add("hidden");
    }
  });

  // View Controllers: Home vs Dedicated Separate Watchlist View
  function showHomeView() {
    if (window.detailView) window.detailView.close(false);
    if (watchlistPageView) watchlistPageView.classList.add("hidden");
    if (contentPageView) contentPageView.classList.add("hidden");
    if (homePageView) homePageView.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Update bottom nav active state
    mobileNavBtns.forEach(b => {
      const isHome = b.dataset.filter === "home";
      b.classList.toggle("text-white", isHome);
      b.classList.toggle("text-neutral-400", !isHome);
      const icon = b.querySelector("svg");
      if (icon) {
        icon.classList.toggle("text-amber-400", isHome);
      }
    });

    categoryPills.forEach(p => p.classList.toggle("pill-btn-active", p.dataset.filter === "all"));
    currentFilter = "all";
    renderGrid();
  }

  function showWatchlistView() {
    if (window.detailView) window.detailView.close(false);
    if (homePageView) homePageView.classList.add("hidden");
    if (contentPageView) contentPageView.classList.add("hidden");
    if (watchlistPageView) watchlistPageView.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Update bottom nav active state
    mobileNavBtns.forEach(b => {
      const isWatchlist = b.dataset.filter === "watchlist";
      b.classList.toggle("text-white", isWatchlist);
      b.classList.toggle("text-neutral-400", !isWatchlist);
      const icon = b.querySelector("svg");
      if (icon) {
        icon.classList.toggle("text-amber-400", isWatchlist);
      }
    });

    // Update category pills
    categoryPills.forEach(p => p.classList.toggle("pill-btn-active", p.dataset.filter === "watchlist"));

    renderWatchlistGrid();
  }

  function renderWatchlistGrid() {
    if (!watchlistGrid) return;
    let list = [];
    try {
      list = JSON.parse(localStorage.getItem("dramafy_watchlist") || "[]");
    } catch {
      list = [];
    }
    const savedDramas = dramas.filter(d => list.includes(d.id));

    if (watchlistBadgeCount) {
      watchlistBadgeCount.textContent = `${savedDramas.length} Series`;
    }

    if (btnClearWatchlist) {
      if (savedDramas.length > 0) {
        btnClearWatchlist.classList.remove("hidden");
      } else {
        btnClearWatchlist.classList.add("hidden");
      }
    }

    if (savedDramas.length === 0) {
      watchlistGrid.innerHTML = "";
      watchlistGrid.classList.add("hidden");
      if (watchlistEmptyState) watchlistEmptyState.classList.remove("hidden");
      return;
    }

    if (watchlistEmptyState) watchlistEmptyState.classList.add("hidden");
    watchlistGrid.classList.remove("hidden");
    watchlistGrid.innerHTML = "";

    savedDramas.forEach(drama => {
      watchlistGrid.appendChild(createPhonoCard(drama, true));
    });
  }

  // Clear All Watchlist
  btnClearWatchlist?.addEventListener("click", () => {
    if (confirm("Are you sure you want to remove all dramas from your watchlist?")) {
      localStorage.setItem("dramafy_watchlist", "[]");
      renderWatchlistGrid();
      showToast("Watchlist cleared");
    }
  });

  // Back to home buttons in watchlist view
  document.querySelectorAll(".btn-watchlist-back-to-home").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      showHomeView();
    });
  });

  // Top header logo returns to home
  document.querySelectorAll(".btn-back-to-home").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      showHomeView();
    });
  });

  // Header and other buttons with data-filter="watchlist"
  document.querySelectorAll('button[data-filter="watchlist"]').forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      showWatchlistView();
    });
  });

  // Category Pills
  categoryPills.forEach(pill => {
    pill.addEventListener("click", () => {
      const f = pill.dataset.filter;
      if (f === "watchlist") {
        showWatchlistView();
        return;
      }
      showHomeView();
      categoryPills.forEach(p => p.classList.remove("pill-btn-active"));
      pill.classList.add("pill-btn-active");
      currentFilter = f;
      renderGrid();
      document.getElementById("catalog-section")?.scrollIntoView({ behavior: "smooth" });
    });
  });

  // Mobile Bottom Nav handlers
  const mobileNavBtns = document.querySelectorAll(".mobile-nav-btn");
  mobileNavBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const f = btn.dataset.filter;
      if (f === "home") {
        showHomeView();
      } else if (f === "watchlist") {
        showWatchlistView();
      } else if (f === "kdrama" || f === "cdrama") {
        showHomeView();
        currentFilter = f;
        categoryPills.forEach(p => p.classList.toggle("pill-btn-active", p.dataset.filter === f));
        renderGrid();
        document.getElementById("catalog-section")?.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  // Expose global methods
  window.showWatchlistView = showWatchlistView;
  window.showHomeView = showHomeView;
  window.renderWatchlistGrid = renderWatchlistGrid;

  // Sort dropdown
  if (sortSelect) {
    sortSelect.addEventListener("change", e => {
      sortBy = e.target.value;
      renderGrid();
    });
  }

  // Boot Application
  updateMetrics();
  setupHeroSlider();
  setupCategoryRows();
  renderGrid();
});
