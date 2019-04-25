const chalk = require('chalk')

class Pairing {
	constructor (game1, game2, result) {
		this.game1 = game1 < game2 ? game1 : game2
		this.game2 = game2 > game1 ? game2 : game1
		this.result = 0
	}

	getMatchup (predictedWinner) {
		const game1 = predictedWinner === 1
			? chalk.red(this.game1)
			: this.game1

		const game2 = predictedWinner === 2
			? chalk.red(this.game2)
			: this.game2

		return `${game1} vs ${game2}`
	}

	getGame1 () {
		return this.game1
	}

	getGame2 () {
		return this.game2
	}

	setResult (value) {
		if (value === 1 || value === 2) {
			this.result = value
		}
	}
}

module.exports = Pairing
