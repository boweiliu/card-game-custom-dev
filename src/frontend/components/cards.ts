export const cardTemplate = (cardId: number, cardContent: string) => `
  <div class="card" data-id="${cardId}">
    <div class="card-content">${cardContent}</div>
    <button class="delete-card">Delete</button>
  </div>
`;
