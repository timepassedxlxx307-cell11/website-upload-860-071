(function () {
    function setup(container) {
        var video = container.querySelector('video');
        var playButton = container.querySelector('[data-play]');
        var stream = video ? video.getAttribute('data-stream') : '';
        var hls = null;
        var initialized = false;

        if (!video || !stream) {
            return;
        }

        function initialize() {
            if (initialized) {
                return;
            }
            initialized = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        hls.destroy();
                    }
                });
            } else {
                video.src = stream;
            }
        }

        function play() {
            initialize();
            video.controls = true;
            var attempt = video.play();
            if (attempt && typeof attempt.catch === 'function') {
                attempt.catch(function () {
                    container.classList.remove('is-playing');
                });
            }
        }

        if (playButton) {
            playButton.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                play();
            });
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            } else {
                video.pause();
            }
        });

        video.addEventListener('play', function () {
            container.classList.add('is-playing');
        });

        video.addEventListener('pause', function () {
            container.classList.remove('is-playing');
        });

        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    document.querySelectorAll('[data-video-player]').forEach(setup);
})();
