(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");
    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    document.querySelectorAll(".site-search-form").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input) {
          return;
        }
        var value = input.value.trim();
        if (!value) {
          event.preventDefault();
          window.location.href = "./search.html";
        }
      });
    });

    initHeroSlider();
    initStaticFilters();
  });

  function initHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    if (slides.length <= 1) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var next = Number(dot.getAttribute("data-hero-dot"));
        show(next);
        start();
      });
    });

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    start();
  }

  function initStaticFilters() {
    document.querySelectorAll("[data-static-filter-form]").forEach(function (form) {
      var input = form.querySelector("[data-filter-input]");
      var list = document.querySelector("[data-filter-list]");
      if (!input || !list) {
        return;
      }
      input.addEventListener("input", function () {
        var query = input.value.trim().toLowerCase();
        list.querySelectorAll(".movie-card").forEach(function (card) {
          var hay = [
            card.getAttribute("data-title") || "",
            card.getAttribute("data-tags") || "",
            card.getAttribute("data-category") || "",
            card.textContent || ""
          ].join(" ").toLowerCase();
          card.classList.toggle("is-filter-hidden", query && hay.indexOf(query) === -1);
        });
      });
    });
  }

  window.initMoviePlayer = function (videoId, buttonId, overlayId, sourceUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var overlay = document.getElementById(overlayId);
    var started = false;
    var hls = null;

    if (!video || !sourceUrl) {
      return;
    }

    function begin() {
      if (!started) {
        started = true;
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
        video.controls = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = sourceUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(sourceUrl);
          hls.attachMedia(video);
        } else {
          video.src = sourceUrl;
        }
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }

    function toggle() {
      if (!started || video.paused) {
        begin();
      } else {
        video.pause();
      }
    }

    if (button) {
      button.addEventListener("click", begin);
    }
    if (overlay) {
      overlay.addEventListener("click", begin);
    }
    video.addEventListener("click", toggle);
    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  };

  window.initSearchPage = function () {
    var data = window.SEARCH_MOVIES || [];
    var form = document.querySelector("[data-search-page-form]");
    var input = document.querySelector("[data-search-page-input]");
    var results = document.querySelector("[data-search-results]");
    var heading = document.querySelector("[data-search-heading]");
    var title = document.querySelector("[data-search-title]");
    if (!form || !input || !results) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;

    function render(query) {
      var normalized = query.trim().toLowerCase();
      var matches = normalized ? data.filter(function (item) {
        return [item.title, item.region, item.type, item.year, item.genre, item.tags, item.oneLine]
          .join(" ")
          .toLowerCase()
          .indexOf(normalized) !== -1;
      }) : data.slice(0, 24);

      if (heading) {
        heading.textContent = normalized ? "搜索结果" : "推荐内容";
      }
      if (title) {
        title.textContent = normalized ? "与“" + query.trim() + "”相关" : "精选片单";
      }
      results.innerHTML = matches.slice(0, 240).map(function (item) {
        return [
          '<article class="movie-card compact-card">',
          '  <a class="poster-link" href="' + item.detail + '" aria-label="' + escapeHtml(item.title) + '">',
          '    <img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
          '    <span class="poster-badge">' + escapeHtml(item.category) + '</span>',
          '    <span class="poster-play">▶</span>',
          '  </a>',
          '  <div class="movie-card-body">',
          '    <h3><a href="' + item.detail + '">' + escapeHtml(item.title) + '</a></h3>',
          '    <div class="movie-meta">',
          '      <span>' + escapeHtml(item.region) + '</span>',
          '      <span>' + escapeHtml(item.type) + '</span>',
          '      <span>' + escapeHtml(item.year) + '</span>',
          '    </div>',
          '  </div>',
          '</article>'
        ].join("\n");
      }).join("\n");
    }

    function submit(event) {
      event.preventDefault();
      var query = input.value.trim();
      var url = query ? "./search.html?q=" + encodeURIComponent(query) : "./search.html";
      history.replaceState(null, "", url);
      render(query);
    }

    form.addEventListener("submit", submit);
    input.addEventListener("input", function () {
      render(input.value);
    });
    render(initial);
  };

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      }[char];
    });
  }
})();
