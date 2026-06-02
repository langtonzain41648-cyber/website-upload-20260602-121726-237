document.addEventListener('DOMContentLoaded', function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var existing = document.querySelector('script[src="' + src + '"]');
      if (existing) {
        existing.addEventListener('load', resolve, { once: true });
        existing.addEventListener('error', reject, { once: true });
        if (window.Hls) {
          resolve();
        }
        return;
      }

      var script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function setStatus(wrapper, text) {
    var status = wrapper.querySelector('[data-player-status]');
    if (status) {
      status.textContent = text;
    }
  }

  players.forEach(function (wrapper) {
    var video = wrapper.querySelector('video');
    var button = wrapper.querySelector('[data-play-button]');
    var source = wrapper.getAttribute('data-src');
    var hasStarted = false;
    var hlsInstance = null;

    function playVideo() {
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          setStatus(wrapper, '请再次点击播放按钮以开始播放');
        });
      }
    }

    function attachWithHls() {
      if (!window.Hls || !window.Hls.isSupported()) {
        setStatus(wrapper, '当前浏览器不支持 HLS 播放');
        return;
      }

      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60
      });

      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
        setStatus(wrapper, '播放源加载完成');
        playVideo();
      });
      hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          setStatus(wrapper, '播放源加载异常，请刷新后重试');
          hlsInstance.destroy();
        }
      });
    }

    function start() {
      if (hasStarted || !source || !video) {
        playVideo();
        return;
      }

      hasStarted = true;
      if (button) {
        button.classList.add('is-hidden');
      }
      setStatus(wrapper, '正在加载播放源…');

      if (video.canPlayType('application/vnd.apple.mpegurl') || video.canPlayType('application/x-mpegURL')) {
        video.src = source;
        video.addEventListener('loadedmetadata', function () {
          setStatus(wrapper, '播放源加载完成');
          playVideo();
        }, { once: true });
      } else {
        loadScript('https://cdn.jsdelivr.net/npm/hls.js@1.6.15/dist/hls.min.js')
          .then(attachWithHls)
          .catch(function () {
            setStatus(wrapper, 'HLS 播放组件加载失败');
          });
      }
    }

    if (button) {
      button.addEventListener('click', start);
    }

    video.addEventListener('play', function () {
      if (button) {
        button.classList.add('is-hidden');
      }
      setStatus(wrapper, '正在播放');
    });

    video.addEventListener('pause', function () {
      setStatus(wrapper, '已暂停');
    });

    video.addEventListener('ended', function () {
      setStatus(wrapper, '播放结束');
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
});
