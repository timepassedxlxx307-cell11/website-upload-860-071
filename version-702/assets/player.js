(function () {
  function attach(video, uri) {
    if (!video || !uri) {
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(uri);
      hls.attachMedia(video);
      video._hls = hls;
      return;
    }
    video.src = uri;
  }

  Array.prototype.forEach.call(document.querySelectorAll('.watch-player'), function (box) {
    var video = box.querySelector('video');
    var cover = box.querySelector('.player-cover');
    var uri = box.getAttribute('data-play');
    var ready = false;

    function start() {
      if (!ready) {
        attach(video, uri);
        ready = true;
      }
      box.classList.add('is-playing');
      var playing = video.play();
      if (playing && playing.catch) {
        playing.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener('click', start);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        }
      });
    }
  });
}());
