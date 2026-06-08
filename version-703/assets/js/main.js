(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      current = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    showSlide(0);
    window.setInterval(function () {
      if (slides.length > 1) {
        showSlide((current + 1) % slides.length);
      }
    }, 5000);
  }

  var filterInput = document.querySelector('[data-page-filter]');
  var filterList = document.querySelector('.filter-list');
  var status = document.querySelector('[data-filter-status]');

  if (filterInput && filterList) {
    var params = new URLSearchParams(window.location.search);
    var initialKeyword = params.get('q') || '';
    if (initialKeyword) {
      filterInput.value = initialKeyword;
    }

    var cards = Array.prototype.slice.call(filterList.querySelectorAll('.movie-card'));

    function normalize(value) {
      return (value || '').toString().trim().toLowerCase();
    }

    function applyFilter() {
      var keyword = normalize(filterInput.value);
      var visible = 0;

      cards.forEach(function (card) {
        var title = normalize(card.getAttribute('data-title'));
        var meta = normalize(card.getAttribute('data-meta'));
        var text = normalize(card.textContent);
        var matched = !keyword || title.indexOf(keyword) !== -1 || meta.indexOf(keyword) !== -1 || text.indexOf(keyword) !== -1;
        card.classList.toggle('hidden-card', !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (status) {
        status.textContent = keyword ? '当前匹配 ' + visible + ' 部影片。' : '输入关键词开始筛选影片。';
      }
    }

    filterInput.addEventListener('input', applyFilter);
    applyFilter();
  }
})();
