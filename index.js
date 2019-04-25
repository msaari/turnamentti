const utils = require('./src/utils')
const turnamentti = require('./src/turnamentti')

const turnamenttiCLI = async (input, flags) => {
	if (flags.init && utils.fileExists(flags.init)) {
		return turnamentti.initGames(flags.init, input)
	}
	if (flags.listGames) {
		return turnamentti.listGames(input)
	}
}

module.exports = turnamenttiCLI
