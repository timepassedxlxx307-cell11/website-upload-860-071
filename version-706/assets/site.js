(function () {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function rootPath() {
    return window.SITE_ROOT || "./";
  }

  function imgPath(path) {
    if (!path) {
      return "";
    }
    if (/^(https?:)?\/\//.test(path)) {
      return path;
    }
    return rootPath() + path.replace(/^\.\//, "");
  }

  window.initMoviePlayer = function (source) {
    var video = qs("#movie-video");
    var button = qs("#player-start");
    if (!video || !button || !source) {
      return;
    }
    var started = false;
    function prepare() {
      if (started) {
        return;
      }
      started = true;
      button.classList.add("hide");
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }
    button.addEventListener("click", prepare);
    video.addEventListener("click", function () {
      if (!started) {
        prepare();
      }
    });
  };

  function initMobileMenu() {
    var toggle = qs("#mobile-toggle");
    var panel = qs("#mobile-panel");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function initHero() {
    var hero = qs("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = qsa(".hero-slide", hero);
    var dots = qsa(".hero-dots button", hero);
    if (!slides.length) {
      return;
    }
    var index = 0;
    function setSlide(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, pos) {
        slide.classList.toggle("active", pos === index);
      });
      dots.forEach(function (dot, pos) {
        dot.classList.toggle("active", pos === index);
      });
    }
    dots.forEach(function (dot, pos) {
      dot.addEventListener("click", function () {
        setSlide(pos);
      });
    });
    setInterval(function () {
      setSlide(index + 1);
    }, 5200);
  }

  function initGlobalSearch() {
    var input = qs("#global-search");
    var results = qs("#search-results");
    if (!input || !results || !window.SEARCH_INDEX) {
      return;
    }
    function render(items) {
      results.innerHTML = "";
      if (!items.length) {
        results.classList.add("open");
        var empty = document.createElement("div");
        empty.className = "search-result-item";
        empty.textContent = "没有找到匹配影片";
        results.appendChild(empty);
        return;
      }
      items.slice(0, 12).forEach(function (item) {
        var link = document.createElement("a");
        link.className = "search-result-item";
        link.href = rootPath() + item.url;
        var img = document.createElement("img");
        img.src = imgPath(item.cover);
        img.alt = item.title;
        var box = document.createElement("div");
        var strong = document.createElement("strong");
        strong.textContent = item.title;
        var span = document.createElement("span");
        span.textContent = [item.year, item.type, item.region].filter(Boolean).join(" · ");
        box.appendChild(strong);
        box.appendChild(span);
        link.appendChild(img);
        link.appendChild(box);
        results.appendChild(link);
      });
      results.classList.add("open");
    }
    input.addEventListener("input", function () {
      var keyword = input.value.trim().toLowerCase();
      if (!keyword) {
        results.innerHTML = "";
        results.classList.remove("open");
        return;
      }
      var items = window.SEARCH_INDEX.filter(function (item) {
        return item.search.indexOf(keyword) !== -1;
      });
      render(items);
    });
  }

  function initLocalFilter() {
    var input = qs("[data-filter-input]");
    if (!input) {
      return;
    }
    var cards = qsa("[data-card]");
    input.addEventListener("input", function () {
      var keyword = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search-text") || "").toLowerCase();
        card.classList.toggle("hide-card", keyword && text.indexOf(keyword) === -1);
      });
    });
  }

  function initImageErrors() {
    qsa("img").forEach(function (img) {
      img.addEventListener("error", function () {
        img.classList.add("is-hidden");
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMobileMenu();
    initHero();
    initGlobalSearch();
    initLocalFilter();
    initImageErrors();
  });
})();
