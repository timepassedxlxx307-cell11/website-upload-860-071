(function () {
  var toggle = document.querySelector('[data-mobile-toggle]');
  var nav = document.querySelector('[data-mobile-nav]');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var activate = function (index) {
      current = index;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    };
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        activate(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function () {
        activate((current + 1) % slides.length);
      }, 5200);
    }
  }

  document.querySelectorAll('[data-filter-root]').forEach(function (root) {
    var input = root.querySelector('[data-filter-input]');
    var typeSelect = root.querySelector('[data-filter-type]');
    var yearSelect = root.querySelector('[data-filter-year]');
    var grid = document.querySelector('[data-card-grid]');
    var empty = document.querySelector('[data-empty-state]');
    if (!grid) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-card]'));
    var apply = function () {
      var q = input ? input.value.trim().toLowerCase() : '';
      var type = typeSelect ? typeSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = card.getAttribute('data-search') || '';
        var cardType = card.getAttribute('data-type') || '';
        var cardYear = card.getAttribute('data-year') || '';
        var show = (!q || haystack.indexOf(q) !== -1) && (!type || cardType === type) && (!year || cardYear === year);
        card.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    };
    [input, typeSelect, yearSelect].forEach(function (element) {
      if (element) {
        element.addEventListener('input', apply);
        element.addEventListener('change', apply);
      }
    });
  });

  var form = document.querySelector('[data-global-search-form]');
  if (form && window.MOVIE_INDEX) {
    var field = document.querySelector('[data-global-search-input]');
    var results = document.querySelector('[data-global-search-results]');
    var emptyMessage = document.querySelector('[data-global-search-empty]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    if (field) {
      field.value = initialQuery;
    }
    var card = function (movie) {
      return [
        '<article class="movie-card">',
        '  <a class="card-cover" href="' + movie.url + '" aria-label="' + escapeHtml(movie.title) + '">',
        '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" decoding="async">',
        '    <span class="cover-shade"></span>',
        '    <span class="play-badge">▶</span>',
        '    <span class="duration">' + movie.duration + '</span>',
        '  </a>',
        '  <div class="card-body">',
        '    <div class="card-tags"><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.year) + '</span></div>',
        '    <h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
        '    <p>' + escapeHtml(movie.desc) + '</p>',
        '    <div class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>',
        '  </div>',
        '</article>'
      ].join('');
    };
    var render = function () {
      var q = field ? field.value.trim().toLowerCase() : '';
      var pool = window.MOVIE_INDEX;
      var matches = q ? pool.filter(function (movie) {
        return movie.search.indexOf(q) !== -1;
      }) : pool.slice(0, 36);
      matches = matches.slice(0, 96);
      if (results) {
        results.innerHTML = matches.map(card).join('');
      }
      if (emptyMessage) {
        emptyMessage.classList.toggle('is-visible', matches.length === 0);
      }
    };
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      render();
    });
    if (field) {
      field.addEventListener('input', render);
    }
    render();
  }
})();

function escapeHtml(value) {
  return String(value).replace(/[&<>"]/g, function (char) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;'
    }[char];
  });
}

function initMoviePlayer(videoId, overlayId, streamUrl) {
  var video = document.getElementById(videoId);
  var overlay = document.getElementById(overlayId);
  if (!video || !overlay || !streamUrl) {
    return;
  }
  var started = false;
  var hlsInstance = null;
  var attach = function () {
    if (started) {
      return Promise.resolve();
    }
    started = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      return Promise.resolve();
    }
    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
      return new Promise(function (resolve) {
        video.addEventListener('loadedmetadata', resolve, { once: true });
      });
    }
    video.src = streamUrl;
    return Promise.resolve();
  };
  var play = function () {
    overlay.classList.add('is-hidden');
    attach().then(function () {
      return video.play();
    }).catch(function () {
      overlay.classList.remove('is-hidden');
    });
  };
  overlay.addEventListener('click', play);
  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });
  video.addEventListener('play', function () {
    overlay.classList.add('is-hidden');
  });
  video.addEventListener('ended', function () {
    overlay.classList.remove('is-hidden');
  });
  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
