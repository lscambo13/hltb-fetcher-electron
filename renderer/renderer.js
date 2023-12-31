const getStartedButton = document.querySelector('#getStartedButton')
const addButton = document.querySelector('#addButton')
const quitButton = document.querySelector('#quitButton')

const updateNotification = document.querySelector('#updateNotification')
const debugMenu = document.querySelector('#debugMenu')
const viewReportButtonDebug = document.querySelector('#viewReportButtonDebug')
const toggleNotificationButtonDebug = document
  .querySelector('#toggleNotificationButtonDebug')

const moreButton = document.querySelector('#moreButton')
const moreOptions = document.querySelector('.moreOptions')

const heroContent = document.querySelector('#heroContent')
const mainOptionsMenu = document.querySelector('#mainOptionsMenu')
const mainContent = document.querySelector('#mainContent')
const emptyQueueBox = document.querySelector('#emptyQueueBox')
const logContent = document.querySelector('#logContent')

const addButtonLarge = document.querySelector('#addButtonLarge')
const startButton = document.querySelector('#startButton')
const viewReportButton = document.querySelector('#viewReportButton')
const restartAppButton = document.querySelector('#restartAppButton')
const clearButton = document.querySelector('#clearButton')
const driveViewArea = document.querySelector('#driveViewArea')
const folderViewArea = document.querySelector('#folderViewArea')
const logTextArea = document.querySelector('#logTextArea')
const select = document.querySelector('#select')
const progressBar = document.querySelector('#progressBar')
const canvasContent = document.querySelector('#canvasContent')

const viewReport = () => {
  bridgeApi.invoke('endGameRequest', 'openFinalReportWindow')
}

document.addEventListener('DOMContentLoaded', (event) => {
  bridgeApi.invoke('openRequest', 'DOMContentLoaded')
  addClickHandlers()
  document.addEventListener('click', (event) => {
    switch (event.target.id) {
      case 'moreButton': {
        expandMoreOptions(event)
        break;
      }
      case 'value': {
        break;
      }
      default: {
        collapseMoreOptions(event)
        break;
      }
    }
  })

  document.querySelectorAll('.moreOptionItem').forEach((value) => {
    value.addEventListener('click', (e) => {
      e.stopPropagation()
    })
  })

  document.querySelectorAll('.checkbox').forEach((value) => {
    bridgeApi.invoke('fsRequest', [value.id, value.checked])
    value.addEventListener('click', (e) => {
      bridgeApi.invoke('fsRequest', [value.id, value.checked])
      console.log(value.id, value.checked)
    })
  })


  clearButton.addEventListener('click', () => {
    bridgeApi.invoke('openRequest', 'resetQueue')
  })

  restartAppButton.addEventListener('click', () => {
    bridgeApi.invoke('openRequest', 'restartApp')
  })

  getStartedButton.addEventListener('click', () => {
    heroContent.classList.add('shiftedToLeft')
    setTimeout(() => {
      heroContent.classList.add('displayNone')
      mainOptionsMenu.classList.remove('displayNone')
      bridgeApi.invoke('openRequest', 'autoPopulateQueue')
    }, 250)
  })

  quitButton.addEventListener('click', () => {
    bridgeApi.invoke('openRequest', 'quitApp')
  })
  startButton.addEventListener('click', async (...args) => {
    mainContent.classList.add('shiftedToLeft')
    mainOptionsMenu.classList.add('shiftedToLeft')
    setTimeout(() => {
      mainOptionsMenu.classList.add('displayNone')
      mainContent.classList.add('displayNone')
      logContent.classList.remove('displayNone')
    }, 500)
    res = await bridgeApi.invoke('openRequest', 'startOperation')
  })

  toggleNotificationButtonDebug.addEventListener('click', () =>
    updateNotification.classList.toggle('displayNone'))
  addButton.addEventListener('click', addToQueue)
  viewReportButton.addEventListener('click', viewReport)
  viewReportButtonDebug.addEventListener('click', viewReport)
});

let expandMoreOptions = (e) => {
  let position = moreButton.getBoundingClientRect()
  if (moreOptions.classList.contains('displayNone')) {
    moreOptions.style.left = position.left + "px";
    moreOptions.style.top = position.bottom + 8 + "px";
    moreOptions.classList.remove('displayNone')
    setTimeout(() => {
      moreOptions.style.height = '92px'
    }, 1)
  } else collapseMoreOptions(e)

}

let collapseMoreOptions = (e) => {
  if (e.target.closest('moreOptionItem')) return
  if (!moreOptions.classList.contains('displayNone')) {
    moreOptions.style.height = '0px'
    setTimeout(() => {
      moreOptions.classList.add('displayNone')
    }, 100)
  }
}

const addClickHandlers = () => {
  const listItems = document.getElementsByClassName('listItem')
  for (let i = 0; i < listItems.length; i++) {
    let item = listItems[i];
    const openFolder = (event) => {
      event.stopPropagation()
      let e = event.target.closest('.listItem')
      e = e.querySelector('.listTitleSmall').textContent

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
      e = e.querySelector('.listTitleSmall').textContent

      bridgeApi.invoke('fsRequest', ['rename', e])
    }
    if (item.getAttributeNode('data-hasListener').value == 'false') {
      item.addEventListener('click', (event) => renameFolder(event), true)
    }
    item.setAttribute('data-hasListener', 'true')
  }
}

const addToQueue = () => {
  bridgeApi.invoke('openRequest', 'selectDrive')
    .then((res) => {
      if (res != undefined) logPrint(res)
    })
}

const sanitizeSlashes = (pathWithSlashes) => {
  return pathWithSlashes.replaceAll('\\', '//');
}

const setProgress = (args) => {
  console.log('Progress ', args)
  progressBar.value = args
}

const logPrint = (args) => {
  logTextArea.textContent = logTextArea.textContent + args + '\n'
  logTextArea.scrollTop = logTextArea.scrollHeight
}

const setTotalSubDirs = (args) => {
  document
    .querySelector('#totalSubDirs')
    .innerHTML = `Subfolders detected (${args})`
  bridgeApi.invoke('fsRequest', ['checkExistingData', null])

}

const setTotalDrives = (args) => {
  if (args == 0) {
    emptyQueueBox.classList.remove('displayNone')
    mainContent.classList.add('displayNone')
  } else {
    emptyQueueBox.classList.add('displayNone')
    mainContent.classList.remove('displayNone')
  }
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
              <button class="listButton folderPassed displayNone" title="Data exists already">
                <span class="material-symbols-rounded-tiny">check</span>
              </button>
              <button class="listButton folderFailed"  title="Data does not exist">
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
  }
  else if (args == 'disableStartButton') {
    startButton.disabled = true
  }
  else if (args == 'enableAddButton') {
    addButton.disabled = false
  }
  else if (args == 'enableViewReportButton') {
    viewReportButton.disabled = false
  }
  else if (args == 'exposeDebugMenu') {
    debugMenu.classList.remove('displayNone')
  }
  else if (args == 'disableAddButton') {
    addButton.disabled = true
  }
  else if (args == 'clearBothLogBoxes') {
    driveViewArea.textContent = ''
    folderViewArea.textContent = ''
  }
  else if (args == 'clearLog') {
    driveViewArea.textContent = ''
    logTextArea.textContent = ''
  }
  else if (args == 'clearPreview') {
    folderViewArea.textContent = ''
  }
  else if (args == 'requestLog') {
    bridgeApi.invoke('hereIsTheLog', logTextArea.textContent)
  }
}