import './styles.less';
import { Spinner } from './spinner';

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
    this.$container = $('#card-container');
    this.$loadingIndicator = $('#loading-indicator');
    this.spinner = new Spinner();
    this.initialize();
  }

  private initialize() {
    this.checkBackendStatus();
    // this.loadCards();
    this.setupEventListeners();
  }

  private async checkBackendStatus() {
    this.spinner.show();
    try {
      const response = await fetch('/api/ping');
      if (response.ok) {
        this.$loadingIndicator.hide();
        // log a bit
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

  private setupEventListeners() {
    $(document).on('click', '.card', (e) => {
      const $card = $(e.currentTarget);
      this.editCard($card);
    });

    $(document).on('click', '.delete-card', (e) => {
      const $card = $(e.currentTarget).closest('.card');
      this.deleteCard($card.data('id'));
    });

    $('#add-card').click(() => this.createCard());
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

  private renderCards() {
    this.$container.empty();
    this.cards.forEach((card) => {
      const $card = $(`
                <div class="card" data-id="${card.id}">
                    <div class="card-content">${card.content}</div>
                    <button class="delete-card">Delete</button>
                </div>
            `);
      this.$container.append($card);
    });
  }
}

// Initialize when DOM is ready
jQuery(() => {
  const appRoot = $('#app-root');
  appRoot.addClass('global-body-style');
  appRoot.append('<div id="fullscreen-container-parent"><div id="full-screen-container" class="full-screen-container"><div class="container"><h1>Card Game Simulator</h1><div id="content-container"><button id="add-card">Add Card</button><div id="card-container"></div></div><div id="loading-indicator"></div></div></div></div>');
  new CardManager();
});
