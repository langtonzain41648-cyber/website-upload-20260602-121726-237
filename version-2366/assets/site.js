(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function setupHeader() {
        var header = document.getElementById('siteHeader');
        var toggle = document.querySelector('[data-menu-toggle]');
        var panel = document.querySelector('[data-mobile-panel]');
        var backTop = document.querySelector('[data-back-top]');

        function updateScrollState() {
            if (header) {
                header.classList.toggle('scrolled', window.scrollY > 20);
            }
            if (backTop) {
                backTop.classList.toggle('visible', window.scrollY > 400);
            }
        }

        if (toggle && panel) {
            toggle.addEventListener('click', function () {
                panel.classList.toggle('open');
            });
        }

        if (backTop) {
            backTop.addEventListener('click', function () {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        updateScrollState();
        window.addEventListener('scroll', updateScrollState, { passive: true });
    }

    function setupImageFallbacks() {
        document.querySelectorAll('img.poster-image').forEach(function (image) {
            image.addEventListener('error', function () {
                image.classList.add('image-missing');
            });
        });
    }

    function setupHeroCarousel() {
        var carousel = document.querySelector('[data-hero-carousel]');
        if (!carousel) {
            return;
        }

        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var buttons = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-target]'));
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            buttons.forEach(function (button, buttonIndex) {
                button.classList.toggle('active', buttonIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                show(Number(button.getAttribute('data-hero-target')) || 0);
                start();
            });
        });

        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupPageFilters() {
        var filterPage = document.querySelector('[data-filter-page]');
        if (!filterPage) {
            return;
        }

        var searchInput = filterPage.querySelector('[data-page-search]');
        var sortSelect = filterPage.querySelector('[data-sort-select]');
        var count = filterPage.querySelector('[data-result-count]');
        var grid = filterPage.querySelector('[data-card-grid]');
        var chips = Array.prototype.slice.call(filterPage.querySelectorAll('[data-filter-tag]'));
        var activeTag = '';

        function applyFilters() {
            var query = normalize(searchInput ? searchInput.value : '');
            var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-tags'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-genre')
                ].join(' '));
                var tagMatch = !activeTag || haystack.indexOf(normalize(activeTag)) !== -1;
                var queryMatch = !query || haystack.indexOf(query) !== -1;
                var shouldShow = tagMatch && queryMatch;
                card.classList.toggle('hidden-by-filter', !shouldShow);
                if (shouldShow) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = '共 ' + visible + ' 部影片';
            }
        }

        function applySort() {
            if (!grid || !sortSelect) {
                return;
            }
            var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
            var mode = sortSelect.value;
            cards.sort(function (a, b) {
                if (mode === 'views-desc') {
                    return Number(b.getAttribute('data-views')) - Number(a.getAttribute('data-views'));
                }
                if (mode === 'title-asc') {
                    return String(a.getAttribute('data-title')).localeCompare(String(b.getAttribute('data-title')), 'zh-CN');
                }
                return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
            });
            cards.forEach(function (card) {
                grid.appendChild(card);
            });
            applyFilters();
        }

        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                activeTag = chip.getAttribute('data-filter-tag') || '';
                chips.forEach(function (item) {
                    item.classList.toggle('active', item === chip);
                });
                applyFilters();
            });
        });

        if (searchInput) {
            searchInput.addEventListener('input', applyFilters);
        }
        if (sortSelect) {
            sortSelect.addEventListener('change', applySort);
        }
        applySort();
    }

    function movieCardTemplate(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return '<span class="tag">' + escapeHtml(tag) + '</span>';
        }).join('');

        return [
            '<article class="movie-card">',
            '    <a href="' + escapeHtml(movie.url) + '" class="movie-card-link">',
            '        <div class="poster-wrap">',
            '            <div class="poster-fallback">' + escapeHtml(String(movie.title || '').slice(0, 2)) + '</div>',
            '            <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" class="poster-image">',
            '            <span class="poster-badge">' + escapeHtml(movie.category) + '</span>',
            '        </div>',
            '        <div class="movie-card-body">',
            '            <h3>' + escapeHtml(movie.title) + '</h3>',
            '            <p class="movie-one-line">' + escapeHtml(movie.oneLine) + '</p>',
            '            <div class="movie-meta-row">',
            '                <span>' + escapeHtml(movie.year) + '</span>',
            '                <span>' + escapeHtml(movie.region) + '</span>',
            '                <span>' + escapeHtml(movie.type) + '</span>',
            '            </div>',
            '            <div class="tag-row">' + tags + '</div>',
            '        </div>',
            '    </a>',
            '</article>'
        ].join('\n');
    }

    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function setupSearchPage() {
        var form = document.querySelector('[data-search-form]');
        var input = document.querySelector('[data-search-input]');
        var results = document.querySelector('[data-search-results]');
        var title = document.querySelector('[data-search-title]');
        var count = document.querySelector('[data-search-count]');
        var data = window.MOVIE_SEARCH_INDEX || [];

        if (!form || !input || !results || !data.length) {
            return;
        }

        function runSearch(query) {
            var normalizedQuery = normalize(query);
            if (!normalizedQuery) {
                title.textContent = '热门推荐';
                count.textContent = '请输入关键词开始搜索';
                return;
            }

            var matched = data.filter(function (movie) {
                var haystack = normalize([
                    movie.title,
                    movie.year,
                    movie.region,
                    movie.type,
                    movie.genre,
                    movie.category,
                    (movie.tags || []).join(' '),
                    movie.oneLine
                ].join(' '));
                return haystack.indexOf(normalizedQuery) !== -1;
            }).slice(0, 80);

            title.textContent = '搜索结果';
            count.textContent = '找到 ' + matched.length + ' 部影片';
            results.innerHTML = matched.length
                ? matched.map(movieCardTemplate).join('\n')
                : '<p class="empty-result">没有找到匹配影片，请尝试其他关键词。</p>';
            setupImageFallbacks();
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var query = input.value;
            var url = new URL(window.location.href);
            url.searchParams.set('q', query);
            window.history.replaceState(null, '', url.toString());
            runSearch(query);
        });

        var initialQuery = new URLSearchParams(window.location.search).get('q') || '';
        if (initialQuery) {
            input.value = initialQuery;
            runSearch(initialQuery);
        }
    }

    function setupPlayers() {
        document.querySelectorAll('[data-player]').forEach(function (player) {
            var video = player.querySelector('video');
            var button = player.querySelector('[data-play-button]');
            var message = player.querySelector('[data-player-message]');
            var source = player.getAttribute('data-src');
            var initialized = false;

            function setMessage(text) {
                if (message) {
                    message.textContent = text;
                }
            }

            function initialize() {
                if (initialized || !video || !source) {
                    return;
                }
                initialized = true;

                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls();
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        setMessage('播放源已加载，可使用播放器控制条观看。');
                        video.play().catch(function () {
                            setMessage('浏览器阻止了自动播放，请再次点击播放按钮。');
                        });
                    });
                    hls.on(window.Hls.Events.ERROR, function () {
                        setMessage('播放源加载异常，请检查网络或播放地址。');
                    });
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    video.addEventListener('loadedmetadata', function () {
                        setMessage('播放源已加载，可使用播放器控制条观看。');
                        video.play().catch(function () {
                            setMessage('浏览器阻止了自动播放，请再次点击播放按钮。');
                        });
                    }, { once: true });
                } else {
                    setMessage('当前浏览器不支持 HLS 播放，请更换浏览器后观看。');
                }
            }

            if (button) {
                button.addEventListener('click', function () {
                    initialize();
                    player.classList.add('playing');
                    if (video) {
                        video.play().catch(function () {
                            setMessage('浏览器阻止了自动播放，请再次点击播放按钮。');
                        });
                    }
                });
            }

            if (video) {
                video.addEventListener('play', function () {
                    player.classList.add('playing');
                });
                video.addEventListener('pause', function () {
                    player.classList.remove('playing');
                });
            }
        });
    }

    ready(function () {
        setupHeader();
        setupImageFallbacks();
        setupHeroCarousel();
        setupPageFilters();
        setupSearchPage();
        setupPlayers();
    });
})();
