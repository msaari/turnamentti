const fs = require('fs')

const fileExists = (filename) => {
	try {
		if (!fs.existsSync(filename)) {
			console.error(`File ${filename} doesn't exist!`)
			return false
		}
	} catch (exception) {
		console.error(exception)
	}
	return true
}

module.exports = {
	fileExists
}
