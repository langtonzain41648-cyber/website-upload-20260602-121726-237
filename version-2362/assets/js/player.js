
function initPlayer(videoId, buttonId, url) {
  var video = document.getElementById(videoId);
  var button = document.getElementById(buttonId);
  var hlsInstance = null;
  var attached = false;

  if (!video || !button || !url) {
    return;
  }

  function attachMedia() {
    if (attached) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      attached = true;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        maxBufferLength: 30,
        enableWorker: true
      });
      hlsInstance.loadSource(url);
      hlsInstance.attachMedia(video);
      attached = true;
      return;
    }

    video.src = url;
    attached = true;
  }

  function startPlay() {
    attachMedia();
    button.classList.add('is-hidden');
    video.setAttribute('controls', 'controls');
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  button.addEventListener('click', startPlay);
  video.addEventListener('click', function () {
    if (!attached) {
      startPlay();
    }
  });
  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
