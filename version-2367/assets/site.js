(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      toggle.classList.toggle("is-open");
      panel.classList.toggle("is-open");
    });
  }

  function initHero() {
    var carousel = document.querySelector("[data-hero-carousel]");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    var index = 0;
    var timer = null;

    function show(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
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
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });
    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initLocalFilter() {
    var form = document.querySelector("[data-local-filter-form]");
    if (!form) {
      return;
    }
    var input = form.querySelector("[data-filter-input]");
    var typeSelect = form.querySelector("[data-filter-type]");
    var yearSelect = form.querySelector("[data-filter-year]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    var empty = document.querySelector("[data-empty-state]");

    function apply() {
      var query = normalize(input && input.value);
      var typeValue = typeSelect ? typeSelect.value : "";
      var yearValue = yearSelect ? yearSelect.value : "";
      var visible = 0;
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-search-text"));
        var cardType = card.getAttribute("data-type") || "";
        var cardYear = card.getAttribute("data-year") || "";
        var matched = true;
        if (query && text.indexOf(query) === -1) {
          matched = false;
        }
        if (typeValue && cardType !== typeValue) {
          matched = false;
        }
        if (yearValue && cardYear !== yearValue) {
          matched = false;
        }
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      apply();
    });
    [input, typeSelect, yearSelect].forEach(function (field) {
      if (field) {
        field.addEventListener("input", apply);
        field.addEventListener("change", apply);
      }
    });
    apply();
  }

  function renderSearchCard(movie) {
    var tags = (movie.tags || []).slice(0, 4).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return [
      "<article class="movie-card">",
      "<a class="card-cover" href="" + escapeHtml(movie.url) + "" aria-label="" + escapeHtml(movie.title) + "">",
      "<img src="" + escapeHtml(movie.cover) + "" alt="" + escapeHtml(movie.title) + "" loading="lazy">",
      "<span class="card-badge">" + escapeHtml(movie.type) + "</span>",
      "<span class="card-play">▶</span>",
      "</a>",
      "<div class="card-body">",
      "<div class="card-meta"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.score) + "</span></div>",
      "<h3><a href="" + escapeHtml(movie.url) + "">" + escapeHtml(movie.title) + "</a></h3>",
      "<p>" + escapeHtml(movie.oneLine) + "</p>",
      "<div class="card-tags">" + tags + "</div>",
      "</div>",
      "</article>"
    ].join("");
  }

  function initSearchPage() {
    var results = document.querySelector("[data-search-results]");
    var input = document.querySelector("[data-search-page-input]");
    var typeSelect = document.querySelector("[data-search-type]");
    var form = document.querySelector("[data-search-page-form]");
    var empty = document.querySelector("[data-search-empty]");
    if (!results || !window.SEARCH_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    if (input) {
      input.value = initial;
    }

    function render() {
      var query = normalize(input && input.value);
      var typeValue = typeSelect ? typeSelect.value : "";
      var pool = window.SEARCH_MOVIES.filter(function (movie) {
        var text = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          (movie.tags || []).join(" "),
          movie.category
        ].join(" "));
        if (query && text.indexOf(query) === -1) {
          return false;
        }
        if (typeValue && movie.type !== typeValue) {
          return false;
        }
        return true;
      });
      if (!query && !typeValue) {
        pool = window.SEARCH_MOVIES.slice(0, 80);
      }
      results.innerHTML = pool.slice(0, 180).map(renderSearchCard).join("");
      if (empty) {
        empty.classList.toggle("is-visible", pool.length === 0);
      }
    }

    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var query = input ? input.value.trim() : "";
        var nextUrl = query ? "./search.html?q=" + encodeURIComponent(query) : "./search.html";
        window.history.replaceState(null, "", nextUrl);
        render();
      });
    }
    if (input) {
      input.addEventListener("input", render);
    }
    if (typeSelect) {
      typeSelect.addEventListener("change", render);
    }
    render();
  }

  function initBackTop() {
    var button = document.querySelector("[data-back-top]");
    if (!button) {
      return;
    }
    function sync() {
      button.classList.toggle("is-visible", window.scrollY > 620);
    }
    button.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    window.addEventListener("scroll", sync, { passive: true });
    sync();
  }

  ready(function () {
    initMenu();
    initHero();
    initLocalFilter();
    initSearchPage();
    initBackTop();
  });
})();
