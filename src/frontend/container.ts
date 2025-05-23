import { FULLSCREEN_CONTAINER_PARENT_ID, FULL_SCREEN_CONTAINER_ID, CONTENT_CONTAINER_ID, ADD_CARD_ID, CARD_CONTAINER_ID, LOADING_INDICATOR_ID } from './div-ids';

const fullScreenContainerTemplate = () => `
  <div id="${FULLSCREEN_CONTAINER_PARENT_ID}">
    <div id="${FULL_SCREEN_CONTAINER_ID}" class="full-screen-container">
      <div class="container">
        <h1>Card Game Simulator</h1>
        <div id="${CONTENT_CONTAINER_ID}">
          <button id="${ADD_CARD_ID}">Add Card</button>
          <div id="${CARD_CONTAINER_ID}"></div>
        </div>
        <div id="${LOADING_INDICATOR_ID}"></div>
      </div>
    </div>
  </div>
`;

export function loadFullScreenContainer() {
  const appRoot = $('#app-root');
  appRoot.addClass('global-body-style');
  appRoot.append(fullScreenContainerTemplate());
}
