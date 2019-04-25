class Pairing {
	constructor (game1, game2) {
		this.game1 = game1 < game2 ? game1 : game2
		this.game2 = game2 > game1 ? game2 : game1
		this.result = 0
	}
}

module.exports = Pairing
