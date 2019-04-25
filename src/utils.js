const fs = require('fs')
const signale = require('signale')
const { error, fatal } = signale

const generateTournamentName = () => {
	const crypto = require('crypto')
	return crypto.randomBytes(Math.ceil(4)).toString('hex').slice(0, 8)
}

const fileExists = (filename) => {
	try {
		if (!fs.existsSync(filename)) {
			error(`File ${filename} doesn't exist!`)
			process.exit(1)
		}
	} catch (exception) {
		fatal(exception)
		process.exit(1)
	}
	return true
}

const shuffleArray = (array) => {
	for (var i = array.length - 1; i > 0; i--) {
		var j = Math.floor(Math.random() * (i + 1))
		var temp = array[i]
		array[i] = array[j]
		array[j] = temp
	}
}

module.exports = {
	fileExists,
	generateTournamentName,
	shuffleArray
}
