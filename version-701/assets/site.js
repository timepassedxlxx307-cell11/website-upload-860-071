(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function setupMenu() {
        var button = qs('[data-menu-toggle]');
        var nav = qs('[data-mobile-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var hero = qs('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = qsa('[data-hero-slide]', hero);
        var dots = qsa('[data-hero-dot]', hero);
        if (slides.length < 2) {
            return;
        }
        var active = 0;
        var timer = null;
        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle('is-active', itemIndex === active);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle('is-active', itemIndex === active);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5200);
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                window.clearInterval(timer);
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });
        start();
    }

    function setupFilters() {
        qsa('[data-filter-bar]').forEach(function (bar) {
            var section = bar.closest('.content-section') || document;
            var cards = qsa('[data-movie-card]', section);
            var input = qs('[data-filter-search]', bar);
            var selects = qsa('[data-filter-select]', bar);
            var empty = qs('[data-empty-state]', section);
            function apply() {
                var query = input ? input.value.trim().toLowerCase() : '';
                var values = {};
                selects.forEach(function (select) {
                    values[select.getAttribute('data-filter-select')] = select.value;
                });
                var visible = 0;
                cards.forEach(function (card) {
                    var text = (card.getAttribute('data-search') || '').toLowerCase();
                    var pass = true;
                    if (query && text.indexOf(query) === -1) {
                        pass = false;
                    }
                    Object.keys(values).forEach(function (key) {
                        if (values[key] && card.getAttribute('data-' + key) !== values[key]) {
                            pass = false;
                        }
                    });
                    card.style.display = pass ? '' : 'none';
                    if (pass) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle('is-visible', visible === 0);
                }
            }
            if (input) {
                input.addEventListener('input', apply);
            }
            selects.forEach(function (select) {
                select.addEventListener('change', apply);
            });
        });
    }

    function cardTemplate(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return '<article class="movie-card" data-movie-card>' +
            '<a class="movie-poster" href="./' + escapeHtml(movie.file) + '">' +
            '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
            '<span class="poster-shade"></span>' +
            '<span class="poster-year">' + escapeHtml(movie.year) + '</span>' +
            '</a>' +
            '<div class="movie-body">' +
            '<a class="movie-category" href="./category-' + escapeHtml(movie.categorySlug) + '.html">' + escapeHtml(movie.categoryName) + '</a>' +
            '<h3><a href="./' + escapeHtml(movie.file) + '">' + escapeHtml(movie.title) + '</a></h3>' +
            '<p>' + escapeHtml(movie.oneLine) + '</p>' +
            '<div class="movie-tags">' + tags + '</div>' +
            '</div>' +
            '</article>';
    }

    function setupSearchPage() {
        var container = qs('[data-search-results]');
        if (!container || !window.MOVIE_INDEX) {
            return;
        }
        var form = qs('[data-search-page-form]');
        var input = qs('[data-search-page-input]');
        var title = qs('[data-search-title]');
        var empty = qs('[data-search-empty]');
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        if (input) {
            input.value = initial;
        }
        function render(query) {
            var words = String(query || '').trim().toLowerCase();
            var results = window.MOVIE_INDEX.filter(function (movie) {
                if (!words) {
                    return movie.rank <= 60;
                }
                return String(movie.search || '').toLowerCase().indexOf(words) !== -1;
            }).slice(0, 120);
            container.innerHTML = results.map(cardTemplate).join('');
            if (title) {
                title.textContent = words ? '搜索结果' : '精选影片';
            }
            if (empty) {
                empty.classList.toggle('is-visible', results.length === 0);
            }
        }
        render(initial);
        if (form && input) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var value = input.value.trim();
                var url = value ? './search.html?q=' + encodeURIComponent(value) : './search.html';
                window.history.replaceState(null, '', url);
                render(value);
            });
        }
    }

    function initPlayer(options) {
        var video = document.getElementById(options.videoId);
        var overlay = document.getElementById(options.overlayId);
        var button = document.getElementById(options.buttonId);
        var message = document.getElementById(options.messageId);
        var source = options.source;
        var hlsInstance = null;
        var attached = false;
        if (!video || !source) {
            return;
        }
        function setMessage(value) {
            if (message) {
                message.textContent = value || '';
            }
        }
        function attachSource() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        setMessage('播放暂不可用');
                    }
                });
                return;
            }
            video.src = source;
        }
        function start() {
            attachSource();
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    setMessage('点击播放器继续');
                });
            }
        }
        if (overlay) {
            overlay.addEventListener('click', start);
        }
        if (button) {
            button.addEventListener('click', start);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    window.SitePlayer = {
        init: initPlayer
    };

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupSearchPage();
    });
}());
