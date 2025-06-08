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
  SCREEN3_ADD_BTN,
  SCREEN3_EDIT_BTN,
  SCREEN3_DELETE_BTN,
  SCREEN3_SORT_BTN,
} from '@/frontend/utils/div-ids';
import * as styles from '@/frontend/components/container/container.module.less';
import * as cardStyles from '@/frontend/components/screens/screen3.module.less';
import { protocardApi } from '@/frontend/api/protocards';
import { ApiError } from '@/frontend/api/client';
import type { ProtocardTransport, ProtocardTransportType } from '@/shared/types/api';
import type { PrefixedProtocardId } from '@/shared/types/id-prefixes';
import { $id } from '@/frontend/utils/div-ids';

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
          <button id="${SCREEN3_ADD_BTN}" class="${cardStyles.actionButton}">Add Card</button>
          <button id="${SCREEN3_EDIT_BTN}" class="${cardStyles.actionButton}">Edit Mode</button>
          <button id="${SCREEN3_DELETE_BTN}" class="${cardStyles.actionButton}">Delete Mode</button>
          <button id="${SCREEN3_SORT_BTN}" class="${cardStyles.actionButton}">Sort</button>
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

function forAddButton(id: string = SCREEN3_ADD_BTN, deps: { screenManager: Screen3Manager }): () => void {
  const button = $id<HTMLButtonElement>(id);

  const handler = () => {
    console.log('Add card clicked');

    deps.screenManager.showModal({
      entityId: '' as unknown as PrefixedProtocardId,
      textBody: '',
      type: 'transport.protocard' as ProtocardTransportType,
    });
  };

  button.on('click', handler);

  return () => button.off('click', handler);
}

// class ButtonRowManager {
//   private $addBtn!: JQuery<HTMLButtonElement>;
//   private $editBtn!: JQuery<HTMLButtonElement>;
//   private $deleteBtn!: JQuery<HTMLButtonElement>;
//   private $sortBtn!: JQuery<HTMLButtonElement>;
// 
//   private screenManager: Screen3Manager;
// 
// 
//   constructor(screenManager: Screen3Manager) {
//     this.screenManager = screenManager;
//     this.$addBtn = $id<HTMLButtonElement>(SCREEN3_ADD_BTN);
//     this.$editBtn = $id<HTMLButtonElement>(SCREEN3_EDIT_BTN);
//     this.$deleteBtn = $id<HTMLButtonElement>(SCREEN3_DELETE_BTN);
//     this.$sortBtn = $id<HTMLButtonElement>(SCREEN3_SORT_BTN);
//   }
// 
//   setupEventListeners() {
//     this.$addBtn.on('click', () => this.addCard());
//     // this.$editBtn.on('click', () => this.editCard());
//     // this.$deleteBtn.on('click', () => this.deleteCard());
//     // this.$sortBtn.on('click', () => this.sortCards());
//   }
// 
//   private addCard() {
//     console.log('Add card clicked');
//     this.screenManager.showModal({
//       entityId: '' as unknown as PrefixedProtocardId,
//       textBody: '',
//       type: 'transport.protocard' as ProtocardTransportType,
//     });
//   }
// }

export class Screen3Manager {
  private protocards: ProtocardTransport[] = [];
  private $gridContainer: JQuery | null = null;
  private selectedProtocardId: PrefixedProtocardId | null = null;
  private $modalOverlay: JQuery | null = null;
  private $modalTextInput: JQuery | null = null;

  private cleanups: (() => void)[] = [];


  async liveIf(condition: boolean) {
    if (condition) {
      return await this.initialize();
    }
    else {
      // clean up
      return await this.cleanup();
    }
  }

  async initialize() {
    this.$gridContainer = $id(PROTOCARD_GRID);
    this.$modalOverlay = $id(MODAL_OVERLAY);
    this.$modalTextInput = $id(MODAL_TEXT_INPUT);

    if (this.$gridContainer.length === 0) {
      console.error('Protocard grid container not found');
      return;
    }

    await this.loadProtocards();
    this.renderProtocards();
    this.setupEventListeners();

    this.cleanups.push(
      forAddButton(SCREEN3_ADD_BTN, { screenManager: this })
    );
  }

  private async cleanup() {
    this.$gridContainer = null;
    this.$modalOverlay = null;
    this.$modalTextInput = null;
    this.protocards = [];
    this.selectedProtocardId = null;
    this.cleanups.forEach(cleanup => cleanup());
    this.cleanups = [];
  }

  private async loadProtocards() {
    try {
      $id(LOADING).text('Loading protocards...');
      this.protocards = await protocardApi.getAll();
      console.log(`Loaded ${this.protocards.length} protocards`);
    } catch (error) {
      if (error instanceof ApiError) {
        console.error('Failed to fetch protocards:', error.message);
        $id(LOADING).text(`Error: ${error.message}`);
      } else {
        console.error('Unexpected error fetching protocards:', error);
        $id(LOADING).text('Unexpected error occurred');
      }
    } finally {
      $id(LOADING).text('');
    }
  }

  private renderProtocards() {
    if (!this.$gridContainer) return;

    // Sort protocards by ID by default (string comparison for prefixed IDs)
    const sortedProtocards = [...this.protocards].sort((a, b) =>
      a.entityId.localeCompare(b.entityId)
    );

    const cardElements = sortedProtocards
      .map((protocard, index) => {
        return `
        <div class="${cardStyles.protocard}" data-id="${protocard.entityId}" data-index="${index}">
          <div class="${cardStyles.cardBorder}">
            <div class="${cardStyles.cardContent}">
              <div class="${cardStyles.cardBody}">
                ${protocard.textBody || '<em>Empty card</em>'}
              </div>
            </div>
          </div>
        </div>
      `;
      })
      .join('');

    this.$gridContainer.html(cardElements);
  }

  private setupEventListeners() {
    // Card click handlers
    if (this.$gridContainer) {
      this.$gridContainer.on('click', `.${cardStyles.protocard}`, (event) => {
        const cardElement = $(event.currentTarget);
        const protocardId = cardElement.data('id') as PrefixedProtocardId;
        const index = cardElement.data('index') as number;
        this.selectCard(protocardId, index);
      });
    }

    // Modal button handlers
    $id(MODAL_SAVE_BTN).on('click', () => this.saveCard());
    $id(MODAL_CANCEL_BTN).on('click', () => this.hideModal());

    // Close modal on overlay click
    if (this.$modalOverlay) {
      this.$modalOverlay.on('click', (event) => {
        if (this.$modalOverlay && event.target === this.$modalOverlay[0]) {
          this.hideModal();
        }
      });
    }

    // Close modal on Escape key
    // TODO(bowei): properly scope keyboard events
    $(document).on('keydown', (event) => {
      if (
        event.key === 'Escape' &&
        this.$modalOverlay &&
        this.$modalOverlay.hasClass(cardStyles.show)
      ) {
        this.hideModal();
      }
    });
  }

  private selectCard(protocardId: PrefixedProtocardId, index: number) {
    const protocard = this.protocards.find((p, i) => p.entityId === protocardId && i === index);
    if (!protocard) {
      console.error('Protocard not found:', { protocardId, index });
      return;
    }

    this.selectedProtocardId = protocardId;
    this.showModal(protocard);
  }

  showModal(protocard: ProtocardTransport): void {
    if (!this.$modalOverlay || !this.$modalTextInput) return;

    this.$modalTextInput.val(protocard.textBody);
    this.$modalOverlay.addClass(cardStyles.show).show();
    this.$modalTextInput.trigger('focus');
  }

  private hideModal() {
    if (!this.$modalOverlay) return;

    this.$modalOverlay.removeClass(cardStyles.show).hide();
    this.selectedProtocardId = null;
  }

  private saveCard() {
    if (!this.selectedProtocardId || !this.$modalTextInput) return;

    const newText = this.$modalTextInput.val() as string;
    console.log('Save card:', this.selectedProtocardId, 'with text:', newText);

    // Update the card in the local state (frontend only for now)
    const protocardIndex = this.protocards.findIndex(
      (p) => p.entityId === this.selectedProtocardId
    );
    if (protocardIndex !== -1) {
      this.protocards[protocardIndex].textBody = newText;
      this.renderProtocards();
    }

    this.hideModal();
  }
}
