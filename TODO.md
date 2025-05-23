# TODO List

1. [DONE] Make a container that occupies the entire screen area, we will put other stuff into it soon.
2. [DONE] add a /api/count endpoint, POST, and hook it up to sqlite table which just records the number of times it was called. it should write to a file in the /db/ directory.
3. [DONE] Bottom "start bar" - put an area there at the bottom, we will put more stuff into it later. There will eventually be a hud, a hamburger menu, and some other buttons
4. [DONE] Start menu can be used to swap between 3-4 user screens and 3-4 dev/debug screens (TBD). So first build a pair of buttons in start menu to swap between 2 sample screens (with some filler text + colors for now).
5. [DONE] Make a db model for "protocards" - they just have an id and a text body, for now. Eventually they'll have multiple text box data fields. This is disinct from "physcards" which refer to a protocard id, but can carry some ingame state.
6. Add route from frontend screen 2 that gets the # of protocards and displays that count
7. Set up SSE server side events to get push info from backend.
8. Set up tracking for frontend state -- frontend wants to hold the same state as backend when user makes changes, so we need to track "pending" and "synced" state of all changes.
8. Add routes from frontend screen 2 that 1) fetch all protocards, and 2) allows user to creates a new protocard with empty text body. Since (2) is a write, the behavior should be to update the frontend data model first into the "pending" state then sync it up to the backend and confirm the frontend model when we receive the confirmation from backend.


LATER 
1. Make a "dev" screen and make it the default. On the dev screen, we can edit the text on the cards and add new cards.
2. Make spinner into a standalone reusable component that can elide what else is being loaded
3. 2 large card rows - one at top and one at bottom. Fill them with placeholder cards for now (7x12, tarot dimensions)
4. Special areas at the left or right of the card rows, e.g. for the deck
5. Card interaction - when one is selected it takes up the ENTIRE screen, then actions are available like highlight it, move it somewhere
6. Interact with the deck to: view it unsorted, sorted, or bubble shuffle it
7. Store the entire player-side game state into a base64 in the url: refer to cards by their protoids and specify their positions.
