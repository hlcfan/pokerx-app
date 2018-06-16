const { ipcRenderer, remote } = require('electron');
const axios = require('axios');
// require('devtron').install();

const $webview = document.querySelector('webview');
const $loader = document.querySelector('.loader');
let isInitialLoad = true;

const { shell } = require('electron');
//open links externally by default
$webview.addEventListener('new-window', (e) => {
  const protocol = require('url').parse(e.url).protocol
  if (protocol === 'http:' || protocol === 'https:') {
    shell.openExternal(e.url);
  }
})

$webview.addEventListener('did-start-loading', () => {
  // we use client side rendering so the loader is only needed on the first page load
  if(isInitialLoad) {
    $webview.classList.add('hide');
    $loader.classList.remove('loader-hide');
    isInitialLoad = false;
  }
});

$webview.addEventListener('dom-ready', () => {
  $webview.classList.remove('hide');
  // have to delay in order for the webview show/resize to settle
  setTimeout(() => {
    $loader.classList.add('loader-hide');
  }, 100);
});

ipcRenderer.on("updateSuccess", (event, {roomId, link, point}) => {
  axios.request({
    url: `http://a3.active.local:3000/rooms/${roomId}/sync_status`,
    method: "post",
    headers: { 'content-type': 'application/json' },
    data: {
      link: link,
      point: point
    }
  }).then(function(response) {
    console.log("Sync status success!")
  })
})

// this is just for development convenience
// (because the todo app's dev tools are in a separate process)
window.openWebviewDevTools = () => {
  $webview.getWebContents().openDevTools();
};