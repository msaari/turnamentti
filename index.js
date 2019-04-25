const turnamenttiCLI = (input, flags) => {
	if (flags.init) {
		const LineReader = require('node-line-reader').LineReader
		
		const reader = new LineReader(flags.init)
		
		reader.nextLine((err, line) => {
			if (!err) {
				console.log(line)
			}
		})
	}
	console.log('Usage: turnamentti --init files')
}

module.exports = turnamenttiCLI