const cardGallery = document.querySelector('.cardGallery')

let gameLabels = []
let gameDirs = []
let coverBlobs = []
let mainOnly = []
let mainAndSides = []
let complete = []
let gameArts = []

const createCard = (img, title, times) => {
	times.forEach((e, i) => {
		if (e % 1 != 0) {
			times[i] = `${Math.floor(e)}<span class="timeFraction">
							<sup>1</sup>&frasl;<sub>2</sub>
						</span>`
		}

	})
	cardGallery.insertAdjacentHTML("beforeend", `
				<div class="cardContainer">
				<img class="cardImage"
					 src="${img}" alt="">
				<div class="cardData">
					<div class="cardTitle">
						${title}
					</div>
					<div class="cardTimesContainer">
					<div>
						<div class="cardTime mainTimeOnly">
							<p class="time">${times[0]}</p>
							<p class="timeUnit">hours</p>							
						</div>
						<p class="timeLabel">Main Only</p>
					</div>
					<div>
						<div class="cardTime mainAndSides">
							<p class="time">${times[1]}</p>
							<p class="timeUnit">hours</p>							
						</div>
						<p class="timeLabel">Main + Sides</p>
					</div>
					<div>
						<div class="cardTime complete">
							<p class="time">${times[2]}</p>
							<p class="timeUnit">hours</p>							
						</div>
						<p class="timeLabel">Completionist</p>
					</div>
					</div>
				</div>
			</div>
	`)
}

fetch('./assets/database.json').then(res => {
	if (res.status == 200) console.log('OK')
	res.json().then(r => {
		console.log('Found local database')
		beginConstructingDOM(r)
	})
}).catch(e => {
	console.log(e)
	console.log('Did not find local database')
	const restartAppButton = document.querySelector('#restartAppButton')
	restartAppButton.addEventListener('click', () => {
		bridgeApi.invoke('openRequest', 'restartApp')
	})
	addMainListener()
	bridgeApi.invoke('endGameRequest', 'requestAllGameData')
})

const beginConstructingDOM = (database) => {
	console.log(database)
	database.forEach((element, index) => {
		let img = element.gameDir + '\\coverArt.jpg'
		let title = element.gameName
		let times = element.gameTimes
		gameLabels.push(title)
		gameDirs.push(element.gameDir)
		coverBlobs.push(img)
		mainOnly.push(times[0])
		mainAndSides.push(times[1])
		complete.push(times[2])
		gameArts.push(element.coverUrl)
		createCard(img, title, times)
	});
	// console.log(mainOnly)


	let allGameTimesLineGraphCFG = {
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
				text: 'All Games Data (Line Graph)'
			}
		}
	}
	let allGameTimesBarGraphCFG = {
		type: 'bar',
		data: {
			datasets: [{
				// backgroundColor: 'white',
				label: 'Main Missions Only',
				data: mainOnly,
				type: 'bar',
				fill: true,
				borderColor: 'rgb(75, 192, 192)',
				backgroundColor: 'rgb(255,255,255, 0.01)',
				borderWidth: 1,
				tension: 0.1,
				order: 1
			},
			{
				// backgroundColor: 'white',
				label: 'Main + Side Missions',
				data: mainAndSides,
				type: 'bar',
				fill: true,
				borderColor: 'red',
				backgroundColor: 'rgb(255,255,255, 0.01)',
				borderWidth: 1,
				tension: 0.1,
				order: 2
			},
			{
				// backgroundColor: 'white',
				label: '100% Complete',
				data: complete,
				type: 'bar',
				fill: true,
				borderColor: 'green',
				backgroundColor: 'rgb(255,255,255, 0.01)',
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
				text: 'All Games Data (Bar Graph)'
			}
		}
	}
	let allGameTimesPieChartCFG = {
		type: 'pie',
		data: {
			datasets: [{
				// backgroundColor: 'white',
				label: 'Main Missions Only',
				data: mainOnly,
				type: 'pie',
				fill: true,
				borderColor: 'rgb(75, 192, 192)',
				backgroundColor: 'rgb(255,255,255, 0.01)',
				borderWidth: 1,
				tension: 0.1,
				order: 1
			},
			{
				// backgroundColor: 'white',
				label: 'Main + Side Missions',
				data: mainAndSides,
				type: 'pie',
				fill: true,
				borderColor: 'red',
				backgroundColor: 'rgb(255,255,255, 0.01)',
				borderWidth: 1,
				tension: 0.1,
				order: 2
			},
			{
				// backgroundColor: 'white',
				label: '100% Complete',
				data: complete,
				type: 'pie',
				fill: true,
				borderColor: 'green',
				backgroundColor: 'rgb(255,255,255, 0.01)',
				borderWidth: 1,
				tension: 0.1,
				order: 2
			},
			],
			// labels: gameLabels
		},
		options: {
			title: {
				display: true,
				text: 'All Games Data (Bar Graph)'
			}
		}
	}
	new Chart('allGameTimesLineGraph', allGameTimesLineGraphCFG);
	new Chart('allGameTimesBarGraph', allGameTimesBarGraphCFG);
	// new Chart('allGameTimesPieChart', allGameTimesPieChartCFG);
	document.body.classList.remove('displayNone')
}

const addMainListener = () => {
	bridgeApi.on('ALL_GAMES', (args) => {
		// console.log(args)
		beginConstructingDOM(args)
	})
}

