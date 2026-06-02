document.addEventListener('DOMContentLoaded', function () {
  var page = document.querySelector('[data-search-page]');
  if (!page || !window.MOVIE_DATA) {
    return;
  }

  var input = page.querySelector('[data-search-input]');
  var category = page.querySelector('[data-category-filter]');
  var year = page.querySelector('[data-year-filter]');
  var reset = page.querySelector('[data-reset-search]');
  var results = page.querySelector('[data-search-results]');
  var summary = page.querySelector('[data-search-summary]');

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '  <a href="' + escapeHtml(movie.url) + '" class="movie-cover" aria-label="观看 ' + escapeHtml(movie.title) + '">',
      '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="duration">' + escapeHtml(movie.duration) + '</span>',
      '    <span class="play-hover" aria-hidden="true">▶</span>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <a class="movie-title" href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a>',
      '    <p>' + escapeHtml(movie.oneLine || '') + '</p>',
      '    <div class="movie-meta">',
      '      <span>' + escapeHtml(movie.year) + '</span>',
      '      <span>' + escapeHtml(movie.region) + '</span>',
      '      <span>' + escapeHtml(movie.category) + '</span>',
      '    </div>',
      '    <div class="tag-row">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('\n');
  }

  function matches(movie, query, categoryValue, yearValue) {
    var haystack = [
      movie.title,
      movie.category,
      movie.region,
      movie.year,
      movie.type,
      movie.genre,
      movie.oneLine,
      (movie.tags || []).join(' ')
    ].join(' ').toLowerCase();

    if (query && haystack.indexOf(query) === -1) {
      return false;
    }

    if (categoryValue && movie.category !== categoryValue) {
      return false;
    }

    if (yearValue && movie.year !== yearValue) {
      return false;
    }

    return true;
  }

  function update() {
    var query = (input.value || '').trim().toLowerCase();
    var categoryValue = category.value;
    var yearValue = year.value;
    var filtered = window.MOVIE_DATA.filter(function (movie) {
      return matches(movie, query, categoryValue, yearValue);
    });

    summary.textContent = '共找到 ' + filtered.length + ' 部影片';
    results.innerHTML = filtered.slice(0, 120).map(renderCard).join('\n');

    if (filtered.length > 120) {
      summary.textContent += '，当前展示前 120 部，可继续输入关键词缩小范围。';
    }
  }

  input.addEventListener('input', update);
  category.addEventListener('change', update);
  year.addEventListener('change', update);
  reset.addEventListener('click', function () {
    input.value = '';
    category.value = '';
    year.value = '';
    update();
  });

  update();
});
