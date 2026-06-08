document.addEventListener('DOMContentLoaded', function () {
  var shell = document.querySelector('[data-video-shell]');
  var video = document.querySelector('.js-hls-player');
  var startButton = document.querySelector('[data-video-start]');
  var status = document.querySelector('[data-video-status]');

  if (!shell || !video || !startButton) {
    return;
  }

  var source = video.getAttribute('data-video-src');
  var hlsInstance = null;
  var isReady = false;

  function setStatus(message) {
    if (status) {
      status.textContent = message;
    }
  }

  function attachNativeSource() {
    video.src = source;
    isReady = true;
    setStatus('当前浏览器支持原生 HLS，已载入播放源。');
  }

  function attachHlsSource() {
    hlsInstance = new Hls({
      enableWorker: true,
      lowLatencyMode: false,
      backBufferLength: 90
    });

    hlsInstance.loadSource(source);
    hlsInstance.attachMedia(video);

    hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
      isReady = true;
      setStatus('HLS 播放源已初始化，可以开始播放。');
      playVideo();
    });

    hlsInstance.on(Hls.Events.ERROR, function (eventName, data) {
      if (data && data.fatal) {
        setStatus('播放源加载遇到问题，请尝试备用播放源。');
      }
    });
  }

  function preparePlayer() {
    if (!source) {
      setStatus('当前影片缺少播放源。');
      return;
    }

    if (isReady) {
      playVideo();
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      attachNativeSource();
      playVideo();
      return;
    }

    if (window.Hls && Hls.isSupported()) {
      attachHlsSource();
      return;
    }

    setStatus('浏览器暂不支持 HLS 播放，请更换浏览器或使用备用播放源。');
  }

  function playVideo() {
    startButton.classList.add('is-hidden');

    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        setStatus('浏览器阻止了自动播放，请再次点击视频播放按钮。');
      });
    }
  }

  startButton.addEventListener('click', preparePlayer);

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
});
