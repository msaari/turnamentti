#!/usr/bin/env node
'use strict'
const meow = require('meow')
const turnamentti = require('.')

const cli = meow(`
		Usage
			$ turnamentti <name_of_the_tournament>
 
		Options
			--init, -i  Initialize the tournament with a list of games
			--listGames, -l	List games in the tournament
 
		Examples
			$ turnamentti uwetop10 --init list_of_games.txt
			$ turnamentti 
`, {
	flags: {
		init: {
			type: 'string',
			alias: 'i'
		},
		listGames: {
			type: 'boolean',
			alias: 'l'
		}
	}
})

turnamentti(cli.input, cli.flags)
