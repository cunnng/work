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

    const cache = await caches.open('v1');

    installCache();
    registerServiceWorker();

    window.addEventListener('message', e => handleFrameMessage(e));

    initUI();

    async function initUI() {
      document.title = 'Cunning WORK';
      const content = document.createElement('div');
      content.innerHTML = `
      <h1>Cunning WORK</h1>
      <p>
      <div><input id=addPath placeholder=path> <button id=addButton>Add</button></div>
      <textarea id=addContent></textarea>
      </p>
      `;
      if (!document.body) document.body = document.createElement('body');
      document.body.appendChild(content);

      const addButton = /** @type {HTMLButtonElement} */(document.getElementById('addButton'));
      addButton.onclick = handleAddClick;

      var ul;

      const cacheKeys = await cache.keys();
      if (cacheKeys?.length) {
        
        listCache();
      }

      async function handleAddClick() {
        const addPath = /** @type {HTMLInputElement} */(document.getElementById('addPath'));
        const addContent = /** @type {HTMLTextAreaElement} */(document.getElementById('addContent'));

        addPath.disabled = true;
        addContent.disabled = true;
        let succeed = false;
        try {

          await handleFrameMessage({
            data: {
              path: addPath.value,
              content: addContent.value
            }
          });

          succeed = true;
        } finally {
          addPath.disabled = false;
          addContent.disabled = false;

          listCache();

          if (!succeed) alert('Failed.');
        }

      }

      function listCache() {
        if (!ul) {
          ul = document.createElement('ul');
          document.body.appendChild(ul);
        } else {
          ul.innerHTML = '';
        }

        for (const key of cacheKeys) {
          const linkLI = document.createElement('li');
          const linkA = document.createElement('a');
          linkA.target = '_blank';
          linkA.href = key.url;
          linkA.textContent = key.url;
          linkLI.appendChild(linkA);
          ul.appendChild(linkLI);
        }
      }
    }

    async function installCache() {
      const cache = await caches.open('v1');
      await cache.put('/work/', new Response('<' + 'script' + ' src=index.js></' + 'script' + '>\n<' + '!-- injected --' + '>', { headers: { 'Content-Type': 'text/html' } }));
      await cache.put('/work/index.js', new Response('// @ts-check\n\n' + cunningWORK + ' cunningWORK();\n', { headers: { 'Content-Type': 'application/javascript' } }));
    }

    async function registerServiceWorker() {
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

    async function handleFrameMessage(e) {
      if (typeof e.data?.path !== 'string')
        return console.warn('Unknown message ', e);

      if (e.data.delete) {
        console.log('Deleting ', e.data);
        cache.delete(e.data.path);
      } else {
        const contentType = e.data.contentType || deriveContentType(e.data.path);
        console.log('Storing ', e.data, contentType);
        cache.put(e.data.path, new Response(e.data.content, { headers: { 'Content-Type': contentType } }));
      }

      navigator.serviceWorker.ready.then((registration) => {
        registration.active?.postMessage({ path: e.data.path  });
      });
    }

    function deriveContentType(path) {
      if (/\.html$/i.test(path)) return 'text/html';
      if (!/\./.test(path)) return 'text/html';
      if (/\.js$/i.test(path)) return 'application/javascript';
      if (/\.css$/i.test(path)) return 'text/css';
      if (/\.png$/i.test(path)) return 'image/png';
      if (/\.jpg$/i.test(path)) return 'image/jpeg';
      if (/\.jpeg$/i.test(path)) return 'image/jpeg';
      if (/\.gif$/i.test(path)) return 'image/gif';
    }
  }

  function runServiceWorker() {
    console.log('cunningWORK: from - runServiceWorker');
    const cacheOrPromise = caches.open('v1');

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


    self.addEventListener('fetch', (event) => {
      console.log('fetch ', event.request);
      event.respondWith((async () => {
        const cache = await cacheOrPromise;
        return cache.match(event.request);
      })());
    });

    console.log('events registered OK');
  }

} cunningWORK();
