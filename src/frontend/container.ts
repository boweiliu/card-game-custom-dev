import { APP_ROOT, FULLSCREEN_PARENT, FULLSCREEN, CONTENT, ADD_CARD, CARD, LOADING, $id } from './div-ids';
import * as styles from './container.module.less';

const fullScreenContainerTemplate = () => `
  <div id="${FULLSCREEN_PARENT}">
    <div id="${FULLSCREEN}" class="${styles.fullScreenContainer}">
      <div class="${styles.container}">
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
  appRoot.addClass(styles.globalBodyStyle);
  appRoot.append(fullScreenContainerTemplate());
}
