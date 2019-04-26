const chalk = require('chalk')

class Pairing {
	constructor (game1, game2, result) {
		this._game1 = game1 < game2 ? game1 : game2
		this._game2 = game2 > game1 ? game2 : game1
		this._result = result
		this._retire = null
	}

	getMatchup (predictedWinner, resolvedPairings) {
		const gameStats1 = {
			matches: 0,
			wins: 0
		}
		const gameStats2 = {
			matches: 0,
			wins: 0
		}
		resolvedPairings.map(pairing => {
			if (pairing._game1 === this._game1) {
				gameStats1.matches++
				if (pairing._result === 1) gameStats1.wins++
			}
			if (pairing._game2 === this._game1) {
				gameStats1.matches++
				if (pairing._result === 2) gameStats1.wins++
			}
			if (pairing._game1 === this._game2) {
				gameStats2.matches++
				if (pairing._result === 1) gameStats2.wins++
			}
			if (pairing._game2 === this._game2) {
				gameStats2.matches++
				if (pairing._result === 2) gameStats2.wins++
			}
		})

		const game1 = predictedWinner === 1
			? chalk.red(this._game1)
			: this._game1

		const game2 = predictedWinner === 2
			? chalk.red(this._game2)
			: this._game2

		return `${game1} (${gameStats1.wins}/${gameStats1.matches}) vs ${game2} (${gameStats2.wins}/${gameStats2.matches})`
	}

	getGame1 () {
		return this._game1
	}

	getGame2 () {
		return this._game2
	}

	setResult (value) {
		if (value === 1 || value === 2) {
			this._result = value
		}
	}

	retire (value) {
		if (value === 1 || value === 2) {
			this._retire = value
		}
	}

	isRetired () {
		return this._retire
			? this._retire === 1
				? this._game1
				: this._game2
			: undefined
	}
}

module.exports = Pairing
