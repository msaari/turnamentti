// From https://github.com/T-PWK/node-line-reader/issues/1

const LineReader = require('node-line-reader').LineReader

class Reader {
	constructor (file) {
		this.reader = new LineReader(file)
	}
	nextLine () {
		return new Promise((resolve, reject) => {
			this.reader.nextLine((err, line) => {
				if (err) return reject(err)
				resolve(line)
			})
		})
	}
}

module.exports = Reader
