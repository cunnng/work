// @ts-check

function cunningWORK() {
  if (typeof window !== "undefined" && window?.navigator?.serviceWorker)
    return runBrowserWindow();
  else if (typeof self !== "undefined" && typeof self?.addEventListener === 'function')
    return runServiceWorker();

  async function runBrowserWindow() {
    // <link rel="shortcut icon" href="src/cunning-work.png" type="image/png">
    // <link rel="icon" href="src/cunning-work.png" type="image/png">
    // <link rel="apple-touch-icon" href="src/cunning-work.png" type="image/png">

    let cacheOrPromise = typeof caches === 'undefined' ? undefined : caches?.open('v1');
    if (cacheOrPromise) cacheOrPromise.then(cache => cacheOrPromise = cache);

    registerServiceWorker();

    window.addEventListener('message', e => handleFrameMessage(e));

    async function initUI() {
      document.title = 'Cunning WORK';
      const content = document.createElement('div');
      content.innerHTML = `
      <h1>Cunning WORK</h1>
      <p>
      <div><input id=addPath placeholder=path> <button id=addButton>Add</button></div>
      <textarea id=addContent>
      </p>
      `;
      document.appendChild(content);

      document.getElementById('addButton').onclick = handleAddClick;

      const cacheKeys = await (await cacheOrPromise)?.keys();
      if (cacheKeys?.length) {
        const ul = document.createElement('ul');
        for (const key of cacheKeys) {
          const linkLI = document.createElement('li');
          const linkA = document.createElement('a');
          linkA.target = '_blank';
          linkA.href = key.url;
          linkA.textContent = key.url;
          linkLI.appendChild(linkA);
          ul.appendChild(linkLI);
        }
        content.appendChild(ul);
      }

      async function handleAddClick() {
        /** @type {HTMLInputElement} */
        const addPath = document.getElementById('addPath');
        /** @type {HTMLTextAreaElement} */
        const addContent = document.getElementById('addContent');

        addPath.disabled = true;
        addContent.disabled = true;
        let succeed = false;
        try {

          const cache = await cacheOrPromise;
          await handleFrameMessage({
            data: {
              path: addPath.value,
              content: new Response(addContent.value)
            }
          });

          succeed = true;
        } finally {
          addPath.disabled = false;
          addContent.disabled = false;

          if (!succeed) alert('Failed.');
        }

      }
    }

    function registerServiceWorker() {
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
    }

    function handleFrameMessage(e) {
      if (typeof e.data?.path !== 'string')
        return console.warn('Unknown message ', e);

      if (e.data.delete) {
        console.log('Deleting ', e.data);
        (await cacheOrPromise)?.delete(e.data.path);
      } else {
        console.log('Storing ', e.data);
        (await cacheOrPromise)?.put(e.data.path, new Response(e.data.content));
      }

      navigator.serviceWorker.ready.then((registration) => {
        registration.active?.postMessage({ path: e.data.path  });
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
