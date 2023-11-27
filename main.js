const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('node:path')
const fs = require('fs')
const hltb = require('howlongtobeat')
const hltbService = new hltb.HowLongToBeatService()


const { ipcRenderer } = require('electron/renderer')

// process.env.NODE_ENV = 'development'

const isDev = process.env.NODE_ENV === 'development'
let mainWin;
let workDirs = [];
let flag = 'force';
let gamesScanned = 0
let gamesToScan = 0
let foundGames = 0
let notFoundGames = 0

const createMainWindow = () => {
    mainWin = new BrowserWindow({
        width: isDev ? 1000 : 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            enableRemoteModule: false,
            contextIsolation: true,
            sandbox: true
        },
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

function sendMsg(msg) {
    mainWin.webContents.send('LOG', msg)
}

// #####################################

const log = () => {
    if (gamesScanned == gamesToScan) {
        sendMsg(`\n`)
        sendMsg(`\n# # # # # # # # # #   R E S U L T S   # # # # # # # # # #\n`)
        sendMsg(`\t\tTotal Games Scanned: ${gamesToScan}`)
        sendMsg(`\t\tSuccess: ${foundGames}`)
        sendMsg(`\t\tCould Not Find: ${notFoundGames}`)
        sendMsg(`\n# # # # # # # # # # # # # # # # # # # # # # # # # # # # #\n`)
        sendMsg('   ' + 'Quitting!' + '\n   ' + 'Visit https://github.com/lscambo13/HLTB_Fetcher\n');
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
        sendMsg('[EXISTS]\t' + info.name)
        sendMsg('[INFO]\t\tEnable overwrite mode to force refresh' + '\n')
        return
    };


    if (fs.existsSync(address)) {
        sendMsg('[UPDATING]\t' + info.name + '\n')
        fs.rmSync(address, { recursive: true })
        fs.mkdirSync(address)
    }
    if (!fs.existsSync(address)) {
        sendMsg('[FETCHING]\t' + info.name + '\n')
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
                sendMsg('[FOUND]\t\t' + `${++gamesScanned}. ${folder}`)
                saveInfo(gameDetails, id[1], path.join(dir, id[2], '/HowLongToBeat-Stats'))
                log()
            })

        } else {
            notFoundGames++
            sendMsg('[NOT FOUND]\t' + `${++gamesScanned}. ${folder}`)
            sendMsg('[INFO]\t\tCheck if the game folder name is spelled correctly\n')
            log()
        }
    })
}

const readDirs = (dir) => {
    let output = fs.readdirSync(dir, { withFileTypes: true })
    let gameFolders = []
    output.forEach(element => {
        if (element.isDirectory()) gameFolders.push(element.name)
    });
    for (let folder of gameFolders) {
        sendMsg(`LOG: ` + path.join(dir, folder))
        findGame(folder, dir)
    }
}

function readDrive(drivePathArray) {
    // new Array
    // let array = drivePathArray.split(',')
    let array = drivePathArray
    const startOperation = (name) => {
        readDirs(name)
        sendMsg(`[INFO]\t\Looking for games in ${name}\n`)
    }

    array.forEach((value, index, array) => {
        // value = value.replaceAll(`"`, ``)
        // let lastChar = value[value.length - 1]
        // if (lastChar != `\\`) {
        //     value = `${value}\\`
        // }
        if (!fs.existsSync(value)) {
            sendMsg(`\n\n[ERROR]\t${value} doesn't exist!\n`);
            // rl.close();
            return
        }
        startOperation(value)
    })
}

ipcMain.handle('openRequest', (event, ...args) => {
    // console.log(args)
    dialog.showOpenDialog(mainWin, {
        properties: ['openDirectory', 'multiSelections']
    }).then(result => {
        sendMsg(`LOG: cancelled dialog = ` + result.canceled)
        sendMsg(`LOG: picked = ` + result.filePaths)
        if (!result.canceled) readDrive(result.filePaths)
    }).catch(err => {
        sendMsg(`ERROR: ` + err)
    })
    sendMsg(`LOG: open dialog = ` + args)
    // return 'ok good'
})