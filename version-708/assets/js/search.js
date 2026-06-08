document.addEventListener('DOMContentLoaded', function () {
  var input = document.querySelector('[data-search-input]');
  var categorySelect = document.querySelector('[data-search-category]');
  var typeSelect = document.querySelector('[data-search-type]');
  var clearButton = document.querySelector('[data-search-clear]');
  var results = document.querySelector('[data-search-results]');
  var title = document.querySelector('[data-search-title]');
  var movies = window.MOVIE_DATA || [];
  var queryFromUrl = new URLSearchParams(window.location.search).get('q') || '';

  if (!input || !categorySelect || !typeSelect || !results) {
    return;
  }

  populateTypeOptions();
  input.value = queryFromUrl;
  renderResults();

  input.addEventListener('input', renderResults);
  categorySelect.addEventListener('change', renderResults);
  typeSelect.addEventListener('change', renderResults);

  clearButton.addEventListener('click', function () {
    input.value = '';
    categorySelect.value = '';
    typeSelect.value = '';
    renderResults();
    input.focus();
  });

  function populateTypeOptions() {
    var types = Array.from(new Set(movies.map(function (movie) {
      return movie.type;
    }).filter(Boolean))).sort();

    types.forEach(function (type) {
      var option = document.createElement('option');
      option.value = type;
      option.textContent = type;
      typeSelect.appendChild(option);
    });
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function renderResults() {
    var keyword = normalize(input.value);
    var category = normalize(categorySelect.value);
    var type = normalize(typeSelect.value);

    var matched = movies.filter(function (movie) {
      var searchText = normalize(movie.searchText);
      var matchesKeyword = !keyword || searchText.indexOf(keyword) !== -1;
      var matchesCategory = !category || normalize(movie.categoryName) === category;
      var matchesType = !type || normalize(movie.type) === type;
      return matchesKeyword && matchesCategory && matchesType;
    }).slice(0, 120);

    if (title) {
      title.textContent = keyword || category || type ? '搜索结果：' + matched.length + ' 部' : '热门影片';
    }

    results.innerHTML = matched.map(renderMovieCard).join('');
  }

  function renderMovieCard(movie) {
    return [
      '<article class="movie-card" data-movie-card>',
      '  <a href="' + movie.url + '" aria-label="观看 ' + escapeHtml(movie.title) + '">',
      '    <div class="poster-frame">',
      '      <img src="' + movie.poster + '" alt="' + escapeHtml(movie.title) + ' 海报" loading="lazy">',
      '      <span class="poster-badge">' + escapeHtml(movie.type) + '</span>',
      '      <span class="play-chip">播放</span>',
      '    </div>',
      '    <div class="movie-card-body">',
      '      <h3>' + escapeHtml(movie.title) + '</h3>',
      '      <p>' + escapeHtml(movie.oneLine) + '</p>',
      '      <div class="movie-meta-row">',
      '        <span>' + escapeHtml(movie.region) + '</span>',
      '        <span>' + escapeHtml(movie.year) + '</span>',
      '        <span>' + escapeHtml(movie.categoryName) + '</span>',
      '      </div>',
      '    </div>',
      '  </a>',
      '</article>'
    ].join('\n');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (character) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[character];
    });
  }
});
