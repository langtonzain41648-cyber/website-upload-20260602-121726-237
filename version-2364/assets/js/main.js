(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  ready(function () {
    var header = document.querySelector("[data-site-header]");
    var toggle = document.querySelector("[data-menu-toggle]");
    if (header && toggle) {
      toggle.addEventListener("click", function () {
        header.classList.toggle("is-open");
      });
    }

    var slider = document.querySelector("[data-hero-slider]");
    if (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
      var cards = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-card]"));
      var current = 0;

      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
          dot.setAttribute("aria-selected", dotIndex === current ? "true" : "false");
        });
        cards.forEach(function (card, cardIndex) {
          card.classList.toggle("is-current", cardIndex === current);
        });
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          show(dotIndex);
        });
      });
      cards.forEach(function (card, cardIndex) {
        card.addEventListener("mouseenter", function () {
          show(cardIndex);
        });
      });
      show(0);
      window.setInterval(function () {
        show(current + 1);
      }, 5800);
    }

    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
      var search = scope.querySelector("[data-search-input]");
      var year = scope.querySelector("[data-year-filter]");
      var type = scope.querySelector("[data-type-filter]");
      var category = scope.querySelector("[data-category-filter]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .ranking-item"));
      var empty = scope.querySelector("[data-empty-state]");

      function applyFilter() {
        var keyword = normalize(search && search.value);
        var selectedYear = normalize(year && year.value);
        var selectedType = normalize(type && type.value);
        var selectedCategory = normalize(category && category.value);
        var visible = 0;

        cards.forEach(function (card) {
          var text = normalize(card.dataset.title + " " + card.dataset.meta);
          var ok = true;
          if (keyword && text.indexOf(keyword) === -1) {
            ok = false;
          }
          if (selectedYear && normalize(card.dataset.year) !== selectedYear) {
            ok = false;
          }
          if (selectedType && normalize(card.dataset.type) !== selectedType) {
            ok = false;
          }
          if (selectedCategory && normalize(card.dataset.category) !== selectedCategory) {
            ok = false;
          }
          card.style.display = ok ? "" : "none";
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [search, year, type, category].forEach(function (control) {
        if (control) {
          control.addEventListener("input", applyFilter);
          control.addEventListener("change", applyFilter);
        }
      });
    });
  });
})();
