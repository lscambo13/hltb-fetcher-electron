
const addButton = document.querySelector('#addButton')
const startButton = document.querySelector('#startButton')
const clearButton = document.querySelector('#clearButton')

const driveViewArea = document.querySelector('#driveViewArea')
const folderViewArea = document.querySelector('#folderViewArea')

const select = document.querySelector('#select')

clearButton.addEventListener('click', () => {
    bridgeApi.invoke('openRequest', 'resetQueue')
    driveViewArea.textContent = ''
    folderViewArea.textContent = ''
    startButton.disabled = true
    addButton.disabled = false
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
bridgeApi.on('DOM', (args) => affectDOM(args))

bridgeApi.on('PREVIEW', (args) => previewPrint(args))

bridgeApi.on('QUEUE_DRIVE', (args) => {
    let html = `<div class="listItem driveItem">
              <span class="listTitle">${args}</span>         
            <div class="driveButtons">
            <button class="listButton">A</button>
          </div>
        </div>`
    driveViewArea.innerHTML = driveViewArea.innerHTML + html
})


const affectDOM = (args) => {
    if (args == 'enableStartButton') {
        startButton.disabled = false
    }
    if (args == 'disableStartButton') {
        startButton.disabled = true
    }
    if (args == 'enableAddButton') {
        addButton.disabled = false
    }
    if (args == 'disableAddButton') {
        addButton.disabled = true
    }
    if (args == 'clearBothLogBoxes') {
        driveViewArea.textContent = ''
        folderViewArea.textContent = ''
    }
    if (args == 'clearLog') {
        driveViewArea.textContent = ''
    }
    if (args == 'clearPreview') {
        folderViewArea.textContent = ''
    }
}


const logPrint = (args) => {
    console.log(args)
    // driveViewArea.textContent = driveViewArea.textContent + args + '\n'
    // driveViewArea.scrollTop = driveViewArea.scrollHeight
}

const previewPrint = (args) => {
    let html = `<div class="listItem folderItem">
        <span class="listTitle">${args}</span>
        <div class="folderButtons">
            <button class="listButton">A</button>
            <button class="listButton">B</button>
        </div></div>`
    folderViewArea.innerHTML = folderViewArea.innerHTML + html
    // folderViewArea.textContent = folderViewArea.textContent + args + '\n'
    // folderViewArea.scrollTop = folderViewArea.scrollHeight
}


