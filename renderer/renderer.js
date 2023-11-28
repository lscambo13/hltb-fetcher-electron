
const addButton = document.querySelector('#addButton')
const startButton = document.querySelector('#startButton')
const clearButton = document.querySelector('#clearButton')

const logArea = document.querySelector('#logArea')
const previewArea = document.querySelector('#previewArea')

const select = document.querySelector('#select')

clearButton.addEventListener('click', () => {
    bridgeApi.invoke('openRequest', 'resetQueue')
    logArea.textContent = ''
    previewArea.textContent = ''
    startButton.disabled = true
})

addButton.addEventListener('click', async (...args) => {
    bridgeApi.invoke('openRequest', 'selectDrive')
        .then((res) => {
            if (res != undefined) logPrint(res)
        })
})

startButton.addEventListener('click', async (...args) => {
    res = await bridgeApi.invoke('openRequest', 'startOperation')
})

bridgeApi.on('LOG', (args) => logPrint(args))
bridgeApi.on('PREVIEW', (args) => previewPrint(args))
bridgeApi.on('DOM', (args) => affectDOM(args))

const affectDOM = (args) => {
    if (args == 'enableStartButton') {
        startButton.disabled = false
    }
    if (args == 'clearBothLogBoxes') {
        logArea.textContent = ''
        previewArea.textContent = ''
    }
    if (args == 'clearLog') {
        logArea.textContent = ''
    }
    if (args == 'clearPreview') {
        previewArea.textContent = ''
    }
}


const logPrint = (args) => {
    logArea.textContent = logArea.textContent + args + '\n'
    logArea.scrollTop = logArea.scrollHeight
}

const previewPrint = (args) => {
    previewArea.textContent = previewArea.textContent + args + '\n'
    previewArea.scrollTop = previewArea.scrollHeight
}


