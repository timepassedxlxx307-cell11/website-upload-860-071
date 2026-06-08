function bindMoviePlayer(sourceUrl) {
  var shell = document.querySelector('[data-player]');
  if (!shell) {
    return;
  }

  var video = shell.querySelector('video');
  var startButton = shell.querySelector('.player-start');
  var initialized = false;
  var hlsInstance = null;

  function initialize() {
    if (initialized || !video) {
      return;
    }

    initialized = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = sourceUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsInstance.loadSource(sourceUrl);
      hlsInstance.attachMedia(video);
      return;
    }

    video.src = sourceUrl;
  }

  function startPlayback() {
    initialize();
    if (startButton) {
      startButton.classList.add('hidden');
    }
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        if (startButton) {
          startButton.classList.remove('hidden');
        }
      });
    }
  }

  if (startButton) {
    startButton.addEventListener('click', startPlayback);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      startPlayback();
    }
  });

  video.addEventListener('play', function () {
    if (startButton) {
      startButton.classList.add('hidden');
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
