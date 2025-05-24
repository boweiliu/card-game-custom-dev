import * as styles from '@/frontend/components/cards.module.less';

export const cardTemplate = (cardId: number | string, cardContent: string) => `
  <div class="${styles.card}" data-id="${cardId}">
    <div class="card-content">${cardContent}</div>
    <button class="delete-card">Delete</button>
  </div>
`;
