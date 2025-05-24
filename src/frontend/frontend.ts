import '@/frontend/styles.less';
import { Spinner } from '@/frontend/spinner';
import { loadFullScreenContainer } from '@/frontend/container';
import { cardTemplate } from '@/frontend/cards';
import { $id, ADD_CARD, CARD, LOADING } from '@/frontend/div-ids';
import { Protocard } from '@/shared/types/db';

interface Card {
  id: number;
  content: string;
  x_position: number;
  y_position: number;
}

class CardManager {
  private cards: Card[] = [];
  private $container: JQuery;
  private $loadingIndicator: JQuery;
  private spinner: Spinner;

  constructor() {
    this.$container = $id(CARD);
    this.$loadingIndicator = $id(LOADING);
    this.spinner = new Spinner();
    this.checkBackendStatus();
  }

  private async checkBackendStatus() {
    this.spinner.show();
    try {
      const response = await fetch('/api/ping');
      if (response.ok) {
        this.$loadingIndicator.hide();
        console.log('Backend is up:', response);
        const data = await response.json();
        console.log('Backend is up:', data);
      } else {
        const text = `Not Connected to ${response.url} - server ${response.status}`;
        this.$loadingIndicator.css('color', 'red');
        this.$loadingIndicator.text(text);
        console.log(text);
      }
    } catch (error) {
      console.error('Backend is down:', error);
      this.$loadingIndicator.text('Not Connected ' + error);
    } finally {
      this.spinner.hide();
    }
  }

  public setupEventListeners() {
    $(document)
      .off('click', '.card')
      .on('click', '.card', (e) => {
        const $card = $(e.currentTarget);
        this.editCard($card);
      });

    $(document)
      .off('click', '.delete-card')
      .on('click', '.delete-card', (e) => {
        const $card = $(e.currentTarget).closest('.card');
        this.deleteCard($card.data('id'));
      });

    $id(ADD_CARD)
      .off('click')
      .on('click', () => this.createCard());
  }

  private async editCard($card: JQuery) {
    const content = prompt(
      'Edit card content:',
      $card.find('.card-content').text()
    );
    if (!content) return;

    const id = $card.data('id');
    try {
      await $.ajax({
        url: `/api/cards/${id}`,
        method: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify({ content }),
      });
      $card.find('.card-content').text(content);
    } catch (error) {
      console.error('Error editing card:', error);
    }
  }

  private async deleteCard(id: number) {
    if (!confirm('Are you sure you want to delete this card?')) return;

    try {
      await $.ajax({
        url: `/api/cards/${id}`,
        method: 'DELETE',
      });
      this.loadCards();
    } catch (error) {
      console.error('Error deleting card:', error);
    }
  }

  private async loadCards() {
    try {
      const response = await $.ajax({
        url: '/api/cards',
        method: 'GET',
      });
      this.cards = response;
      this.renderCards();
    } catch (error) {
      console.error('Error loading cards:', error);
    }
  }

  private renderCards() {
    this.$container.empty();
    this.cards.forEach((card) => {
      const $card = $(cardTemplate(card.id, card.content));
      this.$container.append($card);
    });
  }

  private async createCard() {
    const content = prompt('Enter card content:');
    if (!content) return;

    try {
      const response = await $.ajax({
        url: '/api/cards',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
          content,
          x_position: 100,
          y_position: 100,
        }),
      });
      this.loadCards();
    } catch (error) {
      console.error('Error creating card:', error);
    }
  }
}

// Initialize when DOM is ready
jQuery(async () => {
  await loadFullScreenContainer();
  const cardManager = new CardManager();
  cardManager.setupEventListeners();
});
