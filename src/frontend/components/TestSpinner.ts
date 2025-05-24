import { Spinner } from '@/frontend/components/spinner/spinner';
import { cardTemplate } from '@/frontend/components/cards';
import { $id, ADD_CARD, CARD, LOADING } from '@/frontend/utils/div-ids';
import { ProtocardId } from '@/shared/types/db';
import { miscApi } from '@/frontend/api/misc';
import { ApiError } from '@/frontend/api/client';
import {
  protocardState,
  ProtocardState,
} from '@/frontend/services/protocard-state';
import { sseService } from '@/frontend/services/sse-service';

export class TestSpinner {
  private $loadingIndicator: JQuery;
  private spinner: Spinner;

  constructor() {
    this.$loadingIndicator = $id(LOADING);
    this.spinner = new Spinner();
    this.checkBackendStatus();
  }

  private async checkBackendStatus() {
    await this.pingBackend(9);
    await this.testSpinner();
    this.connectSSE();
  }

  private connectSSE() {
    try {
      sseService.connect();
      console.log('SSE service connected for real-time updates');
    } catch (error) {
      console.error('Failed to connect SSE service:', error);
    }
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

  private async testSpinner() {
    this.spinner.show();
    try {
      await protocardState.loadInitialState();
      console.log('Initial protocard state loaded');
    } catch (error) {
      console.error('Failed to load initial protocard state:', error);
      this.$loadingIndicator
        .addClass('textError')
        .text(
          'Failed to load cards: ' +
            (error instanceof Error ? error.message : 'Unknown error')
        )
        .show();
    } finally {
      this.spinner.hide();
    }
  }

  public setupEventListeners(): void {
    console.log('Event listeners set up');
    // Placeholder for future event listener setup
  }
}
