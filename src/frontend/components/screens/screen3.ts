import {
  CONTENT,
  LOADING,
  PROTOCARD_GRID,
  BUTTON_ROW,
} from '@/frontend/utils/div-ids';
import * as styles from '@/frontend/components/container/container.module.less';
import * as cardStyles from './screen3.module.less';
import { protocardApi } from '@/frontend/api/protocards';
import { ApiError } from '@/frontend/api/client';
import type { ProtocardTransport } from '@/shared/types/api';

export function getScreen3Content(): string {
  return `
    <div class="${cardStyles.screenContainer}">
      <div id="${CONTENT}" class="${cardStyles.contentLayout}">
        <div class="${cardStyles.buttonRow}"></div>
        <div class="${cardStyles.gridContainer}">
          <div id="${PROTOCARD_GRID}" class="${cardStyles.horizontalGrid}">
            <!-- Protocards will be rendered here -->
          </div>
        </div>
        <div id="${BUTTON_ROW}" class="${cardStyles.buttonRow}">
          <button class="${cardStyles.actionButton}">Add Card</button>
          <button class="${cardStyles.actionButton}">Edit Mode</button>
          <button class="${cardStyles.actionButton}">Delete Mode</button>
          <button class="${cardStyles.actionButton}">Sort</button>
        </div>
      </div>
      <div id="${LOADING}"></div>
    </div>
  `;
}

export class Screen3Manager {
  private protocards: ProtocardTransport[] = [];
  private $gridContainer: JQuery | null = null;

  async initialize() {
    this.$gridContainer = $(`#${PROTOCARD_GRID}`);
    
    if (this.$gridContainer.length === 0) {
      console.error('Protocard grid container not found');
      return;
    }

    await this.loadProtocards();
    this.renderProtocards();
  }

  private async loadProtocards() {
    try {
      $(`#${LOADING}`).text('Loading protocards...');
      this.protocards = await protocardApi.getAll();
      console.log(`Loaded ${this.protocards.length} protocards`);
    } catch (error) {
      if (error instanceof ApiError) {
        console.error('Failed to fetch protocards:', error.message);
        $(`#${LOADING}`).text(`Error: ${error.message}`);
      } else {
        console.error('Unexpected error fetching protocards:', error);
        $(`#${LOADING}`).text('Unexpected error occurred');
      }
    } finally {
      $(`#${LOADING}`).text('');
    }
  }

  private renderProtocards() {
    if (!this.$gridContainer) return;

    // Sort protocards by ID by default
    const sortedProtocards = [...this.protocards].sort((a, b) => a.entityId - b.entityId);

    const cardElements = sortedProtocards.map(protocard => {
      return `
        <div class="${cardStyles.protocard}" data-id="${protocard.entityId}">
          <div class="${cardStyles.cardBorder}">
            <div class="${cardStyles.cardContent}">
              <div class="${cardStyles.cardBody}">
                ${protocard.text_body || '<em>Empty card</em>'}
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    this.$gridContainer.html(cardElements);
  }
}