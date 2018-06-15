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

  ipcMain.on("updateIssue", (event, {roomId, link, point, field, auth, fieldListUrl}) => {
    axios.request({
      url: fieldListUrl,
      method: "get",
      headers: { 'content-type': 'application/json' },
      responseType: 'json',
      auth: auth
    }).then(function(response) {
      pointField = response.data
        .find(jiraField => jiraField.name.toLowerCase() === field)
        .id
      console.log("===Update Issue")
      fieldsToUpdate = {}
      fieldsToUpdate[pointField] = point
      axios.request({
        url: link,
        method: "put",
        headers: { 'content-type': 'application/json' },
        responseType: 'json',
        auth: auth,
        data: {
          fields: fieldsToUpdate
        }
      }).then(function(response) {
        console.log(response)
        mainWindow.webContents.send("updateSuccess", {roomId, link, point})
      }).catch(function (error) {
        console.log(error);
      });
    }).catch(function (error) {
      console.log("===Fetch custom fields failure.")
      console.log(error);
    });
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