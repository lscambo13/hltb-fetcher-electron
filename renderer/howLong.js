import fs from 'fs';
import colors from 'colors';
import readline from 'readline';
import https from 'https';
import { HowLongToBeatService } from 'howlongtobeat';

const hltbService = new HowLongToBeatService();
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

let flag = null;
let gamesScanned = 0
let gamesToScan = 0
let foundGames = 0
let notFoundGames = 0

console.clear()

const greeting = () => {
	console.log('#########################################################')
	console.log('######### ' + 'HOW LONG TO BEAT: STATS FETCHER ver.1'.bold + ' #########')
	console.log('################### ' + 'AUTHOR: LSCAMBO13'.bold + ' ###################')
	console.log('#########################################################\n\n')
}

const log = () => {
	if (gamesScanned == gamesToScan) {
		console.log(`\n`)
		console.log(`\n# # # # # # # # # #   R E S U L T S   # # # # # # # # # #\n`.bold)
		console.log(`\t\tTotal Games Scanned: ${gamesToScan}`)
		console.log(`\t\tSuccess: ${foundGames}`)
		console.log(`\t\tCould Not Find: ${notFoundGames}`)
		console.log(`\n# # # # # # # # # # # # # # # # # # # # # # # # # # # # #\n`.bold)
		console.log('   ' + 'Quitting!'.bold + '\n   ' + 'Visit https://github.com/lscambo13/HLTB_Fetcher\n'.bold);
		process.exit(0);
	}
}

// const output = (obj, img, folderName) => {
// 	// console.info('How Long to Beat ID: ' + obj.id)
// 	console.info('Game Name: '.bgGreen + obj.name.bgGreen)
// 	console.info('Saving info to ' + folderName + '\n')
// 	// console.info('Cover Art: ' + img)
// 	// console.info('Main Story Only: ' + obj.gameplayMain + ' hours')
// 	// console.info('Main Story and Side Missions: ' + obj.gameplayMainExtra + ' hours')
// 	// console.info('Completionist: ' + obj.gameplayCompletionist + ' hours')
// }

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
				console.log('[FOUND]\t\t'.green + `${++gamesScanned}. ${folder}`)
				saveInfo(gameDetails, id[1], dir + id[2] + '/HowLongToBeat-Stats')
				log()
			})

		} else {
			notFoundGames++
			console.error('[NOT FOUND]\t'.red + `${++gamesScanned}. ${folder}`)
			console.error('[INFO]\t\tCheck if the game folder name is spelled correctly\n')
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
		findGame(folder, dir)
	}
}
let date = new Date()
const saveInfo = (info, coverArt, path) => {

	if (fs.existsSync(path) && flag == null) {
		console.log('[EXISTS]\t'.green + info.name)
		console.log('[INFO]\t\tEnable overwrite mode to force refresh' + '\n')
		return
	};


	if (fs.existsSync(path)) {
		console.log('[UPDATING]\t'.green + info.name + '\n')
		fs.rmSync(path, { recursive: true })
		fs.mkdirSync(path)
	}
	if (!fs.existsSync(path)) {
		console.log('[FETCHING]\t'.green + info.name + '\n')
		fs.mkdirSync(path)
	}

	// https.get(coverArt, (res) => {
	// 	// Image will be stored at this path 
	// 	const img = `${path}/coverArt.jpeg`;
	// 	const filePath = fs.createWriteStream(img);
	// 	res.pipe(filePath);
	// 	filePath.on('finish', () => {
	// 		filePath.close();
	// 		// console.log('Download Completed');  
	// 	})
	// })

	let safeName = info.name.replace(/[/\\?%*:|"<>]/g, '')
	let lineOne = `${info.name} (${info.id})\n\nThis game takes about ${info.gameplayMain} hours to beat for the main campaign only.\n\n`
	let lineTwo = `Playing this game along with some side missions and activities should take about ${info.gameplayMainExtra} hours, and 100% completion can take around ${info.gameplayCompletionist} hours. `
	let lineThree = `\n\n`
	let lineFour = `This info was last updated on ${date.toUTCString()}.\nMore info about the tool used to fetch this info can be found on https://github.com/lscambo13/HLTB_Fetcher`

	fs.writeFileSync(`${path}/Main Story - ${info.gameplayMain} hours - ${safeName}.txt`, lineOne + lineTwo + lineThree + lineFour)
	fs.writeFileSync(`${path}/Main & Sides - ${info.gameplayMainExtra} hours - ${safeName}.txt`, lineOne + lineTwo + lineThree + lineFour)
	fs.writeFileSync(`${path}/Completionist - ${info.gameplayCompletionist} hours - ${safeName}.txt`, lineOne + lineTwo + lineThree + lineFour)
}

const searchOnly = async (folder, dir) => {
	let searchResults = await hltbService.detail(folder)
	console.log(searchResults)
}

// searchOnly('84851')


greeting()
rl.question(`[1/2]\tPaste the path to the location where all games\n\tare stored:\n\t`, (input) => {
	let array = input.split(',')

	rl.question('\n\n[2/2]\tOverwrite old data? (y/n, ' + 'leave empty=n'.italic + '): \n\t', (f) => {
		if (f == 'y' || f == 'Y') flag = 'force'
		else flag = null;

		console.log(`\n#########################################################\n`)
		const startOperation = (name) => {
			readDirs(name)
			console.log(`[INFO]\t\Looking for games in ${name}\n`)
		}

		array.forEach((value, index, array) => {
			value = value.replaceAll(`"`, ``)
			let lastChar = value[value.length - 1]
			if (lastChar != `\\`) {
				value = `${value}\\`
			}
			if (!fs.existsSync(value)) {
				console.log(`\n\n[ERROR]\t${value} doesn't exist!\n`.bgRed);
				rl.close();
				return
			}
			startOperation(value)
		})
	})
})

rl.on("close", function () {
	console.log('\n\n#### ' + 'Quitting!'.bold + '\n#### ' + 'Visit https://github.com/lscambo13/HLTB_Fetcher\n'.bold);
	process.exit(0);
});
