import { H as Hls } from './hls-vendor.js';

document.querySelectorAll('[data-player]').forEach((player) => {
  const video = player.querySelector('video');
  const trigger = player.querySelector('.play-cover');

  if (!video || !trigger) {
    return;
  }

  const streamUrl = video.getAttribute('data-hls') || '';
  let ready = false;
  let hls = null;

  const prepare = () => {
    if (ready || !streamUrl) {
      return;
    }

    ready = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      return;
    }

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      return;
    }

    video.src = streamUrl;
  };

  const play = () => {
    prepare();
    player.classList.add('is-playing');
    video.play().catch(() => {});
  };

  trigger.addEventListener('click', play);

  video.addEventListener('click', () => {
    if (!ready || video.paused) {
      play();
    }
  });

  video.addEventListener('play', () => {
    player.classList.add('is-playing');
  });

  video.addEventListener('pause', () => {
    if (video.currentTime === 0) {
      player.classList.remove('is-playing');
    }
  });
});
