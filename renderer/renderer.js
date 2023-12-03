const getStartedButton = document.querySelector('#getStartedButton')
const addButton = document.querySelector('#addButton')
const quitButton = document.querySelector('#quitButton')

const heroContent = document.querySelector('#heroContent')
const mainOptionsMenu = document.querySelector('#mainOptionsMenu')
const mainContent = document.querySelector('#mainContent')
const logContent = document.querySelector('#logContent')

const addButtonLarge = document.querySelector('#addButtonLarge')
const startButton = document.querySelector('#startButton')
const clearButton = document.querySelector('#clearButton')
const driveViewArea = document.querySelector('#driveViewArea')
const folderViewArea = document.querySelector('#folderViewArea')
const logTextArea = document.querySelector('#logTextArea')
const select = document.querySelector('#select')
const progressBar = document.querySelector('#progressBar')


clearButton.addEventListener('click', () => {
  bridgeApi.invoke('openRequest', 'resetQueue')
})

getStartedButton.addEventListener('click', () => {
  heroContent.classList.add('displayNone')
  mainOptionsMenu.classList.remove('displayNone')
  mainContent.classList.remove('displayNone')
})

quitButton.addEventListener('click', () => {
  bridgeApi.invoke('openRequest', 'restartAll')
})

const addToQueue = () => {
  bridgeApi.invoke('openRequest', 'selectDrive')
    .then((res) => {
      if (res != undefined) logPrint(res)
    })
}

// document.querySelector('body').addEventListener('click', () => {
//   console.log('cc')
//   // document.querySelector('.svg-wrapper').setAttribute
//   // document.querySelector('#svg-wrapper').classList.toggle('active')
// })

startButton.addEventListener('click', async (...args) => {
  // startButton.disabled = true
  mainOptionsMenu.classList.add('displayNone')
  mainContent.classList.add('displayNone')
  logContent.classList.remove('displayNone')
  res = await bridgeApi.invoke('openRequest', 'startOperation')
})

bridgeApi.on('PROGRESS', (args) => setProgress(args))
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
    // document.querySelector('#mainContent')
    //   .classList.remove('displayNone')
  }
  if (args == 'disableStartButton') {
    startButton.disabled = true
    // document.querySelector('#mainContent')
    //   .classList.add('displayNone')
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
    logTextArea.textContent = ''
  }
  if (args == 'clearPreview') {
    folderViewArea.textContent = ''
  }
  if (args == 'requestLog') {
    bridgeApi.invoke('hereIsTheLog', logTextArea.textContent)
  }
}

const setProgress = (args) => {
  console.log(args)
  progressBar.value = args
}

const logPrint = (args) => {
  console.log(args)
  logTextArea.textContent = logTextArea.textContent + args + '\n'
  logTextArea.scrollTop = logTextArea.scrollHeight
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


