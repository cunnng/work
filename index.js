// @ts-check

function cunningWORK() {
  if (typeof window !== "undefined" && window?.navigator?.serviceWorker)
    return runBrowserWindow();
  else if (typeof self !== "undefined" && typeof self?.Array === 'function')
    return runServiceWorker();

  async function runBrowserWindow() {
    console.log('cunningWORK: from runBrowserWindow');
    const registration = await navigator.serviceWorker.register(
      'index.js',
      {
        scope: location.pathname,
      }
    );
  }

  function runServiceWorker() {
    console.log('cunningWORK: from - runServiceWorker');
    // navigator.serviceWorker.addEventListener('message', e => {
    //     console.log(e.data);
    // });
  }

} cunningWORK();
