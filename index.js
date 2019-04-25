const utils = require('./src/utils')
const turnamentti = require('./src/turnamentti')

const turnamenttiCLI = async (input, flags) => {
	if (flags.init && utils.fileExists(flags.init)) {
		return turnamentti.initGames(flags.init, input)
	}
	if (flags.listGames) {
		return turnamentti.listGames(input)
	}
	if (flags.compareGames) {
		return turnamentti.compareGames(input)
	}
	if (flags.displayResults) {
		return turnamentti.displayResults(input)
	}

	return turnamentti.listTournaments()
}

module.exports = turnamenttiCLI
