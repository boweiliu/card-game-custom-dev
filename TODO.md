# TODO List

1. [DONE] Make a container that occupies the entire screen area, we will put other stuff into it soon.
2. [DONE] add a /api/count endpoint, POST, and hook it up to sqlite table which just records the number of times it was called. it should write to a file in the /db/ directory.
3. [DONE] Bottom "start bar" - put an area there at the bottom, we will put more stuff into it later. There will eventually be a hud, a hamburger menu, and some other buttons
4. Start menu can be used to swap between 3-4 user screens and 3-4 dev/debug screens (TBD). So first build a pair of buttons in start menu to swap between 2 sample screens (with some filler text + colors for now).
5. Make a db model for "protocards" - they just have an id and a text body, for now. Eventually they'll have multiple text box data fields. This is disinct from "physcards" which refer to a protocard id, but can carry some ingame state.
6. Make a "dev" screen and make it the default. On the dev screen, we can edit the text on the cards and add new cards.
7. Make spinner into a standalone reusable component that can elide what else is being loaded
8. 2 large card rows - one at top and one at bottom. Fill them with placeholder cards for now (7x12, tarot dimensions)
9. Special areas at the left or right of the card rows, e.g. for the deck
10. Card interaction - when one is selected it takes up the ENTIRE screen, then actions are available like highlight it, move it somewhere
11. Interact with the deck to: view it unsorted, sorted, or bubble shuffle it
12. Store the entire player-side game state into a base64 in the url: refer to cards by their protoids and specify their positions.
