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
			--compareGames, -c	Run comparisons between games
			--displayResults, -d	Display tournament results
 
		Examples
			$ turnamentti uwetop10 --init list_of_games.txt
			$ turnamentti --listGames uwetop10 
			$ turnamentti --compareGames uwetop10
			$ turnamentti --displayResults uwetop10
`, {
	flags: {
		init: {
			type: 'string',
			alias: 'i'
		},
		listGames: {
			type: 'boolean',
			alias: 'l'
		},
		compareGames: {
			type: 'boolean',
			alias: 'c'
		},
		displayResults: {
			type: 'boolean',
			alias: 'd'
		}
	}
})

turnamentti(cli.input, cli.flags)
