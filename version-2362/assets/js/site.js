
(function () {
  var toggle = document.querySelector('[data-mobile-toggle]');
  var menu = document.querySelector('[data-mobile-menu]');

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var heroIndex = 0;
  var heroTimer;

  function showHero(index) {
    if (!slides.length) {
      return;
    }

    heroIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === heroIndex);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === heroIndex);
    });
  }

  function nextHero() {
    showHero(heroIndex + 1);
  }

  if (slides.length) {
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var next = Number(dot.getAttribute('data-hero-dot') || 0);
        showHero(next);
        clearInterval(heroTimer);
        heroTimer = setInterval(nextHero, 5200);
      });
    });
    heroTimer = setInterval(nextHero, 5200);
  }

  var searchInput = document.querySelector('[data-search-input]');
  var yearFilter = document.querySelector('[data-year-filter]');
  var categoryFilter = document.querySelector('[data-category-filter]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

  function matchYear(cardYear, filterValue) {
    var year = Number(cardYear || 0);
    if (!filterValue) {
      return true;
    }
    if (filterValue === '2025') {
      return year >= 2025;
    }
    if (filterValue === '2020') {
      return year >= 2020 && year <= 2024;
    }
    if (filterValue === '2015') {
      return year >= 2015 && year <= 2019;
    }
    if (filterValue === '2010') {
      return year >= 2010 && year <= 2014;
    }
    if (filterValue === '2000') {
      return year >= 2000 && year <= 2009;
    }
    if (filterValue === '1990') {
      return year < 2000;
    }
    return true;
  }

  function filterCards() {
    if (!cards.length) {
      return;
    }

    var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var yearValue = yearFilter ? yearFilter.value : '';
    var categoryValue = categoryFilter ? categoryFilter.value : '';

    cards.forEach(function (card) {
      var text = [
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-category'),
        card.getAttribute('data-tags')
      ].join(' ').toLowerCase();
      var category = card.getAttribute('data-category') || '';
      var visible = true;

      if (keyword && text.indexOf(keyword) === -1) {
        visible = false;
      }
      if (!matchYear(card.getAttribute('data-year'), yearValue)) {
        visible = false;
      }
      if (categoryValue && category !== categoryValue) {
        visible = false;
      }

      card.classList.toggle('is-hidden', !visible);
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', filterCards);
  }
  if (yearFilter) {
    yearFilter.addEventListener('change', filterCards);
  }
  if (categoryFilter) {
    categoryFilter.addEventListener('change', filterCards);
  }
})();
