import {
  APP_ROOT,
  FULLSCREEN_PARENT,
  FULLSCREEN,
  CONTENT,
  ADD_CARD,
  CARD,
  LOADING,
  START_BAR,
  START_SCREEN_BTN,
  SCREEN_1_BTN,
  SCREEN_2_BTN,
  PROTOCARD_COUNT,
  SSE_STATUS,
  $id,
} from '@/frontend/div-ids';
import * as styles from '@/frontend/container.module.less';
import { sseService } from '@/frontend/sse-service';
import { getStartScreenContent } from '@/frontend/screens/start-screen';
import { getScreen1Content } from '@/frontend/screens/screen1';
import { getScreen2Content } from '@/frontend/screens/screen2';
import { protocardApi } from '@/frontend/api/protocards';
import { ApiError } from '@/frontend/api/client';

const fullScreenContainerTemplate = () => `
  <div id="${FULLSCREEN_PARENT}" class="${styles.fullScreenContainerParent}">
    <div id="${FULLSCREEN}" class="${styles.fullScreenContainer}">
      <div class="${styles.verticalLayout}">
        <div class="${styles.placeholderContainer}">
          <div>
            <h1>Card Game Simulator</h1>
            <div id="${CONTENT}">
              <button id="${ADD_CARD}">Add Card</button>
              <div id="${CARD}"></div>
            </div>
            <div id="${LOADING}"></div>
          </div>
        </div>
        <div id="${START_BAR}" class="${styles.startBar}">
          <button id="${START_SCREEN_BTN}" class="${styles.screenButton}">Start Screen</button>
          <button id="${SCREEN_1_BTN}" class="${styles.screenButton}">Screen 1</button>
          <button id="${SCREEN_2_BTN}" class="${styles.screenButton}">Screen 2</button>
        </div>
      </div>
    </div>
  </div>
`;

class ScreenManager {
  private $placeholderContainer: JQuery;
  private protocardCount: number = 0;

  constructor() {
    this.$placeholderContainer = $id(FULLSCREEN).find(
      `.${styles.placeholderContainer}`
    );
    this.setupEventListeners();
    this.loadProtocardCount();
    this.showScreen(0);

    // Connect to SSE
    sseService.connect();
  }

  private async loadProtocardCount() {
    try {
      this.protocardCount = await protocardApi.getCount();
      // Update screen 2 if it's currently showing
      if (this.$placeholderContainer.hasClass(styles.screen2)) {
        this.showScreen(2);
      }
    } catch (error) {
      if (error instanceof ApiError) {
        console.error('Failed to fetch protocard count:', error.message);
      } else {
        console.error('Unexpected error fetching protocard count:', error);
      }
    }
  }

  private setupEventListeners() {
    $id(START_SCREEN_BTN).on('click', () => this.showScreen(0));
    $id(SCREEN_1_BTN).on('click', () => this.showScreen(1));
    $id(SCREEN_2_BTN).on('click', () => this.showScreen(2));
  }

  private showScreen(screenNumber: number) {
    // Update button states
    $id(START_SCREEN_BTN).toggleClass(styles.active, screenNumber === 0);
    $id(SCREEN_1_BTN).toggleClass(styles.active, screenNumber === 1);
    $id(SCREEN_2_BTN).toggleClass(styles.active, screenNumber === 2);

    // Update container background
    this.$placeholderContainer
      .removeClass(`${styles.screen1} ${styles.screen2}`)
      .addClass(
        screenNumber === 1
          ? styles.screen1
          : screenNumber === 2
            ? styles.screen2
            : ''
      );

    // Update content
    let content: string;
    switch (screenNumber) {
      case 0:
        content = getStartScreenContent();
        break;
      case 1:
        content = getScreen1Content();
        break;
      case 2:
        content = getScreen2Content(this.protocardCount);
        break;
      default:
        content = getStartScreenContent();
    }
    this.$placeholderContainer.html(content);
  }
}

export async function loadFullScreenContainer() {
  const appRoot = $id(APP_ROOT);
  appRoot.addClass(styles.globalBodyStyle);

  appRoot.append(fullScreenContainerTemplate());

  // Initialize screen manager after DOM is ready
  new ScreenManager();
}
