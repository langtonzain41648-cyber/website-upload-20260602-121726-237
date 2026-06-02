(() => {
  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get('q') || '';
  document.querySelectorAll('[data-filter-input]').forEach((input) => {
    if (initialQuery && !input.value) {
      input.value = initialQuery;
    }
  });

  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', () => {
      mobilePanel.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', mobilePanel.classList.contains('is-open') ? 'true' : 'false');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('.hero-dot'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    const show = (target) => {
      if (!slides.length) {
        return;
      }
      index = (target + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('is-active', dotIndex === index);
        dot.setAttribute('aria-current', dotIndex === index ? 'true' : 'false');
      });
    };

    const start = () => {
      stop();
      timer = window.setInterval(() => show(index + 1), 5200);
    };

    const stop = () => {
      if (timer) {
        window.clearInterval(timer);
      }
    };

    dots.forEach((dot, dotIndex) => {
      dot.addEventListener('click', () => {
        show(dotIndex);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', () => {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', () => {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  const normalize = (value) => (value || '').toString().trim().toLowerCase();

  document.querySelectorAll('[data-filter-scope]').forEach((scope) => {
    const textInput = scope.querySelector('[data-filter-input]');
    const yearSelect = scope.querySelector('[data-year-filter]');
    const regionSelect = scope.querySelector('[data-region-filter]');
    const items = Array.from(scope.querySelectorAll('[data-filter-item]'));
    const empty = scope.querySelector('[data-empty-state]');

    const applyFilter = () => {
      const query = normalize(textInput ? textInput.value : '');
      const year = normalize(yearSelect ? yearSelect.value : '');
      const region = normalize(regionSelect ? regionSelect.value : '');
      let visible = 0;

      items.forEach((item) => {
        const haystack = normalize([
          item.getAttribute('data-title'),
          item.getAttribute('data-region'),
          item.getAttribute('data-genre'),
          item.getAttribute('data-tags'),
          item.getAttribute('data-year')
        ].join(' '));
        const matchesQuery = !query || haystack.includes(query);
        const matchesYear = !year || normalize(item.getAttribute('data-year')) === year;
        const matchesRegion = !region || normalize(item.getAttribute('data-region')).includes(region);
        const matched = matchesQuery && matchesYear && matchesRegion;
        item.classList.toggle('is-hidden', !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    };

    [textInput, yearSelect, regionSelect].forEach((control) => {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    applyFilter();
  });
})();
