(function () {
    window.setupVideoPlayer = function (videoSource) {
        var video = document.querySelector("[data-player-video]");
        var cover = document.querySelector("[data-player-cover]");
        var attached = false;

        if (!video || !videoSource) {
            return;
        }

        function attach() {
            if (attached) {
                return;
            }

            attached = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = videoSource;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(videoSource);
                hls.attachMedia(video);
                return;
            }

            video.src = videoSource;
        }

        function start() {
            attach();
            video.controls = true;

            if (cover) {
                cover.classList.add("is-hidden");
            }

            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {});
            }
        }

        if (cover) {
            cover.addEventListener("click", start);
        }

        video.addEventListener("click", start);
    };
})();
