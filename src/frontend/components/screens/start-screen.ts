import { CONTENT, ADD_CARD, CARD, LOADING } from '@/frontend/utils/div-ids';
import * as styles from '@/frontend/components/container/container.module.less';

export function getStartScreenContent(): string {
  return `
    <div>
      <h1 class="${styles.title}">Card Game Simulator</h1>
      <div id="${CONTENT}">
        <button id="${ADD_CARD}" class="${styles.addCard}">Add Card</button>
        <div id="${CARD}"></div>
      </div>
      <div id="${LOADING}"></div>
    </div>
  `;
}
