#!/usr/bin/env node
const utils = require('./utils')
const chalk = require('chalk')
const signale = require('signale')
const { success, error, log } = signale
const Pairing = require('./pairing')
const inquirer = require('inquirer')

signale.config({
	displayLabel: false
})

class Turnamentti {
	constructor () {
		const Configstore = require('configstore')
		const pkg = require('../package.json')

		this._conf = new Configstore(pkg.name)
	}

	_save (tournamentName, key, value) {
		const saveKey = `${tournamentName}.${key}`
		this._conf.set(saveKey, value)
	}

	_delete (key) {
		this._conf.delete(key)
	}

	_get (key) {
		return this._conf.get(key)
	}

	_getGames (tournamentName) {
		const key = `${tournamentName}.games`
		return this._get(key)
	}

	_getUnresolvedPairings (tournamentName) {
		const key = `${tournamentName}.unresolvedPairings`
		const result = this._get(key)
		return result !== undefined ? result : []
	}

	_getResolvedPairings (tournamentName) {
		const key = `${tournamentName}.resolvedPairings`
		const result = this._get(key)
		return result !== undefined ? result : []
	}

	_getAllConfig () {
		return this._conf.all
	}

	_getTournamentFromInput (input) {
		if (input.length < 1) {
			error('No tournament selected.')
			this.listTournaments()
			process.exit(1)
		}
		return input[0]
	}

	_generateRoundRobinPairings (tournamentName) {
		const games = this._getGames(tournamentName)
		const pairings = []
		for (let i = 0; i < games.length; i++) {
			for (let j = i + 1; j < games.length; j++) {
				const pairing = new Pairing(games[i], games[j], 0)
				pairings.push(pairing)
			}
		}
		success({ prefix: '\n', message: 'Generated ' + chalk.green(pairings.length) + ' pairings for a full round-robin.' })
		utils.shuffleArray(pairings)
		this._save(tournamentName, 'unresolvedPairings', pairings)
	}

	_predictWinnerForPairing (tournamentName, pairing) {
		const resultsSoFar = this._getResolvedPairings(tournamentName)

		const theseBeatGame1 = resultsSoFar.reduce((beaters, currentPairing) => {
			return currentPairing.game1 === pairing.game1 && currentPairing.result === 2
				? beaters.concat(currentPairing.game2)
				: currentPairing.game2 === pairing.game1 && currentPairing.result === 1
					? beaters.concat(currentPairing.game1)
					: beaters
		}, [])

		const game1HasBeatenThese = resultsSoFar.reduce((beaters, currentPairing) => {
			return currentPairing.game1 === pairing.game1 && currentPairing.result === 1
				? beaters.concat(currentPairing.game2)
				: currentPairing.game2 === pairing.game1 && currentPairing.result === 2
					? beaters.concat(currentPairing.game1)
					: beaters
		}, [])

		const theseBeatGame2 = resultsSoFar.reduce((beaters, currentPairing) => {
			return currentPairing.game1 === pairing.game2 && currentPairing.result === 2
				? beaters.concat(currentPairing.game2)
				: currentPairing.game2 === pairing.game2 && currentPairing.result === 1
					? beaters.concat(currentPairing.game1)
					: beaters
		}, [])

		const game2HasBeatenThese = resultsSoFar.reduce((beaters, currentPairing) => {
			return currentPairing.game1 === pairing.game2 && currentPairing.result === 1
				? beaters.concat(currentPairing.game2)
				: currentPairing.game2 === pairing.game2 && currentPairing.result === 2
					? beaters.concat(currentPairing.game1)
					: beaters
		}, [])

		const game1Strength = utils.intersection(new Set(theseBeatGame2), new Set(game1HasBeatenThese)).size
		const game2Strength = utils.intersection(new Set(theseBeatGame1), new Set(game2HasBeatenThese)).size
		const prediction = game1Strength > game2Strength
			? 1
			: game1Strength === game2Strength
				? 0
				: 2

		// log(`Prediction: ${pairing.game1} strength is ${game1Strength}, ${pairing.game2} strength is ${game2Strength}`)

		return prediction
	}

	listTournaments () {
		log({ prefix: '\n', message: 'List of available tournaments:', suffix: '\n' })
		Object.keys(this._getAllConfig()).map(tournament => log(`– ${tournament}`))
		log('')
	}

	listGames (input) {
		const tournamentName = this._getTournamentFromInput(input)
		log('All the games in ' + chalk.yellow(tournamentName) + ':\n')
		let i = 1
		this._get(`${tournamentName}.games`).map(game => log(`${i++}. ${game}`))
	}

	async _compareTwoGames (tournamentName, pairing) {
		const predictedWinner = this._predictWinnerForPairing(tournamentName, pairing)
		const matchup = pairing.getMatchup(predictedWinner)
		await inquirer
			.prompt({
				type: 'expand',
				message: matchup,
				name: 'match',
				default: predictedWinner,
				choices: [
					{
						key: '1',
						name: pairing.getGame1(),
						value: 1
					},
					{
						key: '2',
						name: pairing.getGame2(),
						value: 2
					},
					new inquirer.Separator(),
					{
						key: 'q',
						name: 'Quit',
						value: 'quit'
					}
				]
			})
			.then(answer => {
				if (answer.match === 'quit') {
					process.exit(1)
				}
				pairing.setResult(answer.match)
			})
		return pairing
	}

	displayResults (input) {
		const tournamentName = this._getTournamentFromInput(input)
		const resolvedPairings = this._getResolvedPairings(tournamentName)
		const gameScores = []
		const gamesThisGameBeat = []

		resolvedPairings.map(pairing => {
			if (!gameScores[pairing.game1]) gameScores[pairing.game1] = 0
			if (!gameScores[pairing.game2]) gameScores[pairing.game2] = 0

			if (gamesThisGameBeat[pairing.game1] === undefined) gamesThisGameBeat[pairing.game1] = []
			if (gamesThisGameBeat[pairing.game2] === undefined) gamesThisGameBeat[pairing.game2] = []

			if (pairing.result === 1) {
				gameScores[pairing.game1] = gameScores[pairing.game1] + 1
				gamesThisGameBeat[pairing.game1].push(pairing.game2)
			}
			if (pairing.result === 2) {
				gameScores[pairing.game2] = gameScores[pairing.game2] + 1
				gamesThisGameBeat[pairing.game2].push(pairing.game1)
			}
		})

		const sortableScores = []
		const sosScores = []
		for (var game in gameScores) {
			var sosScore = 0
			gamesThisGameBeat[game].map(beatenGame => {
				if (gameScores[beatenGame]) sosScore += gameScores[beatenGame]
			})
			sosScores[game] = sosScore
			const floatScore = parseFloat(gameScores[game] + '.' + sosScore)
			sortableScores.push([game, floatScore])
		}

		sortableScores.sort(function (a, b) {
			return b[1] - a[1]
		})

		log({ prefix: '\n', message: `Results for ${chalk.yellow(tournamentName)}:`, suffix: '\n' })
		let rank = 0
		let prevScore = null
		let tiedGames = 1
		sortableScores.map(game => {
			const thisScore = game[1]
			if (thisScore === prevScore) {
				tiedGames++
			} else {
				prevScore = thisScore
				rank += tiedGames
				tiedGames = 1
			}
			log(`${chalk.gray(rank)}. ${game[0]} ${chalk.gray('(' + thisScore + ')')}`)
		})
		log('')
	}

	async compareGames (input) {
		const tournamentName = this._getTournamentFromInput(input)
		const unresolvedPairings = this._getUnresolvedPairings(tournamentName)
		const resolvedPairings = this._getResolvedPairings(tournamentName)

		var done = resolvedPairings.length
		var total = resolvedPairings.length + unresolvedPairings.length

		if (done === total) {
			log({ prefix: '\n', message: 'All pairings resolved, nothing else to do but to admire the results!' })
			this.displayResults(input)
			process.exit(1)
		}
		log(`Resolved ${done}/${total}`)

		do {
			const pairingObject = unresolvedPairings.shift()
			const pairing = new Pairing(pairingObject.game1, pairingObject.game2, pairingObject.result)
			const resolvedPairing = await this._compareTwoGames(tournamentName, pairing)

			const resolvedPairings = this._getResolvedPairings(tournamentName)
			resolvedPairings.push(resolvedPairing)

			this._save(tournamentName, 'unresolvedPairings', unresolvedPairings)
			this._save(tournamentName, 'resolvedPairings', resolvedPairings)

			done = resolvedPairings.length
			total = resolvedPairings.length + unresolvedPairings.length
			log(`Resolved ${done}/${total}`)
		} while (unresolvedPairings.length > 0)

		this.displayResults(input)
	}

	async initGames (filename, input) {
		const tournamentName = input[0]
			? input[0]
			: utils.generateTournamentName()

		log('Tournament name: ' + chalk.yellow(tournamentName) + '\n')

		if (this._get(tournamentName) !== undefined) {
			await inquirer
				.prompt({
					type: 'confirm',
					name: 'confirmOverwrite',
					message: `Tournament ${chalk.yellow(tournamentName)} already exists, are you sure you want to overwrite?`,
					default: false
				})
				.then(answer => {
					if (!answer.confirmOverwrite) {
						process.exit(1)
					}
				})
		}

		const fs = require('fs')
		const gameListString = fs.readFileSync(filename, 'utf-8')
		const gameList = gameListString.split('\n').filter(string => string.length > 0 && string.charAt(0) !== '#')

		log('Read a list of games:')
		let i = 1
		gameList.map(string => log(`${i++}. ${string}`))

		this._delete(tournamentName)
		this._save(tournamentName, 'games', gameList)

		this._generateRoundRobinPairings(tournamentName)
	}
}

module.exports = new Turnamentti()
