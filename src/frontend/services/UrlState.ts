/**
 * We will use url data to store some basic state
 *
 * We still want to use the backend to e.g. store full game and update history
 * as well as protocard text and behavior
 *
 * However since our instantaneous game state is pretty small (just ordered lists of protocard ids pretty much)
 * we can just shove it all into the url, and make saving/loading games super easy
 *
 * We should also make sure to record a game history id, so we CAN fetch the game history from backend if its available
 */
