(function () {
  var ready = function (callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', callback);
  };

  ready(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    if (menuButton && mobileNav) {
      menuButton.addEventListener('click', function () {
        mobileNav.classList.toggle('open');
      });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var current = 0;
      var showSlide = function (index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('active', dotIndex === current);
        });
      };
      dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
          showSlide(index);
        });
      });
      if (slides.length > 1) {
        window.setInterval(function () {
          showSlide(current + 1);
        }, 5600);
      }
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-card-filter]')).forEach(function (input) {
      input.addEventListener('input', function () {
        var query = input.value.trim().toLowerCase();
        Array.prototype.slice.call(document.querySelectorAll('.movie-card')).forEach(function (card) {
          var text = (card.getAttribute('data-search') || '').toLowerCase();
          card.style.display = !query || text.indexOf(query) !== -1 ? '' : 'none';
        });
      });
    });

    var searchForm = document.querySelector('[data-site-search-form]');
    var searchInput = document.querySelector('[data-site-search-input]');
    var searchResults = document.querySelector('[data-site-search-results]');
    if (searchForm && searchInput && searchResults && window.SEARCH_MOVIES) {
      var render = function (query) {
        var keyword = query.trim().toLowerCase();
        searchResults.innerHTML = '';
        if (!keyword) {
          searchResults.classList.add('empty');
          return;
        }
        searchResults.classList.remove('empty');
        var matched = window.SEARCH_MOVIES.filter(function (movie) {
          return movie.search.indexOf(keyword) !== -1;
        }).slice(0, 120);
        if (!matched.length) {
          searchResults.innerHTML = '<div class="prose-block"><p>没有找到匹配内容，可以尝试更短的片名、类型、地区或标签。</p></div>';
          return;
        }
        var html = matched.map(function (movie) {
          return [
            '<a class="movie-card compact" href="movie/' + movie.file + '" data-search="' + movie.search.replace(/"/g, '&quot;') + '">',
            '<div class="poster-wrap">',
            '<img src="./' + movie.cover + '" alt="' + movie.title.replace(/"/g, '&quot;') + ' 海报" loading="lazy">',
            '<span class="poster-type">' + movie.type + '</span>',
            '<span class="poster-rating">' + movie.rating + '</span>',
            '</div>',
            '<div class="card-body">',
            '<h3>' + movie.title + '</h3>',
            '<p>' + movie.desc + '</p>',
            '<div class="card-meta"><span>' + movie.year + '</span><span>' + movie.region + '</span><span>' + movie.genre + '</span></div>',
            '<div class="tag-row"><span>' + movie.category + '</span></div>',
            '</div>',
            '</a>'
          ].join('');
        }).join('');
        searchResults.innerHTML = '<div class="movie-grid">' + html + '</div>';
      };
      searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        render(searchInput.value);
      });
      searchInput.addEventListener('input', function () {
        render(searchInput.value);
      });
      var params = new URLSearchParams(window.location.search);
      var initial = params.get('q') || '';
      if (initial) {
        searchInput.value = initial;
        render(initial);
      } else {
        render('');
      }
    }
  });
})();
