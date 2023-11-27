const { contextBridge, ipcRenderer } = require('electron');

// process.once('loaded', () => {
//     window.addEventListener('message', evt => {
//         if (evt.data.type === 'select-dirs') {
//             ipcRenderer.send('select-dirs')
//         }
//     })
// })

contextBridge.exposeInMainWorld('bridgeApi', {
    send: (channel, data) => ipcRenderer.send(channel, data),
    // sendData: (channel, data) => mainWin.webContents.send(channel, data),
    invoke: (channel, data) => ipcRenderer.invoke(channel, data),
    on: (channel, func) =>
        ipcRenderer.on(channel, (event, ...args) => func(...args)),
});
