import { H as Hls } from './hls-dru42stk.js';

export function initMoviePlayer(sourceUrl) {
  var video = document.getElementById('movieVideo');
  var button = document.getElementById('moviePlayButton');
  if (!video || !button || !sourceUrl) {
    return;
  }

  var attached = false;
  var hls = null;

  function attach() {
    if (attached) {
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = sourceUrl;
    } else if (Hls && Hls.isSupported()) {
      hls = new Hls({
        maxBufferLength: 45,
        backBufferLength: 30
      });
      hls.loadSource(sourceUrl);
      hls.attachMedia(video);
    } else {
      video.src = sourceUrl;
    }
    attached = true;
  }

  function play() {
    attach();
    button.classList.add('hidden');
    var promise = video.play();
    if (promise && promise.catch) {
      promise.catch(function () {
        button.classList.remove('hidden');
      });
    }
  }

  button.addEventListener('click', play);
  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });
  video.addEventListener('play', function () {
    button.classList.add('hidden');
  });
  video.addEventListener('pause', function () {
    if (!video.ended) {
      button.classList.remove('hidden');
    }
  });
  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
}
