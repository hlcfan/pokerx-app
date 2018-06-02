const { app, BrowserWindow, Menu, webContents, ipcMain, net } = require('electron');
const axios = require('axios');
const path = require('path');

let mainWindow;
let webviewId;

app.on('ready', () => {
  mainWindow = new BrowserWindow({width: 1200, height: 800});
  mainWindow.loadURL(path.join('file://', __dirname, 'index.html'));
  mainWindow.openDevTools({ mode: 'bottom' });
  createMenu();

  ipcMain.on("updateIssue", (event, {link, point, auth}) => {
    console.log("===Update Issue")
    axios.request({
      url: link,
      method: "put",
      headers: { 'content-type': 'application/json' },
      responseType: 'json',
      auth: auth,
      data: {
        fields: {
          customfield_10006: point
        }
      }
    }).then(function(response) {
      console.log(response)
    })
  })
});

// get the webview's webContents
function getWebviewWebContents() {
  return webContents.getAllWebContents()
    // TODO replace `localhost` with whatever the remote web app's URL is
    .filter(wc => wc.getURL().search(/a3.active.local/gi) > -1)
    .pop();
}

function createMenu() {

  const topLevelItems = [
    {
      label: 'Application',
      submenu: [
        {
          label: 'Quit',
          accelerator: 'CmdOrCtrl+Q',
          click() {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' },
        { label: 'Select All', accelerator: 'CmdOrCtrl+A', role: 'selectall' }
      ]
    },
    {
      label: 'Actions',
      submenu: [
        {
          label: 'Mark All As Complete',
          click() {
            // send an IPC message to the webview for handling
            const wc = getWebviewWebContents();
            wc.send("alert(1)")
            wc.send('updateIssue', "ACOM-7823");
          }
        }
      ]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(topLevelItems));
}