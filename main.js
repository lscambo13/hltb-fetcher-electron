const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('node:path')
const fs = require('fs')
const hltb = require('howlongtobeat')
const hltbService = new hltb.HowLongToBeatService()

process.env.NODE_ENV = 'production'

const isDev = process.env.NODE_ENV === 'development'
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
let allGames = []

let failedGames = []
let failedGameDirs = []
let passedGames = []
let passedGameDir = []


const createMainWindow = () => {
    mainWin = new BrowserWindow({
        width: isDev ? 1200 : 850,
        height: 680,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            enableRemoteModule: false,
            contextIsolation: true,
            sandbox: true
        },
        // transparent: true,
        // backgroundMaterial: 'mica',
        autoHideMenuBar: true,

    })
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
        console.log(val)
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
    if (gamesScanned == totalGamesToScan) {
        sendMsg(`\n`)
        sendMsg(`# # # #   R E S U L T S   # # # #\n`)
        sendMsg(`Total Games Scanned: ${totalGamesToScan}`)
        sendMsg(`Success: ${counterGamesFound}`)
        sendMsg(`Could Not Find: ${counterGamesNotFound}`)
        sendMsg(`# # # # # # # # # # # # # # # # #\n`)
        sendMsg('Quitting!' + '\n' + 'https://github.com/lscambo13/HLTB_Fetcher\n');
        // process.exit(0);

        failedGames.forEach((val, index) => {
            console.log(`FAILED ${val} - ${failedGameDirs[index]}`)
        })

        logToDisk()

        gamesScanned = 0
        totalGamesToScan = 0
        counterGamesFound = 0
        counterGamesNotFound = 0
    }
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


const findGame = async (folder, dir) => {
    ++totalGamesToScan

    hltbService.search(folder).then((searchResults) => {
        if (searchResults.length !== 0) {
            // let id = quickSearch()
            hltbService.detail(searchResults[0].id).then((gameDetails) => {
                // console.log(gameDetails)
                counterGamesFound++
                ++gamesScanned
                passedGames.push(folder)
                passedGameDir.push(dir)
                // sendMsg('FOUND: ' + `${gamesScanned}. ${folder}`)
                saveInfo(gameDetails, searchResults[0].imageUrl, path.join(dir, folder, '/HowLongToBeat-Stats'))
                log()
            }).catch((err2) => console.log(`DETAIL ERROR: ${err2}`))

        } else {
            counterGamesNotFound++
            ++gamesScanned
            failedGames.push(folder)
            failedGameDirs.push(dir)
            sendMsg(`ERROR: ${folder} - Check if the game folder name is spelled correctly`)
            // sendMsg('[INFO]\t\tCheck if the game folder name is spelled correctly')
            log()
        }
    }).catch((err1) => console.log(`SEARCH ERROR: ${err1}`))
    // const quickSearch = () => {
    //     return [searchResults[0].id, searchResults[0].imageUrl, folder]
    // }



}

let gamePaths = []
let gameFolders = []
const startOnlineScan = () => {
    gameFolders.forEach((val, index, array) => {
        findGame(val, gamePaths[index])
    })
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
        sendMsg(`SCAN: ${++index}. ${val}`, 'PREVIEW')
    })
}

let driveQueueArray = [];
const readQueue = () => {
    sendMsg('clearLog', 'DOM')
    driveQueueArray.forEach((value, index, array) => {
        if (!fs.existsSync(value)) {
            sendMsg(`ERROR: "${value}" doesn't exist!`);
            return
        }
        sendMsg(`INFO: ${++index}. Add to queue - ${value}`)
        sendMsg('clearPreview', 'DOM')
        readDirs(value)
    })

}

const queueDrives = (pathToDrive) => {
    driveQueueArray.push(pathToDrive)
    sendMsg('enableStartButton', 'DOM')
}

const resetQueues = () => {
    driveQueueArray = []
    gamePaths = []
    gameFolders = []
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