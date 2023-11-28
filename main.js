const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('node:path')
const fs = require('fs')
const hltb = require('howlongtobeat')
const hltbService = new hltb.HowLongToBeatService()


const { ipcRenderer } = require('electron/renderer')

process.env.NODE_ENV = 'production'

const isDev = process.env.NODE_ENV === 'development'
let mainWin;
let flag = 'force';
let gamesScanned = 0
let gamesToScan = 0
let foundGames = 0
let notFoundGames = 0

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
        transparent: true,
        backgroundMaterial: 'mica',
    })
    mainWin.loadFile(path.join(__dirname, 'renderer/index.html'))
    if (isDev) mainWin.webContents.openDevTools()
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

const log = () => {
    if (gamesScanned == gamesToScan) {
        sendMsg(`\n`)
        sendMsg(`# # # #   R E S U L T S   # # # #\n`)
        sendMsg(`Total Games Scanned: ${gamesToScan}`)
        sendMsg(`Success: ${foundGames}`)
        sendMsg(`Could Not Find: ${notFoundGames}`)
        sendMsg(`# # # # # # # # # # # # # # # # #\n`)
        sendMsg('Quitting!' + '\n' + 'https://github.com/lscambo13/HLTB_Fetcher\n');
        // process.exit(0);

        gamesScanned = 0
        gamesToScan = 0
        foundGames = 0
        notFoundGames = 0
    }
}

let date = new Date()
const saveInfo = (info, coverArt, address) => {

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

    fs.writeFileSync(path.join(address, `/Main Story - ${info.gameplayMain} hours - ${safeName}.txt`), lineOne + lineTwo + lineThree + lineFour)
    fs.writeFileSync(path.join(address, `/Main & Sides - ${info.gameplayMainExtra} hours - ${safeName}.txt`), lineOne + lineTwo + lineThree + lineFour)
    fs.writeFileSync(path.join(address, `/Completionist - ${info.gameplayCompletionist} hours - ${safeName}.txt`), lineOne + lineTwo + lineThree + lineFour)
}


const findGame = (folder, dir) => {
    ++gamesToScan
    hltbService.search(folder).then((searchResults) => {
        const quickSearch = () => {
            return [searchResults[0].id, searchResults[0].imageUrl, folder]
        }

        if (searchResults.length !== 0) {
            let id = quickSearch()
            hltbService.detail(id[0]).then((gameDetails) => {
                foundGames++
                ++gamesScanned
                // sendMsg('FOUND: ' + `${gamesScanned}. ${folder}`)
                saveInfo(gameDetails, id[1], path.join(dir, id[2], '/HowLongToBeat-Stats'))
                log()
            })

        } else {
            notFoundGames++
            ++gamesScanned
            sendMsg(`ERROR: ${folder} - Check if the game folder name is spelled correctly`)
            // sendMsg('[INFO]\t\tCheck if the game folder name is spelled correctly')
            log()
        }
    })
}

let gamePaths = []
let gameFolders = []
const startOnlineScan = () => {
    gameFolders.forEach((val, index, array) => {
        findGame(val, gamePaths[index])
    })
}

const readDirs = (dir) => {
    let output = fs.readdirSync(dir, { withFileTypes: true })
    const ignored = (string) => {
        let ignoredDirs = ['hjkdfjkhjhk', 'ig me', '$RECYCLE.BIN', 'System Volume Information', 'msdownld.tmp', '$Trash$'];
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