(function () {
  function initMoviePlayer(streamUrl) {
    var video = document.querySelector(".movie-video");
    var cover = document.querySelector(".player-cover");
    var hlsInstance = null;
    var initialized = false;

    if (!video || !cover || !streamUrl) {
      return;
    }

    function bindStream() {
      if (initialized) {
        return;
      }
      initialized = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function playVideo() {
      bindStream();
      cover.classList.add("is-hidden");
      video.controls = true;
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          cover.classList.remove("is-hidden");
        });
      }
    }

    cover.addEventListener("click", playVideo);
    video.addEventListener("click", function () {
      if (!initialized) {
        playVideo();
      }
    });
    video.addEventListener("play", function () {
      cover.classList.add("is-hidden");
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;
})();
