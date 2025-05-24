import { Spinner } from '@/frontend/components/spinner/spinner';
import { cardTemplate } from '@/frontend/cards';
import { $id, ADD_CARD, CARD, LOADING } from '@/frontend/utils/div-ids';
import { ProtocardId } from '@/server/db/types';
import { miscApi } from '@/frontend/api/misc';
import { protocardApi } from '@/frontend/api/protocards';
import { ApiError } from '@/frontend/api/client';
import { Card } from '@/shared/types/frontend';

export class CardManager {
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
    await this.pingBackend(10);
  }

  // Public method to test ping with optional delay (for debugging spinner)
  public async pingBackend(delaySeconds: number = 0) {
    this.spinner.show();
    try {
      console.log(`Pinging backend with ${delaySeconds}s delay...`);
      await miscApi.ping(delaySeconds > 0 ? delaySeconds : undefined);

      this.$loadingIndicator.removeClass('textError').hide();
      console.log('Backend is up');
    } catch (error) {
      if (error instanceof ApiError) {
        const text = `Not Connected - server error ${error.status}: ${error.message}`;
        this.$loadingIndicator.addClass('textError').text(text);
        console.error('Backend API error:', error.message);
      } else {
        this.$loadingIndicator
          .addClass('textError')
          .text(
            'Not Connected: ' +
              (error instanceof Error ? error.message : 'Unknown error')
          );
        console.error('Backend is down:', error);
      }
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
      await protocardApi.update(id, { text_body: content });
      $card.find('.card-content').text(content);
    } catch (error) {
      console.error('Error editing card:', error);
    }
  }

  private async deleteCard(id: number) {
    if (!confirm('Are you sure you want to delete this card?')) return;

    try {
      await protocardApi.delete(id as ProtocardId);
      this.loadCards();
    } catch (error) {
      console.error('Error deleting card:', error);
    }
  }

  private async loadCards() {
    try {
      const response = await protocardApi.getAll();
      this.cards = response.map((p) => ({
        id: p.entityId,
        content: p.text_body,
        x_position: 100,
        y_position: 100,
      }));
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
      await protocardApi.create({ text_body: content });
      this.loadCards();
    } catch (error) {
      console.error('Error creating card:', error);
    }
  }
}
