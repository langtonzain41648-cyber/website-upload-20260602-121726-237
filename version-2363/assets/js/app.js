(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var toggle = document.querySelector(".mobile-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        mobileNav.classList.toggle("open");
      });
    }

    var hero = document.querySelector(".hero");
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dots button"));
    var activeIndex = 0;

    function activateHero(index) {
      if (!slides.length) {
        return;
      }

      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === activeIndex);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === activeIndex);
      });

      if (hero) {
        var image = slides[activeIndex].getAttribute("data-bg");
        hero.style.setProperty("--hero-image", "url('" + image + "')");
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        activateHero(i);
      });
    });

    if (slides.length) {
      activateHero(0);
      setInterval(function () {
        activateHero(activeIndex + 1);
      }, 5200);
    }

    var player = document.querySelector(".player-shell");

    if (player) {
      var video = player.querySelector("video");
      var button = player.querySelector(".play-overlay");
      var stream = player.getAttribute("data-stream");
      var attached = false;
      var hlsInstance = null;

      function attachStream() {
        if (attached || !video || !stream) {
          return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new Hls();
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else {
          video.src = stream;
        }

        attached = true;
      }

      function startVideo() {
        attachStream();
        player.classList.add("is-playing");
        var result = video.play();

        if (result && typeof result.catch === "function") {
          result.catch(function () {});
        }
      }

      if (button) {
        button.addEventListener("click", startVideo);
      }

      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            startVideo();
          }
        });
      }

      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    }

    var filterForms = Array.prototype.slice.call(document.querySelectorAll(".filter-panel"));

    filterForms.forEach(function (panel) {
      var input = panel.querySelector("input[type='search']");
      var select = panel.querySelector("select");
      var button = panel.querySelector("button");
      var targetSelector = panel.getAttribute("data-target") || ".movie-card";
      var cards = Array.prototype.slice.call(document.querySelectorAll(targetSelector));
      var noResults = document.querySelector(panel.getAttribute("data-empty") || ".no-results");

      function filter() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var year = select ? select.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags")
          ].join(" ").toLowerCase();
          var okQuery = !query || haystack.indexOf(query) !== -1;
          var okYear = !year || card.getAttribute("data-year") === year;
          var show = okQuery && okYear;
          card.style.display = show ? "" : "none";
          if (show) {
            visible += 1;
          }
        });

        if (noResults) {
          noResults.style.display = visible ? "none" : "block";
        }
      }

      if (button) {
        button.addEventListener("click", filter);
      }
      if (input) {
        input.addEventListener("input", filter);
      }
      if (select) {
        select.addEventListener("change", filter);
      }

      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q && input) {
        input.value = q;
      }
      filter();
    });
  });
})();
