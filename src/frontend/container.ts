import { APP_ROOT, FULLSCREEN_PARENT, FULLSCREEN, CONTENT, ADD_CARD, CARD, LOADING, $id } from './div-ids';

const fullScreenContainerTemplate = () => `
  <div id="${FULLSCREEN_PARENT}">
    <div id="${FULLSCREEN}" class="full-screen-container">
      <div class="container">
        <h1>Card Game Simulator</h1>
        <div id="${CONTENT}">
          <button id="${ADD_CARD}">Add Card</button>
          <div id="${CARD}"></div>
        </div>
        <div id="${LOADING}"></div>
      </div>
    </div>
  </div>
`;

export function loadFullScreenContainer() {
  const appRoot = $id(APP_ROOT);
  appRoot.addClass('global-body-style');
  appRoot.append(fullScreenContainerTemplate());
}
