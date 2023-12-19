const restartAppButton = document.querySelector('#restartAppButton')
restartAppButton.addEventListener('click', () => {
	bridgeApi.invoke('openRequest', 'restartApp')
})


// const xValues = ["Italy", "France", "Spain", "USA", "Argentina"];
// const yValues = [55, 49, 44, 24, 15];
// const barColors = [
// 	"#b91d47",
// 	"#00aba9",
// 	"#2b5797",
// 	"#e8c3b9",
// 	"#1e7145"
// ];

// let cfg = {
// 	type: "doughnut",
// 	data: {
// 		labels: xValues,
// 		datasets: [{
// 			backgroundColor: barColors,
// 			data: yValues,

// 		}]
// 	},
// 	options: {
// 		title: {
// 			display: true,
// 			text: "World Wide Wine Production 2018"
// 		}
// 	}
// }

// {
// 		"gameName": "Assassin's Creed Chronicles: China",
// 		"gameDir": "D:\\Games\\Assassin's Creed Chronicles China\\HowLongToBeat-Stats",
// 			"gameTimes": [
// 				6,
// 				9,
// 				17.5
// 			],
// 				"coverUrl": "https://howlongtobeat.com/games/Assassins_Creed_Chronicles_-_China.jpg"
// }

let gameLabels = []
let gameDirs = []
let mainOnly = []
let mainAndSides = []
let complete = []
let gameArts = []


bridgeApi.invoke('endGameRequest', 'requestAllGameData')
bridgeApi.on('ALL_GAMES', (args) => {
	console.log(args)

	args.forEach(element => {
		gameLabels.push(element.gameName)
		gameDirs.push(element.gameDir)
		mainOnly.push(element.gameTimes[0])
		mainAndSides.push(element.gameTimes[1])
		complete.push(element.gameTimes[2])
		gameArts.push(element.coverUrl)
	});

	let cfg = {
		type: 'line',
		data: {
			datasets: [{
				// backgroundColor: 'white',
				label: 'Main Missions Only',
				data: mainOnly,
				type: 'line',
				fill: true,
				borderColor: 'rgb(75, 192, 192)',
				backgroundColor: 'rgb(255,255,255, 0.01)',
				radius: 2,
				borderWidth: 1,
				tension: 0.1,
				order: 1
			},
			{
				// backgroundColor: 'white',
				label: 'Main + Side Missions',
				data: mainAndSides,
				type: 'line',
				fill: true,
				borderColor: 'red',
				backgroundColor: 'rgb(255,255,255, 0.01)',
				hitRadius: 4,
				radius: 2,
				borderWidth: 1,
				tension: 0.1,
				order: 2
			},
			{
				// backgroundColor: 'white',
				label: '100% Complete',
				data: complete,
				type: 'line',
				fill: true,
				borderColor: 'green',
				backgroundColor: 'rgb(255,255,255, 0.01)',
				radius: 2,
				borderWidth: 1,
				tension: 0.1,
				order: 2
			},
			],
			labels: gameLabels
		},
		options: {
			title: {
				display: true,
				text: "All Games Data"
			}
		}
	}
	new Chart("myChart", cfg);
})

// new Chart("myChart", cfg);
