# TODO List

1. [DONE] Make a container that occupies the entire screen area, we will put other stuff into it soon.
2. [DONE] add a /api/count endpoint, POST, and hook it up to sqlite table which just records the number of times it was called. it should write to a file in the /db/ directory.
3. [DONE] Bottom "start bar" - put an area there at the bottom, we will put more stuff into it later. There will eventually be a hud, a hamburger menu, and some other buttons
4. [DONE] Start menu can be used to swap between 3-4 user screens and 3-4 dev/debug screens (TBD). So first build a pair of buttons in start menu to swap between 2 sample screens (with some filler text + colors for now).
5. [DONE] Make a db model for "protocards" - they just have an id and a text body, for now. Eventually they'll have multiple text box data fields. This is disinct from "physcards" which refer to a protocard id, but can carry some ingame state.
6. [DONE] Add route from frontend screen 2 that gets the # of protocards on first load, and displays that count
7. [DONE] Set up SSE server side events to get push info from backend.
8. [DONE] Clean up code and module structure - separate out screens into their own components, separate individual groups of backedn routes too
9. [DONE] Figure out if we need to manually write to the DB file
10. [DONE] Add ability for backend to listen to changes from the database [realistically -- since DB is held in the same sqlite process -- this just looks like backend being able to notify other client SSE streams of changes. use a pub sub interface but just back it by shared backend state for now.]
11. Set up tracking for frontend state for full list of protocards -- frontend wants to hold the same state as backend when user makes changes, so we need to track "pending" and "synced" state of all changes. Start by fetching the full protocard list on first load.
12. Add routes from frontend screen 2 that 1) fetch all protocards, and 2) allows user to creates a new protocard with empty text body. Since (2) is a write, the behavior should be to update the frontend data model first into the "pending" state then sync it up to the backend and confirm the frontend model when we receive the confirmation from backend.
13. Add stacktrace tracking to the pub sub, so that we aren't completely blindsided when a sub change is triggered but we cant tell from where
14. Remember to put back in the ability for SSE subscribers to only listen for events they care about, rather than broadcast to all
15. Split up the docker build into 3 steps -- FE only (delete BE code), BE only (delete FE code), and then port the artifacts over and actually run stuff. This compresses the image and also ensures no BE <> FE dependency.
16. Make sure DB_PATH is working properly both on dev and prod (just set the env variable manually), and ideally also use a fly volume to make sure it persists in prod.
17. Version the protocards, i.e. make the db immutable and append-only and when we want to fetch stuff just fetch thel atest versions
18. Add a model for game history playouts -- these will be write-only (since FE will manage all the state edits) but we just want a record of the actions and game states passed through. Each game history snapshot should have like a list of all the physcards (which refer to protocards), and their positions (deck/hand/score), and separately we also need a record of all game actions in the tree structure - user actions, triggered actions, down to even deck shuffle operations; and each action should point to the game history snapshot it was created from (or vice versa)
19. all ids (message/correlation, entity) should have a prefix so we can easily tell where they come from. For DB ids -- either start managing id creation in backend, or have backend DB prepend the string prefix. For other ids, have a centralized place the branded id strings are created, and also make sure validation checks for the correct prefix on transport.

LATER

1. On the dev screen (Screen #2), user should be able to edit the text on the cards and add new cards.
2. Make spinner into a standalone reusable component that can elide what else is being loaded
3. 2 large card rows - one at top and one at bottom. Fill them with placeholder cards for now (7x12, tarot dimensions)
4. Special areas at the left or right of the card rows, e.g. for the deck
5. Card interaction - when one is selected it takes up the ENTIRE screen (keep the card dimensions but use a modal), then actions are available like highlight it, move it somewhere
6. Interact with the deck to: view it unsorted, sorted, or bubble shuffle it
7. Store the entire player-side game state into a base64 in the url: refer to cards by their protoids and specify their positions.

# LLM-suggested TODOs (DONT DO THESE RIGHT NOW, most of them are bad)

## Architecture & Infrastructure

1. Add error boundaries and global error handling for the frontend
2. Implement database migrations system for schema changes
3. Implement request/response logging middleware for debugging

## User Experience & Interface

7. Add loading states and skeleton screens for better perceived performance
8. Implement keyboard shortcuts for common actions (ESC to close modals, etc.)
9. Add confirmation dialogs for destructive actions (delete protocards, etc.)
10. Create a consistent color theme system using CSS custom properties
11. Add responsive design for mobile/tablet devices
12. Implement undo/redo functionality for user actions

## Developer Experience

13. Add Jest unit tests for shared types and utility functions
14. Add TypeScript strict mode and resolve any type issues
15. Create development seed data for consistent testing

## Performance & Optimization

19. Implement virtual scrolling for large lists of protocards
20. Optimize bundle size with code splitting and lazy loading
21. Add service worker for offline functionality
22. Implement debounced search and filtering
23. Add compression middleware for API responses

## Security & Reliability

29. Add health check endpoints for monitoring
30. Implement proper error codes and consistent error responses
