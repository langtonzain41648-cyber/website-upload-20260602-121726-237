const rootPrefix = document.body.dataset.rootPrefix || "";
const searchIndex = Array.isArray(window.SEARCH_INDEX) ? window.SEARCH_INDEX : [];

function normalizeText(value) {
    return String(value || "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();
}

function joinUrl(prefix, url) {
    if (/^https?:\/\//i.test(url)) {
        return url;
    }
    return `${prefix}${url}`;
}

function setupMobileNavigation() {
    const button = document.querySelector(".js-mobile-menu");
    const nav = document.querySelector(".js-mobile-nav");

    if (!button || !nav) {
        return;
    }

    button.addEventListener("click", () => {
        const isOpen = button.getAttribute("aria-expanded") === "true";
        button.setAttribute("aria-expanded", String(!isOpen));
        nav.hidden = isOpen;
    });
}

function setupHeroCarousel() {
    const hero = document.querySelector(".js-hero");

    if (!hero) {
        return;
    }

    const slides = Array.from(hero.querySelectorAll(".hero-slide"));
    const dots = Array.from(hero.querySelectorAll(".hero-dot"));
    const prev = hero.querySelector(".hero-prev");
    const next = hero.querySelector(".hero-next");
    let current = 0;
    let timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        current = (index + slides.length) % slides.length;

        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle("is-active", slideIndex === current);
        });

        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle("is-active", dotIndex === current);
        });
    }

    function startTimer() {
        stopTimer();
        timer = window.setInterval(() => showSlide(current + 1), 5000);
    }

    function stopTimer() {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
    }

    dots.forEach((dot) => {
        dot.addEventListener("click", () => {
            showSlide(Number(dot.dataset.slide || 0));
            startTimer();
        });
    });

    if (prev) {
        prev.addEventListener("click", () => {
            showSlide(current - 1);
            startTimer();
        });
    }

    if (next) {
        next.addEventListener("click", () => {
            showSlide(current + 1);
            startTimer();
        });
    }

    hero.addEventListener("mouseenter", stopTimer);
    hero.addEventListener("mouseleave", startTimer);
    showSlide(0);
    startTimer();
}

function setupGlobalSearch() {
    const input = document.querySelector(".js-global-search");
    const panel = document.querySelector(".js-search-results");

    if (!input || !panel || !searchIndex.length) {
        return;
    }

    function renderResults(query) {
        const normalizedQuery = normalizeText(query);

        if (!normalizedQuery) {
            panel.hidden = true;
            panel.innerHTML = "";
            return;
        }

        const matches = searchIndex
            .filter((item) => normalizeText(`${item.title} ${item.year} ${item.region} ${item.type} ${item.genre} ${item.category}`).includes(normalizedQuery))
            .slice(0, 12);

        if (!matches.length) {
            panel.hidden = false;
            panel.innerHTML = `<div class="search-result-item"><strong>没有找到匹配影片</strong><small>换一个关键词试试</small></div>`;
            return;
        }

        panel.hidden = false;
        panel.innerHTML = matches
            .map((item) => {
                const href = joinUrl(rootPrefix, item.url);
                const title = escapeHtml(item.title);
                const meta = escapeHtml(`${item.region} · ${item.year} · ${item.genre}`);
                return `<a class="search-result-item" href="${href}"><strong>${title}</strong><small>${meta}</small></a>`;
            })
            .join("");
    }

    input.addEventListener("input", () => renderResults(input.value));

    document.addEventListener("click", (event) => {
        if (!panel.contains(event.target) && event.target !== input) {
            panel.hidden = true;
        }
    });
}

function setupPageFilters() {
    const searchInputs = Array.from(document.querySelectorAll(".js-page-search"));
    const selects = Array.from(document.querySelectorAll(".js-filter-select"));
    const lists = Array.from(document.querySelectorAll(".js-filter-list"));
    const emptyState = document.querySelector(".js-empty-state");

    if (!lists.length || (!searchInputs.length && !selects.length)) {
        return;
    }

    function getFilterValue(name) {
        const select = selects.find((item) => item.dataset.filter === name);
        return normalizeText(select ? select.value : "");
    }

    function applyFilters() {
        const query = normalizeText(searchInputs.map((input) => input.value).join(" "));
        const year = getFilterValue("year");
        const type = getFilterValue("type");
        const region = getFilterValue("region");
        let visibleCount = 0;

        lists.forEach((list) => {
            const cards = Array.from(list.querySelectorAll("[data-title]"));

            cards.forEach((card) => {
                const haystack = normalizeText(`${card.dataset.title} ${card.dataset.year} ${card.dataset.type} ${card.dataset.region} ${card.dataset.genre} ${card.dataset.tags}`);
                const matchesQuery = !query || haystack.includes(query);
                const matchesYear = !year || normalizeText(card.dataset.year).includes(year);
                const matchesType = !type || normalizeText(card.dataset.type).includes(type);
                const matchesRegion = !region || normalizeText(card.dataset.region).includes(region);
                const isVisible = matchesQuery && matchesYear && matchesType && matchesRegion;
                card.hidden = !isVisible;

                if (isVisible) {
                    visibleCount += 1;
                }
            });
        });

        if (emptyState) {
            emptyState.hidden = visibleCount !== 0;
        }
    }

    searchInputs.forEach((input) => input.addEventListener("input", applyFilters));
    selects.forEach((select) => select.addEventListener("change", applyFilters));
}

let hlsLoaderPromise = null;

async function loadHlsLibrary() {
    if (window.Hls) {
        return window.Hls;
    }

    if (!hlsLoaderPromise) {
        hlsLoaderPromise = import("./hls-vendor-dru42stk.js")
            .then((module) => module.H)
            .catch(() => new Promise((resolve, reject) => {
                const script = document.createElement("script");
                script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js";
                script.async = true;
                script.onload = () => resolve(window.Hls);
                script.onerror = reject;
                document.head.appendChild(script);
            }));
    }

    return hlsLoaderPromise;
}

function setupPlayers() {
    const players = Array.from(document.querySelectorAll(".player-card"));

    players.forEach((player) => {
        const button = player.querySelector(".js-watch-button");
        const video = player.querySelector("video");
        const message = player.querySelector(".js-player-message");
        const source = player.dataset.stream;
        let hlsInstance = null;

        if (!button || !video || !source) {
            return;
        }

        button.addEventListener("click", async () => {
            button.disabled = true;
            setMessage(message, "正在加载播放源...");

            try {
                if (source.includes(".m3u8")) {
                    if (video.canPlayType("application/vnd.apple.mpegurl")) {
                        video.src = source;
                    } else {
                        const Hls = await loadHlsLibrary();

                        if (!Hls || !Hls.isSupported()) {
                            throw new Error("当前浏览器不支持 HLS 播放。");
                        }

                        if (hlsInstance) {
                            hlsInstance.destroy();
                        }

                        hlsInstance = new Hls({
                            enableWorker: true,
                            lowLatencyMode: true,
                        });

                        await new Promise((resolve, reject) => {
                            const timeoutId = window.setTimeout(resolve, 5000);

                            hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
                                window.clearTimeout(timeoutId);
                                resolve();
                            });

                            hlsInstance.on(Hls.Events.ERROR, (event, data) => {
                                if (data && data.fatal) {
                                    window.clearTimeout(timeoutId);
                                    reject(new Error(data.details || "HLS 播放源加载失败"));
                                }
                            });

                            hlsInstance.loadSource(source);
                            hlsInstance.attachMedia(video);
                        });
                    }
                } else {
                    video.src = source;
                }

                button.classList.add("is-hidden");
                clearMessage(message);
                await video.play();
            } catch (error) {
                button.disabled = false;
                setMessage(message, `播放加载失败：${error.message || "请稍后再试"}`);
            }
        });
    });
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function setMessage(element, text) {
    if (!element) {
        return;
    }

    element.hidden = false;
    element.textContent = text;
}

function clearMessage(element) {
    if (!element) {
        return;
    }

    element.hidden = true;
    element.textContent = "";
}

setupMobileNavigation();
setupHeroCarousel();
setupGlobalSearch();
setupPageFilters();
setupPlayers();
