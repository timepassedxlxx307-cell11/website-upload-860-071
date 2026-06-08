(function () {
  function each(selector, root, callback) {
    Array.prototype.forEach.call((root || document).querySelectorAll(selector), callback);
  }

  var toggle = document.querySelector('.nav-toggle');
  var panel = document.querySelector('.mobile-panel');
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      var open = panel.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var slides = document.querySelectorAll('[data-hero-slide]');
  var dots = document.querySelectorAll('[data-hero-dot]');
  var current = 0;

  function showHero(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    each('[data-hero-slide]', document, function (slide, i) {
      slide.classList.toggle('is-active', i === current);
    });
    each('[data-hero-dot]', document, function (dot, i) {
      dot.classList.toggle('is-active', i === current);
    });
  }

  if (slides.length) {
    each('[data-hero-dot]', document, function (dot, i) {
      dot.addEventListener('click', function () {
        showHero(i);
      });
    });
    window.setInterval(function () {
      showHero(current + 1);
    }, 5200);
  }

  var searchInput = document.querySelector('[data-card-search]');
  var list = document.querySelector('[data-card-list]');
  var empty = document.querySelector('[data-empty-state]');
  var activeKind = '';

  function matchKind(kind, target) {
    if (!target) {
      return true;
    }
    return kind.indexOf(target) !== -1;
  }

  function filterCards() {
    if (!list) {
      return;
    }
    var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var visible = 0;
    each('.movie-card', list, function (card) {
      var hay = (card.getAttribute('data-search') || '').toLowerCase();
      var kind = card.getAttribute('data-kind') || '';
      var ok = (!keyword || hay.indexOf(keyword) !== -1) && matchKind(kind, activeKind);
      card.style.display = ok ? '' : 'none';
      if (ok) {
        visible += 1;
      }
    });
    if (empty) {
      empty.classList.toggle('is-visible', visible === 0);
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', filterCards);
  }

  each('[data-kind-filters] button', document, function (button) {
    button.addEventListener('click', function () {
      each('[data-kind-filters] button', document, function (item) {
        item.classList.remove('is-active');
      });
      button.classList.add('is-active');
      activeKind = button.getAttribute('data-kind') || '';
      filterCards();
    });
  });

  var localSearch = document.querySelector('[data-local-search]');
  var results = document.querySelector('[data-search-results]');
  var meta = document.querySelector('[data-search-meta]');

  function renderSearch(value) {
    if (!results || !window.SEARCH_MOVIES) {
      return;
    }
    var query = (value || '').trim().toLowerCase();
    var items = window.SEARCH_MOVIES.filter(function (item) {
      return !query || item.hay.indexOf(query) !== -1;
    }).slice(0, 120);
    if (meta) {
      meta.textContent = query ? '搜索结果' : '精选推荐';
    }
    if (!items.length) {
      results.innerHTML = '<p class="empty-state is-visible">暂无匹配影片</p>';
      return;
    }
    results.innerHTML = items.map(function (item) {
      return '<article class="movie-card">' +
        '<a class="poster-link" href="' + item.url + '">' +
        '<img src="' + item.cover + '" alt="' + item.title + '" loading="lazy">' +
        '<span class="poster-glow"></span><span class="play-mark">▶</span></a>' +
        '<div class="movie-body"><div class="movie-meta"><span>' + item.year + '</span><span>' + item.region + '</span></div>' +
        '<h3><a href="' + item.url + '">' + item.title + '</a></h3>' +
        '<p>' + item.desc + '</p><div class="tag-row"><span>' + item.genre + '</span><span>' + item.kind + '</span></div></div></article>';
    }).join('');
  }

  if (localSearch) {
    var field = localSearch.querySelector('input[name="q"]');
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    if (field) {
      field.value = q;
      field.addEventListener('input', function () {
        renderSearch(field.value);
      });
    }
    localSearch.addEventListener('submit', function (event) {
      event.preventDefault();
      renderSearch(field ? field.value : '');
    });
    renderSearch(q);
  }
}());
