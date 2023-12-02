const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('node:path')
const fs = require('fs')
const hltb = require('howlongtobeat')
const hltbService = new hltb.HowLongToBeatService()

process.env.NODE_ENV = 'prod'

const isDev = process.env.NODE_ENV === 'dev'
let mainWin;
let flag = 'force';
let gamesScanned = 0
let totalGamesToScan = 0
let counterGamesFound = 0
let counterGamesNotFound = 0

class gameObject {
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

const resetQueues = () => {
    driveQueueArray = []
    gamePaths = []
    gameFolders = []
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
        transparent: true,
        resizable: true,
        // backgroundMaterial: 'mica',
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
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

function sendMsg(msg, channel = 'LOG') {
    mainWin.webContents.send(channel, msg)
}

// #####################################

const giveMeTime = () => {
    let d = new Date()
    let m = d.getMonth()
    let t = d.toLocaleTimeString('en-us')
    t = t.replace(':', '.')
    t = t.replace(':', '.')
    t = t.replace(' ', '.')
    return `${d.getFullYear()}-${++m}-${d.getDate()} ${t}`
}

const logToDisk = () => {

    allGames.forEach((val, index) => {
        // console.log(val)
    })

    let saveDir = path.join(process.env.HOME, `HLTB_Fetcher/`)
    if (!fs.existsSync(saveDir)) fs.mkdirSync(saveDir)
    saveDir = path.join(saveDir, giveMeTime())
    fs.mkdirSync(saveDir)
    fs.writeFileSync(path.join(saveDir, `/report.json`),
        JSON.stringify(allGames)
    )
}

const log = () => {

    // let logDiag = dialog.showMessageBox(mainWin, { message: 'OK' })
    // logDiag.then((res) => console.log(res, res.response))

    sendMsg(`\n`)
    sendMsg(`# # # #   R E S U L T S   # # # #\n`)
    sendMsg(`Total Games Scanned: ${gameFolders.length}`)
    sendMsg(`Success: ${fullGamePaths.length}`)
    sendMsg(`Could Not Find: ${failedGames.length}\n`)
    sendMsg(`# # # # # # # # # # # # # # # # #\n`)
    sendMsg('Quitting!' + '\n' + 'https://github.com/lscambo13/HLTB_Fetcher\n');

    logToDisk()
    logDiag('Finished', 'Operation completed', `
    Total Games Scanned: ${gameFolders.length}
    Success: ${fullGamePaths.length}
    Could Not Find: ${failedGames.length}\n\nhttps://github.com/lscambo13/HLTB_Fetcher`)

    gamesScanned = 0
    totalGamesToScan = 0
    counterGamesFound = 0
    counterGamesNotFound = 0
    // sendMsg('disableStartButton', 'DOM')
    // sendMsg('disableAddButton', 'DOM')
}

let date = new Date()
const saveInfo = (info, coverArt, address) => {

    let gameEntry = new gameObject(info.name, address, info.gameplayMain, info.gameplayMainExtra, info.gameplayCompletionist, coverArt)
    allGames.push(gameEntry)

    if (fs.existsSync(address) && flag == null) {
        sendMsg('SKIP: ' + info.name + ' - Enable overwrite mode to force refresh')
        // sendMsg('[INFO]\t\tEnable overwrite mode to force refresh')
        return
    };


    if (fs.existsSync(address)) {
        sendMsg('UPDATE: ' + info.name)
        fs.rmSync(address, { recursive: true })
        fs.mkdirSync(address)
    }
    if (!fs.existsSync(address)) {
        sendMsg('UPDATE: ' + info.name)
        // sendMsg('[FETCHING]\t' + info.name)
        fs.mkdirSync(address)
    }

    // https.get(coverArt, (res) => {
    // 	// Image will be stored at this address 
    // 	const img = `${address}/coverArt.jpeg`;
    // 	const fileaddress = fs.createWriteStream(img);
    // 	res.pipe(fileaddress);
    // 	fileaddress.on('finish', () => {
    // 		fileaddress.close();
    // 		// console.log('Download Completed');  
    // 	})
    // })

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

    Promise.all(searchPromises).then((gameDetails) => {
        // console.log(`all promises fulfilled`)
        gameDetails.forEach((val, index, array) => {
            // sendMsg(`LOG: ${val.name}`, 'LOG')
            counterGamesFound++
            ++gamesScanned
            // passedGames.push(folder)
            // passedGameDir.push(dir)
            saveInfo(val, gameCovers[index], path.join(fullGamePaths[index], '/HowLongToBeat-Stats'))
        })
        failedGames.forEach((val, index, array) => {
            sendMsg(`ERROR: ${val} - Check if the game folder name is spelled correctly`, 'LOG')
        })
        log()
    }).catch((error) => console.log(`resolve promises error`, error))
}

let gamePaths = []
let gameFolders = []
const startOnlineScan = () => {
    gameFolders.forEach((val, index, array) => {
        // ++gamesScanned
        searchPromises.push(hltbService.search(val))
        // findGame(val, gamePaths[index])
    })

    Promise.all(searchPromises).then((searchResults) => {
        searchPromises = []
        searchResults.forEach((val, index, array) => {
            if (val.length !== 0) {
                // console.log(val[0].name)
                searchPromises.push(hltbService.detail(val[0].id))
                gameCovers.push(val[0].imageUrl)
                fullGamePaths.push(path.join(gamePaths[index], gameFolders[index]))
            } else {
                // console.log(gameFolders[index])
                counterGamesNotFound++
                ++gamesScanned
                failedGames.push(gameFolders[index])
                failedGameDirs.push(gamePaths[index])
                // sendMsg('[INFO]\t\tCheck if the game folder name is spelled correctly')
                // log()
            }
        })
        getGameDetail()
    }).catch((error) => console.log(`resolve promises error`, error))

}

const readDirs = (dir) => {
    //
    // reset folder arrays and Call readdir again in case folder has ben renamed!
    // 

    let output = fs.readdirSync(dir, { withFileTypes: true })
    const ignored = (string) => {
        // 'hjkdfjkhjhk', 'ig me', 
        let ignoredDirs = ['$RECYCLE.BIN', 'System Volume Information', 'msdownld.tmp', '$Trash$'];
        for (let val of ignoredDirs) {
            if (string.includes(val)) return true
        }
        return false
    }

    output.forEach(element => {
        if (element.isDirectory() && !ignored(element.name)) {
            gamePaths.push(element.path)
            gameFolders.push(element.name)
        }
    });
    gameFolders.forEach((val, index, array) => {
        sendMsg([gamePaths[index], val], 'PREVIEW')
        sendMsg(`SCAN: ${++index}. ${val}`, 'LOG')
        // ++totalGamesToScan
    })
}

let driveQueueArray = [];
const readQueue = () => {
    sendMsg('clearLog', 'DOM')
    gamePaths = []
    gameFolders = []
    driveQueueArray.forEach((value, index, array) => {
        if (!fs.existsSync(value)) {
            sendMsg(`ERROR: "${value}" doesn't exist!`);
            return
        }
        sendMsg(`INFO: ${++index}. Add to queue - ${value}`, 'LOG')
        sendMsg([path.dirname(value), path.basename(value)], 'QUEUE_DRIVE')
        sendMsg('clearPreview', 'DOM')
        readDirs(value)
    })

}

const queueDrives = (pathToDrive) => {
    driveQueueArray.push(pathToDrive)
    sendMsg('enableStartButton', 'DOM')
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
                    resolve()
                }
            }).catch(err => {
                reject(`ERROR: ${err}`)
            })
        });
    }
    if (args == 'startOperation') startOnlineScan()
    if (args == 'resetQueue') resetQueues()
    return out
})