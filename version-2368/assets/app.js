(function () {
    var toggle = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-nav-menu]");

    if (toggle && menu) {
        toggle.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var next = hero.querySelector("[data-hero-next]");
        var prev = hero.querySelector("[data-hero-prev]");
        var index = 0;
        var timer;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function startAuto() {
            clearInterval(timer);
            timer = setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(index + 1);
                startAuto();
            });
        }

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(index - 1);
                startAuto();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
                startAuto();
            });
        });

        startAuto();
    }

    var searchInput = document.querySelector("[data-search-input]");

    if (searchInput) {
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));

        searchInput.addEventListener("input", function () {
            var query = searchInput.value.trim().toLowerCase();

            cards.forEach(function (card) {
                var text = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
                card.classList.toggle("is-filtered-out", query && text.indexOf(query) === -1);
            });
        });
    }
})();
