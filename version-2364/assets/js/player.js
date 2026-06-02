(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    document.querySelectorAll("[data-player]").forEach(function (player) {
      var video = player.querySelector("video[data-stream]");
      var button = player.querySelector("[data-play-button]");
      var attached = false;
      var hls = null;

      function attachStream() {
        if (!video || attached) {
          return;
        }
        var stream = video.getAttribute("data-stream");
        if (!stream) {
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }
        attached = true;
      }

      function startPlayback() {
        attachStream();
        player.classList.add("is-started");
        var playAction = video.play();
        if (playAction && typeof playAction.catch === "function") {
          playAction.catch(function () {});
        }
      }

      if (button && video) {
        button.addEventListener("click", startPlayback);
      }
      if (video) {
        video.addEventListener("click", function () {
          if (!attached || video.paused) {
            startPlayback();
          }
        });
        video.addEventListener("play", function () {
          player.classList.add("is-started");
        });
        window.addEventListener("beforeunload", function () {
          if (hls) {
            hls.destroy();
          }
        });
      }
    });
  });
})();
