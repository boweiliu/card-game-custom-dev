import {
  CONTENT,
  LOADING,
  PROTOCARD_GRID,
  BUTTON_ROW,
  EDIT_MODAL,
  MODAL_OVERLAY,
  MODAL_TEXT_INPUT,
  MODAL_SAVE_BTN,
  MODAL_CANCEL_BTN,
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
      
      <!-- Edit Modal -->
      <div id="${MODAL_OVERLAY}" class="${cardStyles.modalOverlay}">
        <div id="${EDIT_MODAL}" class="${cardStyles.editModal}">
          <h3>Edit Protocard</h3>
          <textarea id="${MODAL_TEXT_INPUT}" class="${cardStyles.modalTextInput}" placeholder="Enter card text..."></textarea>
          <div class="${cardStyles.modalButtons}">
            <button id="${MODAL_SAVE_BTN}" class="${cardStyles.modalButton} ${cardStyles.saveButton}">Save</button>
            <button id="${MODAL_CANCEL_BTN}" class="${cardStyles.modalButton} ${cardStyles.cancelButton}">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

export class Screen3Manager {
  private protocards: ProtocardTransport[] = [];
  private $gridContainer: JQuery | null = null;
  private selectedProtocardId: number | null = null;
  private $modalOverlay: JQuery | null = null;
  private $modalTextInput: JQuery | null = null;

  async initialize() {
    this.$gridContainer = $(`#${PROTOCARD_GRID}`);
    this.$modalOverlay = $(`#${MODAL_OVERLAY}`);
    this.$modalTextInput = $(`#${MODAL_TEXT_INPUT}`);
    
    if (this.$gridContainer.length === 0) {
      console.error('Protocard grid container not found');
      return;
    }

    await this.loadProtocards();
    this.renderProtocards();
    this.setupEventListeners();
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

  private setupEventListeners() {
    // Card click handlers
    if (this.$gridContainer) {
      this.$gridContainer.on('click', `.${cardStyles.protocard}`, (event) => {
        const cardElement = $(event.currentTarget);
        const protocardId = parseInt(cardElement.data('id'), 10);
        this.selectCard(protocardId);
      });
    }

    // Modal button handlers
    $(`#${MODAL_SAVE_BTN}`).on('click', () => this.saveCard());
    $(`#${MODAL_CANCEL_BTN}`).on('click', () => this.hideModal());
    
    // Close modal on overlay click
    if (this.$modalOverlay) {
      this.$modalOverlay.on('click', (event) => {
        if (this.$modalOverlay && event.target === this.$modalOverlay[0]) {
          this.hideModal();
        }
      });
    }

    // Close modal on Escape key
    $(document).on('keydown', (event) => {
      if (event.key === 'Escape' && this.$modalOverlay && this.$modalOverlay.is(':visible')) {
        this.hideModal();
      }
    });
  }

  private selectCard(protocardId: number) {
    const protocard = this.protocards.find(p => p.entityId === protocardId);
    if (!protocard) {
      console.error('Protocard not found:', protocardId);
      return;
    }

    this.selectedProtocardId = protocardId;
    this.showModal(protocard);
  }

  private showModal(protocard: ProtocardTransport) {
    if (!this.$modalOverlay || !this.$modalTextInput) return;

    this.$modalTextInput.val(protocard.text_body);
    this.$modalOverlay.show();
    this.$modalTextInput.focus();
  }

  private hideModal() {
    if (!this.$modalOverlay) return;

    this.$modalOverlay.hide();
    this.selectedProtocardId = null;
  }

  private saveCard() {
    if (!this.selectedProtocardId || !this.$modalTextInput) return;

    const newText = this.$modalTextInput.val() as string;
    console.log('Save card:', this.selectedProtocardId, 'with text:', newText);
    
    // Update the card in the local state (frontend only for now)
    const protocardIndex = this.protocards.findIndex(p => p.entityId === this.selectedProtocardId);
    if (protocardIndex !== -1) {
      this.protocards[protocardIndex].text_body = newText;
      this.renderProtocards();
    }

    this.hideModal();
  }
}