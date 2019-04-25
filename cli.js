#!/usr/bin/env node
'use strict'
const meow = require('meow')
const turnamentti = require('.')

const cli = meow(`
    Usage
      $ turnamentti <input>
 
    Options
      --init, -i  Initialize with a list of games
 
    Examples
      $ turnamentti --init list_of_games.txt
`, {
    flags: {
        init: {
            type: 'string',
            alias: 'i'
        }
    }
});

turnamentti(cli.input, cli.flags)