(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function setupMenu() {
        var button = qs('.nav-toggle');
        var nav = qs('.mobile-nav');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            var open = nav.classList.toggle('is-open');
            button.setAttribute('aria-expanded', open ? 'true' : 'false');
            button.textContent = open ? '×' : '☰';
        });
    }

    function setupImageFallbacks() {
        qsa('img').forEach(function (img) {
            img.addEventListener('error', function () {
                img.classList.add('is-missing');
            }, { once: true });
        });
    }

    function setupHero() {
        var hero = qs('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = qsa('[data-hero-slide]', hero);
        var dots = qsa('[data-hero-dot]', hero);
        if (slides.length <= 1) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot') || 0));
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        start();
    }

    function setupFilters() {
        var list = qs('[data-filter-list]');
        if (!list) {
            return;
        }
        var cards = qsa('[data-card]', list);
        var searchInput = qs('[data-filter-search]');
        var yearSelect = qs('[data-filter-year]');
        var regionInput = qs('[data-filter-region]');
        var typeInput = qs('[data-filter-type]');
        var categorySelect = qs('[data-filter-category]');
        var result = qs('[data-filter-result]');
        var params = new URLSearchParams(window.location.search);
        var initialQ = params.get('q');

        if (initialQ && searchInput) {
            searchInput.value = initialQ;
        }

        function apply() {
            var q = normalize(searchInput && searchInput.value);
            var minYear = Number(yearSelect && yearSelect.value ? yearSelect.value : 0);
            var region = normalize(regionInput && regionInput.value);
            var type = normalize(typeInput && typeInput.value);
            var category = normalize(categorySelect && categorySelect.value);
            var shown = 0;

            cards.forEach(function (card) {
                var blob = normalize(card.getAttribute('data-keywords'));
                var cardRegion = normalize(card.getAttribute('data-region'));
                var cardType = normalize(card.getAttribute('data-type'));
                var cardCategory = normalize(card.getAttribute('data-category'));
                var cardYear = Number(card.getAttribute('data-year') || 0);
                var ok = true;

                if (q && blob.indexOf(q) === -1) {
                    ok = false;
                }
                if (minYear && cardYear < minYear) {
                    ok = false;
                }
                if (region && cardRegion.indexOf(region) === -1) {
                    ok = false;
                }
                if (type && cardType.indexOf(type) === -1) {
                    ok = false;
                }
                if (category && cardCategory !== category) {
                    ok = false;
                }

                card.classList.toggle('hidden-card', !ok);
                if (ok) {
                    shown += 1;
                }
            });

            if (result) {
                result.textContent = '当前显示 ' + shown + ' / ' + cards.length + ' 部内容';
            }
        }

        [searchInput, yearSelect, regionInput, typeInput, categorySelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
        apply();
    }

    function setupPlayers() {
        qsa('[data-player]').forEach(function (shell) {
            var video = qs('video', shell);
            var button = qs('[data-play]', shell);
            var status = qs('[data-player-status]', shell);
            if (!video || !button) {
                return;
            }

            button.addEventListener('click', function () {
                var source = button.getAttribute('data-src');
                if (!source) {
                    if (status) {
                        status.textContent = '当前影片暂未配置播放源。';
                    }
                    return;
                }

                if (status) {
                    status.textContent = '正在加载播放源...';
                }
                video.controls = true;

                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        shell.classList.add('is-playing');
                        video.play().catch(function () {
                            if (status) {
                                status.textContent = '浏览器阻止了自动播放，请再次点击视频播放。';
                            }
                        });
                    });
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (status && data && data.fatal) {
                            status.textContent = '播放源加载失败，请稍后重试。';
                        }
                    });
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    video.addEventListener('loadedmetadata', function () {
                        shell.classList.add('is-playing');
                        video.play().catch(function () {
                            if (status) {
                                status.textContent = '浏览器阻止了自动播放，请再次点击视频播放。';
                            }
                        });
                    }, { once: true });
                } else if (status) {
                    status.textContent = '当前浏览器需要支持 HLS 的播放环境。';
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupImageFallbacks();
        setupHero();
        setupFilters();
        setupPlayers();
    });
})();
