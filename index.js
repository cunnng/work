// @ts-check

function cunningWORK() {
  if (typeof window !== "undefined" && window?.navigator?.serviceWorker)
    return runBrowserWindow();
  else if (typeof self !== "undefined" && typeof self?.addEventListener === 'function')
    return runServiceWorker();

  async function runBrowserWindow() {
    console.log('cunningWORK: from runBrowserWindow');
    const registration = await navigator.serviceWorker.register(
      'index.js',
      {
        scope: location.pathname,
      }
    );

    if (registration.installing) {
      console.log("Service worker installing");
    } else if (registration.waiting) {
      console.log("Service worker installed");
    } else if (registration.active) {
      console.log("Service worker active");
    }

    window.addEventListener('message', e => handleFrameMessage(e));

    function handleFrameMessage(e) {
      if (typeof e.data?.path !== 'string')
        return console.warn('Unknown message ', e);

      navigator.serviceWorker.ready.then((registration) => {
        registration.active?.postMessage(e.data);
      });
    }
  }

  function runServiceWorker() {
    console.log('cunningWORK: from - runServiceWorker');

    self.addEventListener('activate', event => event.waitUntil(async () => {
      console.log('NOOP: activating service worker');
    }));

    self.addEventListener('installing', event => event.waitUntil(async () => {
      console.log('NOOP: installing service worker');
    }));

    self.addEventListener('message', e => {
      if (typeof e.data?.path !== 'string')
        return console.warn('Unknown message ', e);

      if (e.data.delete) {
        console.log('TODO: delete e.data.path ', e.data);
      } else {
        console.log('TODO: store e.data.content for e.data.path ', e.data);
      }

      console.log('TODO release queued requests waiting for the path');
    });


    console.log(() => {
      self.addEventListener('fetch', (event) => {
        console.log('TODO: queue any requests not matching in the cache');
        event.respondWith({})
      });
    });

    console.log('events registered OK');
  }

} cunningWORK();
