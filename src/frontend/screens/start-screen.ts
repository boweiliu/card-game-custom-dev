import { CONTENT, ADD_CARD, CARD, LOADING } from '../div-ids';

export function getStartScreenContent(): string {
  return `
    <div>
      <h1>Card Game Simulator</h1>
      <div id="${CONTENT}">
        <button id="${ADD_CARD}">Add Card</button>
        <div id="${CARD}"></div>
      </div>
      <div id="${LOADING}"></div>
    </div>
  `;
}