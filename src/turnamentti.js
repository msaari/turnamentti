#!/usr/bin/env node
const utils = require('./utils')
const chalk = require('chalk')
const signale = require('signale')
const { success, error, log } = signale
const Pairing = require('./pairing')
const inquirer = require('inquirer')
const _ = require('lodash')

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
		const resolvedPairings = this._getResolvedPairings(tournamentName)
		const matchup = pairing.getMatchup(predictedWinner, resolvedPairings)
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
						name: `Retire ${pairing.getGame1()}`,
						value: 'r1'
					},
					{
						key: 'w',
						name: `Retire ${pairing.getGame2()}`,
						value: 'r2'
					},
					new inquirer.Separator(),
					{
						key: 'x',
						name: 'Exit',
						value: 'exit'
					}
				]
			})
			.then(answer => {
				if (answer.match === 'exit') {
					process.exit(1)
				} else if (answer.match === 1 || answer.match === 2) {
					pairing.setResult(answer.match)
				} else if (answer.match === 'r1') {
					pairing.setResult(2)
					pairing.retire(1)
				} else if (answer.match === 'r2') {
					pairing.setResult(1)
					pairing.retire(2)
				}
			})
		return pairing
	}

	displayResults (input) {
		const tournamentName = this._getTournamentFromInput(input)
		const resolvedPairings = this._getResolvedPairings(tournamentName)
		const gameScores = []
		const gamesThisGameBeat = []

		resolvedPairings.map(pairing => {
			const game1 = pairing._game1
			const game2 = pairing._game2
			const result = pairing._result

			if (!gameScores[game1]) gameScores[game1] = 0
			if (!gameScores[game2]) gameScores[game2] = 0

			if (gamesThisGameBeat[game1] === undefined) gamesThisGameBeat[game1] = []
			if (gamesThisGameBeat[game2] === undefined) gamesThisGameBeat[game2] = []

			if (result === 1) {
				gameScores[game1] = gameScores[game1] + 1
				gamesThisGameBeat[game1].push(game2)
			}
			if (result === 2) {
				gameScores[game2] = gameScores[game2] + 1
				gamesThisGameBeat[game2].push(game1)
			}
		})

		const sortableScores = []
		const sosScores = []
		for (var game in gameScores) {
			var sosScore = 0
			gamesThisGameBeat[game].map(beatenGame => {
				if (gameScores[beatenGame]) sosScore += gameScores[beatenGame]
			})
			sosScores.push([game, sosScore])
		}

		const maxSosScore = sosScores.reduce((acc, sos) => { return Math.max(acc, sos[1]) }, 0)
		const maxSosScoreDivider = Math.pow(10, maxSosScore.toString().length)

		for (game in gameScores) {
			var sosScoreObject = sosScores.find(score => score[0] === game)
			sosScore = sosScoreObject[1]
			sortableScores.push([game, parseFloat(gameScores[game] + '.' + String(sosScore / maxSosScoreDivider).replace('0.', ''))])
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
		let unresolvedPairings = this._getUnresolvedPairings(tournamentName)
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
			const pairing = new Pairing(pairingObject._game1, pairingObject._game2, pairingObject._result)
			const resolvedPairing = await this._compareTwoGames(tournamentName, pairing)

			const retired = resolvedPairing.isRetired()
			if (retired) {
				const retiredPairings = _.remove(unresolvedPairings, function (pairing) { return pairing._game1 === retired || pairing._game2 === retired })
				success(`Retired ${retired}, removed ${retiredPairings.length} pairings.`)
			}
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
