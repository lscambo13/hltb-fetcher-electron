const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('node:path')
const fs = require('fs')
const { ipcRenderer } = require('electron/renderer')

process.env.NODE_ENV = 'development'

const isDev = process.env.NODE_ENV === 'development'
let mainWin;
let workDirs = [];

const createMainWindow = () => {
    mainWin = new BrowserWindow({
        width: isDev ? 1000 : 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            enableRemoteModule: false,
            contextIsolation: true,
            sandbox: true
        },
    })
    mainWin.loadFile(path.join(__dirname, 'renderer/index.html'))
    if (isDev) mainWin.webContents.openDevTools()
}

app.whenReady().then(() => {
    createMainWindow()
    mainWin.on('closed', () => (mainWin = null));
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

// #####################################

ipcMain.on('chann', (event, ...args) => {
    console.log(args)
})

// ipcMain.('received', (event, ...args) => {
//     return 'ok good'
// })
