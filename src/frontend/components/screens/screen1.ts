import { CONTENT, ADD_CARD, CARD, LOADING } from '@/frontend/utils/div-ids';
import * as styles from '@/frontend/components/container/container.module.less';

export function getScreen1Content(): string {
  return `
    <div>
      <h1 class="${styles.title}">Screen 1 - User View</h1>
      <p>Sample screen with light blue background.</p>
      <div id="${CONTENT}">
        <button id="${ADD_CARD}" class="${styles.addCard}">Add Card</button>
        <div id="${CARD}"></div>
      </div>
      <div id="${LOADING}"></div>
    </div>
  `;
}
