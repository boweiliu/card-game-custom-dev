# TODO List

1. [DONE] Set up a linter such as Prettier to ensure consistent code formatting across the project.
2. [DONE] Modify `npm run dev` to automatically spin up the backend server along with the frontend.
3. [DONE] Fix webpack configs so it knows the backend proxy port is 43210 (specified via BE_PORT)
4. [DONE] Fix backend so it serves something reasonable on '/' as well, maybe ping again
5. [DONE] Fix 'npm run build:fe' to actually use webpack. it should build index.html and bundle.js into dist.
6. [DONE] Add a loading state to FE to check /api/ping route on the BE.
7. [DONE] BE's /api/ping route should console log
8. [DONE] BE's / route should error when run in `npm run dev` mode - why is the dev mode check failing?
9. Set up less for css
10. Make the FE webpack build into ./dist/frontend and then point BE and serve to dist/frontend rather n than just dist -- this should prevent server code from leaking into FE
11. Disable /api/ping from being 304'd (need to set it on both FE and BE probably)

