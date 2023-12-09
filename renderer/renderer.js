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
const canvasContent = document.querySelector('#canvasContent')

document.addEventListener('DOMContentLoaded', (event) => {
  bridgeApi.invoke('openRequest', 'autoPopulateQueue')
});

clearButton.addEventListener('click', () => {
  bridgeApi.invoke('openRequest', 'resetQueue')
})

getStartedButton.addEventListener('click', () => {
  heroContent.classList.add('shiftedToLeft')
  setTimeout(() => {
    heroContent.classList.add('displayNone')
    mainOptionsMenu.classList.remove('displayNone')
    mainContent.classList.remove('displayNone')
  }, 250)
  bridgeApi.invoke('fsRequest', ['checkExistingData', null])
})

quitButton.addEventListener('click', () => {
  bridgeApi.invoke('openRequest', 'restartAll')
})

const addClickHandlers = () => {
  const listItems = document.getElementsByClassName('listItem')
  for (let i = 0; i < listItems.length; i++) {
    let item = listItems[i];
    const openFolder = (event) => {
      event.stopPropagation()
      let e = event.target.closest('.listItem')
      e = e.querySelector('.listTitleSmall').textContent

      // e = e.childNodes[1].childNodes[3].childNodes[3].textContent
      // console.log(e)
      bridgeApi.invoke('fsRequest', ['explore', e])
    }
    if (item.getAttributeNode('data-hasListener').value == 'false') {
      item.addEventListener('click', (event) => openFolder(event))
    }
    item.setAttribute('data-hasListener', 'true')
  }

  const removeFromQueueButtons = document.getElementsByClassName('removeFromQueueButton')
  for (let i = 0; i < removeFromQueueButtons.length; i++) {
    let item = removeFromQueueButtons[i];
    const removeFromQueue = (event) => {
      event.stopPropagation()
      let e = event.target.closest('.listItem')
      let t = e.querySelector('.listTitleSmall').textContent
      // console.log(e.getAttributeNode('data-id').value)
      // e = e.childNodes[1].childNodes[3].childNodes[3].textContent
      bridgeApi.invoke('fsRequest', ['removeFromQueue', t])
      e.remove()
    }
    if (item.getAttributeNode('data-hasListener').value == 'false') {
      item.addEventListener('click', (event) => removeFromQueue(event), true)
    }
    item.setAttribute('data-hasListener', 'true')
  }

  const renameButtons = document.getElementsByClassName('renameButton')
  for (let i = 0; i < renameButtons.length; i++) {
    let item = renameButtons[i];
    const renameFolder = (event) => {
      event.stopPropagation()
      let e = event.target.closest('.listItem')
      // console.log(e.getAttributeNode('data-id').value)
      e = e.querySelector('.listTitleSmall').textContent
      // e = e.childNodes[1].childNodes[3].childNodes[3].textContent

      bridgeApi.invoke('fsRequest', ['rename', e])
    }
    if (item.getAttributeNode('data-hasListener').value == 'false') {
      item.addEventListener('click', (event) => renameFolder(event), true)
    }
    item.setAttribute('data-hasListener', 'true')
  }
}
addClickHandlers()

// const removeDriveFromQueue = (event) => {
//   // event.preventDefault()
//   console.log('removeDriveFromQueue', event.target)
// }
// document.getElementById('removeFromQueueButton')
//   .addEventListener('click', (event) => removeDriveFromQueue(event))

// const renameFolder = (event) => {
//   // event.preventDefault()
//   console.log('renameFolder', event.target)
// }
// document.getElementById('renameButton')
//   .addEventListener('click', (event) => renameFolder(event))


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
  // mainOptionsMenu.classList.add('displayNone')
  // mainContent.classList.add('displayNone')
  // logContent.classList.remove('displayNone')
  mainContent.classList.add('shiftedToLeft')
  mainOptionsMenu.classList.add('shiftedToLeft')
  setTimeout(() => {
    mainOptionsMenu.classList.add('displayNone')
    mainContent.classList.add('displayNone')
    logContent.classList.remove('displayNone')
  }, 500)



  res = await bridgeApi.invoke('openRequest', 'startOperation')
})

const sanitizeSlashes = (pathWithSlashes) => {
  return pathWithSlashes.replaceAll('\\', '//');
}

bridgeApi.on('PROGRESS', (args) => setProgress(args))
bridgeApi.on('TOTAL_SUBDIRS', (args) => setTotalSubDirs(args))
bridgeApi.on('TOTAL_DRIVES', (args) => setTotalDrives(args))
bridgeApi.on('DATA_EXISTS_ALREADY', (args) => setExistsIndicator(args))
bridgeApi.on('LOG', (args) => logPrint(args))
bridgeApi.on('DOM', (args) => affectDOM(args))
bridgeApi.on('PREVIEW', (args) => previewPrint(args))
bridgeApi.on('QUEUE_DRIVE', (args) => {
  let id = sanitizeSlashes(args[0])
  let title = args[1]
  let path = args[2]
  if (!title) title = path
  // let title = args[1]
  // let path = args[0]
  // if (title == '') {
  //   title = path
  //   path = ''
  // }
  let html = `
          <div data-id="${id}" data-hasListener="false" class="listItem driveItem">
            <span class="listTitle driveTitleBox">
              <span class="material-symbols-rounded-large">folder_open</span>
              <span>
                <div class="listTitleLarge">${title}</div>
                <div class="listTitleSmall">${path}</div>
              </span>
            </span>
            <div class="driveButtons">
              <button id="" data-hasListener="false" class="listButton removeFromQueueButton">
                <span class="material-symbols-rounded-tiny">remove</span>
              </button>
            </div>
          </div>
            `
  driveViewArea.insertAdjacentHTML('beforeend', html)
  addClickHandlers()
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

const setTotalSubDirs = (args) => {
  document
    .querySelector('#totalSubDirs')
    .innerHTML = `Subfolders detected (${args})`
}

const setTotalDrives = (args) => {
  document
    .querySelector('#totalDrives')
    .innerHTML = `Folders to scan (${args})`
}


const setExistsIndicator = (args) => {
  let dataID = document.querySelector(`[data-id="${sanitizeSlashes(args)}"]`)
  let pass = dataID.querySelector('.folderPassed')
  let fail = dataID.querySelector('.folderFailed')
  pass.classList.remove('displayNone')
  fail.classList.add('displayNone')

}

const previewPrint = (args) => {
  let id = sanitizeSlashes(args[0])
  let title = args[1]
  let path = args[2]
  // if (title == '') {
  //   title = path
  // }
  let html = `
          <div data-id="${id}" data-hasListener="false" class="listItem folderItem">
            <span class="listTitle folderTitleBox">
              <span class="material-symbols-rounded-large">subdirectory_arrow_right</span>
              <span>
                <div class="listTitleLarge">${title}</div>
                <div class="listTitleSmall">${path}</div>
              </span>
            </span>
            <div class="folderButtons">
              <button id="" data-hasListener="false" class="listButton renameButton showOnHover">
                <span class="material-symbols-rounded-tiny">bookmark_manager</span>
              </button>
              <button class="listButton folderPassed displayNone">
                <span class="material-symbols-rounded-tiny">check</span>
              </button>
              <button class="listButton folderFailed">
                <span class="material-symbols-rounded-tiny">close</span>
              </button>
            </div>
          </div>
            `
  folderViewArea.insertAdjacentHTML('beforeend', html)
  addClickHandlers()
  // folderViewArea.textContent = folderViewArea.textContent + args + '\n'
  // folderViewArea.scrollTop = folderViewArea.scrollHeight
}

addButton.addEventListener('click', addToQueue)
// addButtonLarge.addEventListener('click', addToQueue)

// const resetQueue = () => {
//     // addButtonLarge.removeEventListener('click', addToQueue)
//     driveViewArea.innerHTML = `
//             <div id="addButtonLarge" class="listItem driveItem">
//               <span class="listTitle">
//                 <span class="material-symbols-rounded-large">add</span>
//                 Add Game Drive</span>
//             </div>`
// }


