
const addButton = document.querySelector('#addButton')
const addButtonLarge = document.querySelector('#addButtonLarge')
const startButton = document.querySelector('#startButton')
const clearButton = document.querySelector('#clearButton')
const driveViewArea = document.querySelector('#driveViewArea')
const folderViewArea = document.querySelector('#folderViewArea')
const select = document.querySelector('#select')

clearButton.addEventListener('click', () => {
    bridgeApi.invoke('openRequest', 'resetQueue')
    // driveViewArea.textContent = ''
    // folderViewArea.textContent = ''
    // startButton.disabled = true
    // addButton.disabled = false
})

const addToQueue = () => {
    bridgeApi.invoke('openRequest', 'selectDrive')
        .then((res) => {
            if (res != undefined) logPrint(res)
        })
}

startButton.addEventListener('click', async (...args) => {
    res = await bridgeApi.invoke('openRequest', 'startOperation')
})

bridgeApi.on('LOG', (args) => logPrint(args))
bridgeApi.on('DOM', (args) => affectDOM(args))
bridgeApi.on('PREVIEW', (args) => previewPrint(args))
bridgeApi.on('QUEUE_DRIVE', (args) => {
    let title = args[1]
    let path = args[0]
    if (title == '') {
        title = path
        path = ''
    }
    let html = `
            <div class="listItem driveItem">
              <span class="listTitle driveTitleBox">
                <span class="material-symbols-rounded-large">folder_open</span>
                <span>
                  <div class="listTitleLarge">${title}</div>
                  <div class="listTitleSmall">${path}</div>
                </span>
              </span>
              <div class="driveButtons">
                <button class="listButton">
                  <span class="material-symbols-rounded-tiny">remove</span>
                </button>
              </div>
            </div>
            `
    driveViewArea.insertAdjacentHTML('afterbegin', html)

})


const affectDOM = (args) => {
    if (args == 'enableStartButton') {
        startButton.disabled = false
        document.querySelector('#mainContent')
            .classList.remove('displayNone')
    }
    if (args == 'disableStartButton') {
        startButton.disabled = true
        document.querySelector('#mainContent')
            .classList.add('displayNone')
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
    let title = args[1]
    let path = args[0]
    if (title == '') {
        title = path
        path = ''
    }
    let html = `
            <div class="listItem folderItem">
              <span class="listTitle folderTitleBox">
                <span class="material-symbols-rounded-large">subdirectory_arrow_right</span>
                <span>
                  <div class="listTitleLarge">${title}</div>
                  <div class="listTitleSmall">${path}</div>
                </span>
              </span>
              <div class="folderButtons">
                <button class="listButton showOnHover">
                  <span class="material-symbols-rounded-tiny">bookmark_manager</span>
                </button>
                <button class="listButton folderPassed displayNone">
                  <span class="material-symbols-rounded-tiny">check</span>
                </button>
                <button class="listButton folderFailed displayNone">
                  <span class="material-symbols-rounded-tiny">close</span>
                </button>
              </div>
            </div>
            `
    folderViewArea.insertAdjacentHTML('beforeend', html)
    // folderViewArea.textContent = folderViewArea.textContent + args + '\n'
    // folderViewArea.scrollTop = folderViewArea.scrollHeight
}

addButton.addEventListener('click', addToQueue)
addButtonLarge.addEventListener('click', addToQueue)

// const resetQueue = () => {
//     // addButtonLarge.removeEventListener('click', addToQueue)
//     driveViewArea.innerHTML = `
//             <div id="addButtonLarge" class="listItem driveItem">
//               <span class="listTitle">
//                 <span class="material-symbols-rounded-large">add</span>
//                 Add Game Drive</span>
//             </div>`
// }


