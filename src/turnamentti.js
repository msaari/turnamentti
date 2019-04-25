#!/usr/bin/env node
const utils = require('./utils')
const chalk = require('chalk')
const signale = require('signale')
const { success, error, log } = signale
const Pairing = require('./pairing')

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

	_getAllConfig () {
		return this._conf.all
	}

	_generateRoundRobinPairings (tournamentName) {
		const games = this._getGames(tournamentName)
		const pairings = []
		for (let i = 0; i < games.length; i++) {
			for (let j = i + 1; j < games.length; j++) {
				const pairing = new Pairing(games[i], games[j])
				pairings.push(pairing)
			}
		}
		success({ prefix: '\n', message: 'Generated ' + chalk.green(pairings.length) + ' pairings for a full round-robin.' })
		utils.shuffleArray(pairings)
		this._save(tournamentName, 'pairings', pairings)
	}

	listTournaments () {
		log('\nList of available tournaments:')
		Object.keys(this._getAllConfig()).map(tournament => log(`– ${tournament}`))
	}

	listGames (input) {
		if (input.length < 1) {
			error('No tournament selected.')
			this.listTournaments()
			process.exit(1)
		}
		const tournamentName = input[0]
		log('All the games in ' + chalk.yellow(tournamentName) + ':\n')
		let i = 1
		this._get(`${tournamentName}.games`).map(game => log(`${i++}. ${game}`))
	}

	initGames (filename, input) {
		const tournamentName = input[0]
			? input[0]
			: utils.generateTournamentName()

		log('Tournament name: ' + chalk.yellow(tournamentName) + '\n')

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
