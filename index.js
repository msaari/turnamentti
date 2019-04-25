const utils = require('./src/utils').default

const turnamenttiCLI = async (input, flags) => {
	if (flags.init && utils.fileExists(flags.init)) {
		const Reader = require('./src/reader')

		const reader = new Reader(flags.init)
		const fileContents = []

		let line = ''
		while (line !== null) {
			line = await reader.nextLine()
			if (line === null) break
			if (line.length < 1) continue
			if (line.charAt(0) === '#') continue
			fileContents.push(line)
		}
		console.log('fileContents', fileContents)
	}
}

module.exports = turnamenttiCLI
