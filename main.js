const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron')
const path = require('node:path')
const fs = require('fs')
const stream = require('stream')
const hltb = require('howlongtobeat')
const hltbService = new hltb.HowLongToBeatService()

process.env.NODE_ENV = 'prod'

const isDev = process.env.NODE_ENV === 'dev'
let mainWin;
let forceOverwrite = true;
let downloadCoverArts = true;

let gamesScanned = 0
let totalGamesToScan = 0
let counterGamesFound = 0
let counterGamesNotFound = 0

// let totalProgress;
let currentProgress;

class GameObject {
    constructor(name, dir, mainTime, extraTime, completeTime, url) {
        this.gameName = name,
            this.gameDir = dir,
            this.gameTimes = [mainTime, extraTime, completeTime],
            this.coverUrl = url
    }
}
let gameCovers = []
let fullGamePaths = []

let allGames = []

let failedGames = []
let failedGameDirs = []
let passedGames = []
let passedGameDir = []

let finalLogPath;

const resetQueues = () => {
    driveQueueSet.clear()
    subDirectoriesSet.clear()
    gamePaths = []
    gameFolders = []

    sendMsg(subDirectoriesSet.size, 'TOTAL_SUBDIRS')
    sendMsg(driveQueueSet.size, 'TOTAL_DRIVES')
    sendMsg('clearPreview', 'DOM')
    sendMsg('clearLog', 'DOM')
    sendMsg('disableStartButton', 'DOM')
}

let logDiag;
const createMainWindow = () => {
    mainWin = new BrowserWindow({
        width: isDev ? 1440 : 1024,
        height: 720,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            enableRemoteModule: false,
            contextIsolation: true,
            sandbox: true
        },
        // transparent: true,
        resizable: true,
        // backgroundMaterial: 'mica',
        // backgroundColor: '#333333',
        autoHideMenuBar: true,
    })

    logDiag = (title, msg, detail) => {
        dialog.showMessageBox(mainWin, {
            message: msg,
            // buttons: ['b1', 'b2', 'c1'],
            // checkboxLabel: 'check?',
            title: title,
            // defaultId: 1,
            detail: detail,
            type: 'info',
            // cancelId: 2
        }).then((res) => {
            console.log(res, res.response)
        }).catch((err) => console.log(err))
    }

    mainWin.loadFile(path.join(__dirname, 'renderer/index.html'))
    if (isDev) mainWin.webContents.openDevTools()

    // console.log(giveMeTime())
}

app.whenReady().then(() => {
    createMainWindow()
    mainWin.on('closed', () => (mainWin = null));
}).catch((error) => {
    console.log(error)
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

function sendMsg(msg, channel = 'LOG') {
    mainWin.webContents.send(channel, msg)
}

// #####################################

function unCamelCase(str) {
    let newStr = str.replace(/([a-z])([A-Z])|([A-Za-z])(\d+)/g, '$1$3 $2$4')
        .replace(/(\d+)([A-Za-z])/g, '$1 $2')
        .replace(/([A-Z])(?=[A-Z][a-z])|(\d+)([A-Za-z])/g, '$1$2 $3');
    // newStr.replace(/([A-Za-z])(\d)/g, '$1 $2');
    if (newStr != str) {
        sendMsg(`Name Error: Converting '${str}' to '${newStr}'`, 'LOG')
    }
    return newStr
}

const giveMeTime = () => {
    let d = new Date()
    let m = d.getMonth()
    let t = d.toLocaleTimeString('en-us')
    t = t.replace(':', '.')
    t = t.replace(':', '.')
    t = t.replace(' ', '.')
    return `${d.getFullYear()}-${++m}-${d.getDate()} ${t}`
}

const logToDisk = (code) => {
    sendMsg('Generating consolidated report', 'LOG')
    allGames.forEach((val, index) => {
        // console.log(val)
    })

    let saveDir = path.join(process.env.HOME, `HLTB_Fetcher/`)
    if (!fs.existsSync(saveDir)) {
        fs.mkdirSync(saveDir)
        sendMsg(`Directory created: ${saveDir}`, 'LOG')
    }
    saveDir = path.join(saveDir, giveMeTime())
    fs.mkdirSync(saveDir)
    sendMsg(`Saving report to ${saveDir}`, 'LOG')

    let finalReport = path.join(saveDir, `/report.json`)
    fs.writeFileSync(finalReport,
        JSON.stringify(allGames)
    )
    sendMsg(`Saved final report: ${finalReport}`, 'LOG')

    finalLogPath = path.join(saveDir, `/log.log`)
    sendMsg(`requestLog`, 'DOM')
    if (code == 0) sendMsg(++currentProgress, 'PROGRESS')
}

const log = () => {

    // let logDiag = dialog.showMessageBox(mainWin, { message: 'OK' })
    // logDiag.then((res) => console.log(res, res.response))

    // sendMsg(`\n`, 'LOG')
    // sendMsg(`# # # #   R E S U L T S   # # # #`, 'LOG')
    sendMsg(` `, 'LOG')
    sendMsg(`Total folders scanned: ${gameFolders.length}`, 'LOG')
    sendMsg(`Passed: ${fullGamePaths.length}`, 'LOG')
    sendMsg(`Failed: ${failedGames.length}`, 'LOG')
    sendMsg(` `, 'LOG')
    // sendMsg(`# # # # # # # # # # # # # # # # #\n`, 'LOG')
    // sendMsg('Finishing', 'LOG');

    logToDisk(failedGames.length)
    logDiag('Finished', 'Operation completed', `
    Total folders scanned: ${gameFolders.length}
    Passed: ${fullGamePaths.length}
    Failed: ${failedGames.length}`)

    gamesScanned = 0
    totalGamesToScan = 0
    counterGamesFound = 0
    counterGamesNotFound = 0
    // sendMsg('disableStartButton', 'DOM')
    // sendMsg('disableAddButton', 'DOM')
}

let date = new Date()
let fetchCoverPromises = [];
const saveInfo = (info, coverArt, address) => {

    let gameEntry = new GameObject(info.name, address, info.gameplayMain, info.gameplayMainExtra, info.gameplayCompletionist, coverArt)
    allGames.push(gameEntry)

    if (fs.existsSync(address) && forceOverwrite == false) {
        sendMsg('Skip: ' + ' - Enable overwrite mode to force refresh', 'LOG')
        // sendMsg('[INFO]\t\tEnable overwrite mode to force refresh')
        return
    };


    if (fs.existsSync(address)) {
        fs.rmSync(address, { recursive: true })
        fs.mkdirSync(address)
        sendMsg('Save completed by replacing existing data', 'LOG')
        sendMsg(` `, 'LOG')
    }
    if (!fs.existsSync(address)) {
        // sendMsg('[FETCHING]\t' + info.name)
        fs.mkdirSync(address)
        sendMsg('Save completed', 'LOG')
        sendMsg(` `, 'LOG')
    }

    if (downloadCoverArts) {
        const img = path.join(address, 'poster.jpg');
        const fileAddress = fs.createWriteStream(img);
        stream.Readable.fromWeb(coverArt.body)
            .pipe(fileAddress);
        fileAddress.on('finish', () => {
            fileAddress.close();
            console.log('Download Completed');
        })
    }

    let safeName = info.name.replace(/[/\\?%*:|"<>]/g, '')
    let lineOne = `${info.name} (${info.id})\n\nThis game takes about ${info.gameplayMain} hours to beat for the main campaign only.\n\n`
    let lineTwo = `Playing this game along with some side missions and activities should take about ${info.gameplayMainExtra} hours, and 100% completion can take around ${info.gameplayCompletionist} hours. `
    let lineThree = `\n\n`
    let lineFour = `This info was last updated on ${date.toUTCString()}.\nMore info about the tool used to fetch this info can be found on https://github.com/lscambo13/HLTB_Fetcher`
    fs.writeFileSync(path.join(address, `/allInfo.json`), JSON.stringify(info))
    fs.writeFileSync(path.join(address, `/Main Story - ${info.gameplayMain} hours - ${safeName}.txt`), lineOne + lineTwo + lineThree + lineFour)
    fs.writeFileSync(path.join(address, `/Main & Sides - ${info.gameplayMainExtra} hours - ${safeName}.txt`), lineOne + lineTwo + lineThree + lineFour)
    fs.writeFileSync(path.join(address, `/Completionist - ${info.gameplayCompletionist} hours - ${safeName}.txt`), lineOne + lineTwo + lineThree + lineFour)
}

let searchPromises = []
const getGameDetail = () => {
    const preSaveProcess = (gameCover) => {
        Promise.all(searchPromises).then((gameDetails) => {
            sendMsg(` `, 'LOG')
            // sendMsg(`Fetch complete`, 'LOG')
            // console.log(`all promises fulfilled`)
            gameDetails.forEach((val, index, array) => {
                // sendMsg(`LOG: ${val.name}`, 'LOG')
                counterGamesFound++
                ++gamesScanned
                // passedGames.push(folder)
                // passedGameDir.push(dir)
                sendMsg(`Processing: ${val.name}`, 'LOG')
                sendMsg(`Saving to ${path.join(fullGamePaths[index], '/HowLongToBeat-Stats')}`, 'LOG')
                saveInfo(val, gameCovers[index], path.join(fullGamePaths[index], '/HowLongToBeat-Stats'))
                // sendMsg(++currentProgress, 'PROGRESS')
            })
            sendMsg(` `, 'LOG')
            failedGames.forEach((val, index, array) => {
                sendMsg(`Processing: ${val}`, 'LOG')
                sendMsg(`Failed: Check if the game folder name is spelled correctly`, 'LOG')
                // sendMsg(`Saving to ${path.join(fullGamePaths[index], '/HowLongToBeat-Stats')}`, 'LOG')
            })
            sendMsg(++currentProgress, 'PROGRESS')
            log()
        }).catch((error) => {
            sendMsg(error, 'LOG')
            log()
            // console.log(`resolve promises error`, error)
        })
    }

    Promise.all(fetchCoverPromises).then((res) => {
        res.forEach((val) => gameCovers.push(val))
        preSaveProcess()
    })

}

let gamePaths = []
let gameFolders = []
const startOnlineScan = () => {

    subDirectoriesSet.forEach((val, index, array) => {
        gamePaths.push(path.dirname(val))
        gameFolders.push(path.basename(val))
    })

    sendMsg(` `, 'LOG')
    sendMsg(`Searching online according to subdirectory name`, 'LOG')
    gameFolders.forEach((val, index, array) => {
        sendMsg(`Searching: ${val}`, 'LOG')
        searchPromises.push(hltbService.search(unCamelCase(val)))
    })
    sendMsg(++currentProgress, 'PROGRESS')

    Promise.all(searchPromises).then((searchResults) => {
        sendMsg(`Search completed`, 'LOG')
        sendMsg(` `, 'LOG')
        searchPromises = []
        searchResults.forEach((val, index, array) => {
            if (val.length !== 0 && val[0]) {
                // sendMsg([index], 'PROGRESS')
                // sendMsg(`Found: ${val[0].name}`, 'LOG')
                // console.log(val[0].name)
                sendMsg(`Fetching: ${val[0].name}`, 'LOG')
                searchPromises.push(hltbService.detail(val[0].id))
                if (downloadCoverArts) {
                    fetchCoverPromises.push(fetch(val[0].imageUrl))
                }
                // gameCovers.push()
                fullGamePaths.push(path.join(gamePaths[index], gameFolders[index]))
            } else {
                // console.log(gameFolders[index])
                sendMsg(`Not found: ${gameFolders[index]}`, 'LOG')
                counterGamesNotFound++
                ++gamesScanned
                failedGames.push(gameFolders[index])
                failedGameDirs.push(gamePaths[index])
                // sendMsg('[INFO]\t\tCheck if the game folder name is spelled correctly')
                // log()
            }
        })
        sendMsg(++currentProgress, 'PROGRESS')
        getGameDetail()
    }).catch((error) => {
        sendMsg(error, 'LOG')
        log()
        // console.log(`resolve promises error`, error)
    })

}

let subDirectoriesSet = new Set();
const readDirs = (dir) => {
    let output = fs.readdirSync(dir, { withFileTypes: true })
    const ignored = (string) => {
        let ignoredDirs = ['$RECYCLE.BIN',
            'System Volume Information',
            'msdownld.tmp',
            '$Trash$',
            'Steam Controller Configs',
            'Steamworks Shared',
            'Games'];
        for (let val of ignoredDirs) {
            if (string.includes(val)) return true
        }
        return false
    }

    output.forEach(element => {
        if (element.isDirectory() && !ignored(element.name)) {
            let fullDir = path.join(element.path, element.name)
            subDirectoriesSet.add(fullDir)
            sendMsg([fullDir, element.name, fullDir], 'PREVIEW')
            // gamePaths.push(element.path)
            // gameFolders.push(element.name)
        }
    });
    sendMsg(subDirectoriesSet.size, 'TOTAL_SUBDIRS')
    // totalProgress = 0
    currentProgress = 0
    // gameFolders.forEach()
}

const checkExistingDataInSubDirs = () => {
    subDirectoriesSet.forEach((val, index, array) => {
        let subDirs = fs.readdirSync(val)
        if (subDirs.includes('HowLongToBeat-Stats')) {
            sendMsg(val, 'DATA_EXISTS_ALREADY');
            // sendMsg(`Stats already exist: "${val}"`, 'LOG');
            return
        }
    })
}



let driveQueueSet = new Set();
const readQueue = () => {
    // sendMsg('clearLog', 'DOM')
    // gamePaths = []
    // gameFolders = []
    sendMsg(driveQueueSet.size, 'TOTAL_DRIVES')
    if (driveQueueSet.size == 0) resetQueues()
    sendMsg('clearPreview', 'DOM')
    driveQueueSet.forEach((value, index, array) => {
        if (!fs.existsSync(value)) {
            sendMsg(`Failed to queue: "${value}" doesn't exist!`, 'LOG');
            return
        }
        readDirs(value)
    })
}

const queueDrives = (pathToDrive) => {
    if (driveQueueSet.has(pathToDrive)) {
        sendMsg(`Already exists in queue: ${pathToDrive}`, 'LOG')
        console.log(driveQueueSet)
        return
    }
    driveQueueSet.add(pathToDrive)
    sendMsg('enableStartButton', 'DOM')
    sendMsg(`Added to queue: ${pathToDrive}`, 'LOG')
    // sendMsg(`INFO: ${++index}. Add to queue - ${value}`, 'LOG')
    sendMsg([pathToDrive, path.basename(pathToDrive), pathToDrive], 'QUEUE_DRIVE')
}

const restartAll = () => {
    resetQueues()
    app.quit()
}

const autoPopulateQueue = () => {
    const popularLocations = [
        `F:\\Games`,
        `E:\\Games`,
        `D:\\projects\\hltb-fetcher-electron\\test`,
        `D:\\Games`,
        `C:\\Games`,
        `C:\\Riot Games`,
        `C:\\Program Files\\Epic Games`,
        `C:\\Program Files(x86)`,
        `C:\\Program Files(x86)\\GOG Galaxy\\Games`,
        `C:\\Program Files (x86)\\Steam\\steamapps\\common`
    ]
    popularLocations.forEach((val) => {
        val = path.join(val)
        if (fs.existsSync(val)) {
            console.log('auto: ', val)
            queueDrives(val)
        }
    })
    readQueue()
}

ipcMain.handle('openRequest', (event, ...args) => {
    let out;
    if (args == 'selectDrive') {
        out = new Promise((resolve, reject) => {
            dialog.showOpenDialog(mainWin, {
                properties: ['openDirectory']
            }).then(result => {
                if (result.canceled) {
                    resolve(`LOG: Cancelled by user`)
                }
                if (!result.canceled) {
                    queueDrives(result.filePaths[0])
                    readQueue()
                    checkExistingDataInSubDirs()
                    resolve()
                }
            }).catch(err => {
                reject(`ERROR: ${err}`)
            })
        });
    }
    if (args == 'startOperation') startOnlineScan()
    if (args == 'restartAll') restartAll()
    if (args == 'resetQueue') resetQueues()
    if (args == 'autoPopulateQueue') autoPopulateQueue()
    return out
})

ipcMain.handle('hereIsTheLog', (event, args) => {
    // console.log('hoho')
    fs.writeFileSync(finalLogPath, args)
    sendMsg(`Saved log: ${finalLogPath}`, 'LOG')
    sendMsg(++currentProgress, 'PROGRESS')
    // return finalLogPath
})

ipcMain.handle('fsRequest', (event, args) => {
    let cmd = args[0]
    let msg = args[1]
    if (cmd == 'explore') {
        shell.openExternal(path.join(msg))
        // console.log('exploring', msg)
    }
    if (cmd == 'rename') {
        console.log('renaming', msg)
    }
    if (cmd == 'removeFromQueue') {
        driveQueueSet.delete(path.join(msg))
        subDirectoriesSet.clear()
        readQueue()
        // console.log('removing', msg, driveQueueSet)
        checkExistingDataInSubDirs()
    }
    if (cmd == 'checkExistingData') {
        checkExistingDataInSubDirs();
    }
    if (cmd == 'forceOverwrite') {
        forceOverwrite = msg
        console.log('overwriting', forceOverwrite)
    }
    if (cmd == 'downloadCoverArts') {
        downloadCoverArts = msg
        console.log('download coverArt', downloadCoverArts)
    }
})