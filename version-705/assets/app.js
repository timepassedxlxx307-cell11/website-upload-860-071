(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMenu() {
        var toggle = document.querySelector('.nav-toggle');
        var nav = document.querySelector('.site-nav');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            var open = nav.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    function initImages() {
        selectAll('img').forEach(function (img) {
            img.addEventListener('error', function () {
                img.classList.add('is-absent');
            });
        });
    }

    function initHero() {
        var slides = selectAll('[data-hero-slide]');
        var dots = selectAll('[data-hero-dot]');
        if (slides.length < 2) {
            return;
        }
        var current = 0;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === current);
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
            });
        });
        window.setInterval(function () {
            show(current + 1);
        }, 5200);
    }

    function initSearch() {
        var inputs = selectAll('.movie-search-input');
        if (!inputs.length) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        inputs.forEach(function (input) {
            if (query) {
                input.value = query;
            }
            var root = input.closest('main') || document;
            var items = selectAll('[data-search]', root);
            function filter() {
                var value = input.value.trim().toLowerCase();
                items.forEach(function (item) {
                    var text = (item.getAttribute('data-search') || '').toLowerCase();
                    item.setAttribute('data-hidden', value && text.indexOf(value) === -1 ? 'true' : 'false');
                });
            }
            input.addEventListener('input', filter);
            filter();
        });
    }

    function attachMedia(video, url) {
        if (video.dataset.ready === '1') {
            return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(url);
            hls.attachMedia(video);
            video._hls = hls;
        } else {
            video.src = url;
        }
        video.dataset.ready = '1';
    }

    function initPlayers() {
        selectAll('.player-shell').forEach(function (shell) {
            var video = shell.querySelector('video');
            var button = shell.querySelector('.play-overlay');
            var url = shell.getAttribute('data-url');
            if (!video || !url) {
                return;
            }
            function play() {
                attachMedia(video, url);
                if (button) {
                    button.classList.add('is-hidden');
                }
                var playResult = video.play();
                if (playResult && typeof playResult.catch === 'function') {
                    playResult.catch(function () {
                        if (button) {
                            button.classList.remove('is-hidden');
                        }
                    });
                }
            }
            if (button) {
                button.addEventListener('click', play);
            }
            video.addEventListener('click', function () {
                if (video.dataset.ready !== '1') {
                    play();
                }
            });
            video.addEventListener('play', function () {
                if (button) {
                    button.classList.add('is-hidden');
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initImages();
        initHero();
        initSearch();
        initPlayers();
    });
})();
