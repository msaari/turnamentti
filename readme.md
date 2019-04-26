# Turnamentti

## Create top lists by having items compete against each other

## Description

If you want to come up with top 10 board games by Uwe Rosenberg, Turnamentti will help you put all those great games in the right order. Just list all the games you want to consider in a text file, feed the file to Turnamentti and then answer simple questions that put two games against each other and all you have to do is to pick the game you prefer. Once you've answered enough questions, you'll get a list of results in order of your preference.

Turnamentti is made for creating board game ranking lists, but it can be used for anything. However, the options refer to games to respect the original purpose of the program.

## Install

### NPM

```bash
npm install --global turnamentti
```

## Usage

```
$ turnamentti --help

    Usage
      $ turnamentti <name_of_the_tournament>
 
    Options
      --init, -i  			Initialize the tournament with a list of games
      --listGames, -l			List games in the tournament
      --compareGames, -c		Run comparisons between games
      --displayResults, -d	Display tournament results

    Examples
      $ turnamentti uwetop10 --init list_of_uwe_games.txt
      $ turnamentti --listGames uwetop10
      $ turnamentti --compareGames uwetop10
      $ turnamentti --displayResults uwetop10
```

## Notes

Turnamentti runs a full round-robin tournament. For N items, that's (N^2 - N) / 2 matchups. It's a lot, but most of the time you don't have to go through the whole round-robin to get a decent set of results.

Also, in order to make the round-robin shorter, you can retire items. When you see a matchup, you'll see the stats (wins/total matches) for each item. If some item is doing poorly, it's time to retire it out of the tournament. When you choose to retire an item, the other item will win the matchup and all matchups featuring the retired item will be removed from the schedule.

When comparing items, once Turnamentti has enough data it will start offering predictions about which item you'll prefer. The predicted winner of the matchup will be shown in red.

The final results will feature a floating point number as a score for each item. The integer part of the number is the number of victories the item has. The decimal part that is used to break ties is the total points of the items that item has beaten.

## Author

- Mikko Saari [(@msaari)](https://github.com/msaari)

## License

[MIT](https://github.com/msaari/turnamentti/blob/master/license.md)