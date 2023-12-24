const cardGallery = document.querySelector('.cardGallery')
const gridViewButton = document.querySelector('#gridViewButton')
const listViewButton = document.querySelector('#listViewButton')

let gameLabels = []
let gameDirs = []
let coverBlobs = []
let mainOnly = []
let mainAndSides = []
let complete = []
let gameArts = []
let gameIds = []

const createCard = (id, img, title, times) => {
	let t = [...times]
	let red = ['ok', 'ok', 'ok']
	t.forEach((e, i) => {
		if (t[i] == 0) red[i] = 'problem'
		if (e % 1 != 0) {
			t[i] = `${Math.floor(e)}<span class="timeFraction">
							<sup>1</sup>&frasl;<sub>2</sub>
						</span>`
		}
	})

	cardGallery.insertAdjacentHTML("beforeend", `
				<div data-ID="${id}" class="cardContainer">
				<img class="cardImage"
					 src="${img}" alt="">
				<div class="cardData">
					<div class="cardTitle">
						${title}
					</div>
					<div class="cardTimesContainer">
					<div>
						<div class="cardTime mainTimeOnly ${red[0]}">
							<p class="time">${t[0]}</p>
							<p class="timeUnit">hours</p>							
						</div>
						<p class="timeLabel">Main Only</p>
					</div>
					<div>
						<div class="cardTime mainAndSides ${red[1]}">
							<p class="time">${t[1]}</p>
							<p class="timeUnit">hours</p>							
						</div>
						<p class="timeLabel">Main + Sides</p>
					</div>
					<div>
						<div class="cardTime complete ${red[2]}">
							<p class="time">${t[2]}</p>
							<p class="timeUnit">hours</p>							
						</div>
						<p class="timeLabel">Completionist</p>
					</div>
					</div>
				</div>
			</div>
	`)
}

const addListStyle = () => {
	listViewButton.disabled = true
	gridViewButton.disabled = false
	const cardContainer = document.querySelectorAll('.cardContainer')
	const cardImage = document.querySelectorAll('.cardImage')
	const cardData = document.querySelectorAll('.cardData')
	const cardTitle = document.querySelectorAll('.cardTitle')
	const cardTime = document.querySelectorAll('.cardTime')
	const timeUnit = document.querySelectorAll('.timeUnit')


	cardContainer.forEach(e => {
		e.classList.remove('cardContainerGrid')
		e.classList.add('cardContainerList')
	})
	cardImage.forEach(e => {
		e.classList.remove('cardImageGrid')
		e.classList.add('cardImageList')
	})
	cardData.forEach(e => {
		e.classList.remove('cardDataGrid')
		e.classList.add('cardDataList')
	})
	cardTitle.forEach(e => {
		e.classList.remove('cardTitleGrid')
		e.classList.add('cardTitleList')
	})
	cardTime.forEach(e => {
		e.classList.remove('cardTimeGrid')
		e.classList.add('cardTimeList')
	})
	timeUnit.forEach(e => {
		e.classList.remove('timeUnitGrid')
		e.classList.add('timeUnitList')
	})
}

const addGridStyle = () => {
	gridViewButton.disabled = true
	listViewButton.disabled = false

	const cardContainer = document.querySelectorAll('.cardContainer')
	const cardImage = document.querySelectorAll('.cardImage')
	const cardData = document.querySelectorAll('.cardData')
	const cardTitle = document.querySelectorAll('.cardTitle')
	const cardTime = document.querySelectorAll('.cardTime')
	const timeUnit = document.querySelectorAll('.timeUnit')

	cardContainer.forEach(e => {
		e.classList.remove('cardContainerList')
		e.classList.add('cardContainerGrid')
	})
	cardImage.forEach(e => {
		e.classList.remove('cardImageList')
		e.classList.add('cardImageGrid')
	})
	cardData.forEach(e => {
		e.classList.remove('cardDataList')
		e.classList.add('cardDataGrid')
	})
	cardTitle.forEach(e => {
		e.classList.remove('cardTitleList')
		e.classList.add('cardTitleGrid')
	})
	cardTime.forEach(e => {
		e.classList.remove('cardTimeList')
		e.classList.add('cardTimeGrid')
	})
	timeUnit.forEach(e => {
		e.classList.remove('timeUnitList')
		e.classList.add('timeUnitGrid')
	})
}

document.addEventListener('DOMContentLoaded', (event) => {
	console.log('DOM fully loaded and parsed');
	fetch('./assets/database.json').then(res => {
		if (res.status == 200) console.log('OK')
		res.json().then(r => {
			console.log('Found local database')
			beginConstructingDOM(r)
		})
	}).catch(e => {
		console.log(e)
		console.log('Did not find local database')
		addMainListeners()
		const restartAppButton = document.querySelector('#restartAppButton')
		restartAppButton.addEventListener('click', () => {
			bridgeApi.invoke('openRequest', 'restartApp')
		})
		bridgeApi.invoke('endGameRequest', 'requestAllGameData')
	})
});
const generateSortedArrays = (unorderedArray, order) => {
	let x;
	if (order == 'asc') {
		let ascOrderedMainDb = [...unorderedArray]
		ascOrderedMainDb.sort((a, b) => { return a.gameTimes[0] - b.gameTimes[0] })

		let ascOrderedMainSidesDb = [...unorderedArray]
		ascOrderedMainSidesDb.sort((a, b) => { return a.gameTimes[1] - b.gameTimes[1] })

		let ascOrderedCompleteDb = [...unorderedArray]
		ascOrderedCompleteDb.sort((a, b) => { return a.gameTimes[2] - b.gameTimes[2] })

		x = [ascOrderedMainDb, ascOrderedMainSidesDb, ascOrderedCompleteDb]
	} else if (order == 'desc') {
		let descOrderedMainDb = [...unorderedArray]
		descOrderedMainDb.sort((a, b) => { return b.gameTimes[0] - a.gameTimes[0] })

		let descOrderedMainSidesDb = [...unorderedArray]
		descOrderedMainSidesDb.sort((a, b) => { return b.gameTimes[1] - a.gameTimes[1] })

		let descOrderedCompleteDb = [...unorderedArray]
		descOrderedCompleteDb.sort((a, b) => { return b.gameTimes[2] - a.gameTimes[2] })

		x = [descOrderedMainDb, descOrderedMainSidesDb, descOrderedCompleteDb]
	}
	return x
}

const fillTopFiveLists = (arrayOfArrays, length) => {
	let mainList = document.querySelector(`#${length}TopMainOnly`)
	let mainSidesList = document.querySelector(`#${length}TopMainAndSides`)
	let completeList = document.querySelector(`#${length}TopComplete`)
	let list;

	arrayOfArrays.forEach((element, arrIndex) => {
		if (arrIndex == 0) {
			list = mainList
			list.insertAdjacentHTML('afterbegin', `
						<h3>Top ${length} games in your library, based on the main story</h3>
				`)
		} else if (arrIndex == 1) {
			list = mainSidesList
			list.insertAdjacentHTML('afterbegin', `
						<h3>Top ${length} games in your library, based on story and some side activities</h3>
				`)
		} else if (arrIndex == 2) {
			list = completeList
			list.insertAdjacentHTML('afterbegin', `
						<h3>Top ${length} games in your library, based on 100% completion</h3>
				`)
		}
		{/* <span class="timeUnit">${element[i].gameTimes[arrIndex]}</span> */ }
		console.log('-----Looking at ', list)
		let totalTries = 5
		let serialNo = 1
		for (let i = 0; i < totalTries; i++) {
			if (element[i].gameTimes[arrIndex]) {
				list.insertAdjacentHTML('beforeend', `
						<div data-REF="${element[i].gameId}" class="sidePanelListItem">
							<span>${serialNo}. ${element[i].gameName}</span>
							<span>${element[i].gameTimes[arrIndex]}<span class="timeUnitBig"> hours</span></span>
						</div>
				`)
				serialNo++
				// console.log(element[i].gameName, element[i].gameTimes[arrIndex])
			} else { totalTries++ }
		}
	})
}

const createBigCardModal = (element) => {
	element = element
		.replaceAll('cardContainerGrid', 'cardContainerBig').replaceAll('cardContainerList', 'cardContainerBig')
		.replaceAll('cardImageGrid', 'cardImageBig').replaceAll('cardImageList', 'cardImageBig')
		.replaceAll('cardDataGrid', 'cardDataBig').replaceAll('cardDataList', 'cardDataBig')
		.replaceAll('cardTitleGrid', 'cardTitleBig').replaceAll('cardTitleList', 'cardTitleBig')
		.replaceAll('cardTimeGrid', 'cardTimeBig').replaceAll('cardTimeList', 'cardTimeBig')
		.replaceAll('timeUnitGrid', 'timeUnitBig').replaceAll('timeUnitList', 'timeUnitBig')
		.replace('cardContainer', '')

	document.body.insertAdjacentHTML('afterbegin', `
		<div class="modalContainer">
			<div class="modalButtonBar"></div>
			<div class="bigCardContainer" id="bigCardContainer">
				${element}
			</div>
		</div>
	`)

	let modalContainer = document.querySelector('.modalContainer')
	const removeBigCardModal = () => {
		modalContainer.removeEventListener('click', removeBigCardModal)
		modalContainer.remove()
	}
	modalContainer.addEventListener('click', removeBigCardModal)
}

const beginConstructingDOM = (database) => {
	console.log(database)
	const asciiOrderedDB = [...database]
	asciiOrderedDB.sort((a, b) => {
		if (a.gameName < b.gameName) { return -1 } else return 1
	})

	asciiOrderedDB.forEach((element, index) => {
		let img = element.gameDir + '\\coverArt.jpg'
		let title = element.gameName
		let times = element.gameTimes
		let id = element.gameId
		gameLabels.push(title)
		gameDirs.push(element.gameDir)
		coverBlobs.push(img)
		mainOnly.push(times[0])
		mainAndSides.push(times[1])
		complete.push(times[2])
		gameArts.push(element.coverUrl)
		gameIds.push(id)
		createCard(id, img, title, times)
	});
	addGridStyle()

	let imgTags = document.querySelectorAll('img')
	imgTags.forEach(e => e.onerror = () => {
		e.src = './assets/not_found.jpg'
	})

	const ascSortedArrays = generateSortedArrays(asciiOrderedDB, 'asc')
	const descSortedArrays = generateSortedArrays(asciiOrderedDB, 'desc')
	fillTopFiveLists(descSortedArrays, 'longest')
	fillTopFiveLists(ascSortedArrays, 'shortest')

	const cardContainer = document.querySelectorAll('.cardContainer')
	cardContainer.forEach((element) => {
		element.addEventListener('click', (e) => {
			e.stopPropagation()
			let x = e.target.closest('.cardContainer').outerHTML
			createBigCardModal(x)
		})
	})

	let dataREFs = document.querySelectorAll('[data-REF]')
	console.log(dataREFs)
	dataREFs.forEach((element) => {
		element.addEventListener('click', (event) => {
			let refId = event.target
				.closest('.sidePanelListItem')
				.getAttribute('data-REF')
			console.log(refId)
			let dataID = document.querySelector(`[data-ID="${refId}"]`)
			let x = dataID.outerHTML
			console.log(x)
			createBigCardModal(x)
		})
	})


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

const addMainListeners = () => {
	bridgeApi.on('ALL_GAMES', (args) => {
		// console.log(args)
		beginConstructingDOM(args)
	})
	gridViewButton.addEventListener('click', addGridStyle)
	listViewButton.addEventListener('click', addListStyle)
}

