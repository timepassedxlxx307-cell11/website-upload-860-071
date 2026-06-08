document.addEventListener('DOMContentLoaded', function () {
  initMobileMenu();
  initHeroCarousel();
  initPageFilters();
  initImageFallbacks();
});

function initMobileMenu() {
  var button = document.querySelector('[data-mobile-menu-button]');
  var nav = document.querySelector('[data-mobile-nav]');

  if (!button || !nav) {
    return;
  }

  button.addEventListener('click', function () {
    var isOpen = nav.classList.toggle('is-open');
    button.setAttribute('aria-expanded', String(isOpen));
  });
}

function initHeroCarousel() {
  var carousel = document.querySelector('[data-hero-carousel]');

  if (!carousel) {
    return;
  }

  var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
  var thumbs = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-thumb]'));
  var current = 0;
  var timer = null;

  function showSlide(index) {
    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === current);
    });

    thumbs.forEach(function (thumb, thumbIndex) {
      thumb.classList.toggle('is-active', thumbIndex === current);
    });
  }

  function startTimer() {
    stopTimer();
    timer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  function stopTimer() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
      startTimer();
    });
  });

  thumbs.forEach(function (thumb, index) {
    thumb.addEventListener('click', function () {
      showSlide(index);
      startTimer();
    });
  });

  carousel.addEventListener('mouseenter', stopTimer);
  carousel.addEventListener('mouseleave', startTimer);
  startTimer();
}

function initPageFilters() {
  var input = document.querySelector('[data-page-filter-input]');
  var select = document.querySelector('[data-page-filter-select]');
  var container = document.querySelector('[data-filter-container]');

  if (!container || (!input && !select)) {
    return;
  }

  var cards = Array.prototype.slice.call(container.querySelectorAll('[data-movie-card]'));

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applyFilter() {
    var keyword = normalize(input ? input.value : '');
    var category = normalize(select ? select.value : '');

    cards.forEach(function (card) {
      var text = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.textContent
      ].join(' '));

      var categoryText = normalize(card.textContent);
      var keywordMatched = !keyword || text.indexOf(keyword) !== -1;
      var categoryMatched = !category || categoryText.indexOf(category) !== -1;

      card.classList.toggle('is-hidden', !(keywordMatched && categoryMatched));
    });
  }

  if (input) {
    input.addEventListener('input', applyFilter);
  }

  if (select) {
    select.addEventListener('change', applyFilter);
  }
}

function initImageFallbacks() {
  var images = document.querySelectorAll('img');

  images.forEach(function (image) {
    image.addEventListener('error', function () {
      var frame = image.closest('.poster-frame, .hero-bg, .detail-backdrop, .category-posters, .category-hero-stack, .detail-poster');

      if (frame) {
        frame.classList.add('is-missing-image');
      }
    }, { once: true });
  });
}
