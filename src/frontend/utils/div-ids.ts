// This file contains constant strings for div IDs used in the project.

export const FULLSCREEN_PARENT = 'fullscreen-container-parent';
export const FULLSCREEN = 'full-screen-container';
export const CONTENT = 'content-container';
export const ADD_CARD = 'add-card';
export const CARD = 'card-container';
export const LOADING = 'loading-indicator';
export const SPINNER = 'spinner';
export const APP_ROOT = 'app-root';
export const START_BAR = 'start-bar';
export const START_SCREEN_BTN = 'start-screen-btn';
export const SCREEN_1_BTN = 'screen-1-btn';
export const SCREEN_2_BTN = 'screen-2-btn';
export const SCREEN_3_BTN = 'screen-3-btn';
export const PROTOCARD_COUNT = 'protocard-count';
export const SSE_STATUS = 'sse-status';
export const PROTOCARD_GRID = 'protocard-grid';
export const BUTTON_ROW = 'button-row';
export const EDIT_MODAL = 'edit-modal';
export const MODAL_OVERLAY = 'modal-overlay';
export const MODAL_TEXT_INPUT = 'modal-text-input';
export const MODAL_SAVE_BTN = 'modal-save-btn';
export const MODAL_APPLY_BTN = 'modal-apply-btn';
export const MODAL_CANCEL_BTN = 'modal-cancel-btn';
export const SCREEN3_ADD_BTN = 'screen3-add-btn';
export const SCREEN3_EDIT_BTN = 'screen3-edit-btn';
export const SCREEN3_DELETE_BTN = 'screen3-delete-btn';
export const SCREEN3_SORT_BTN = 'screen3-sort-btn';

// Helper function to get jQuery selector string by ID
export const getJQuerySelector = (id: string): string => `#${id}`;

// Syntax sugar for jQuery ID selection
// Use type hint with care - there's no guarantee
export const $id = <TElement extends HTMLElement = HTMLElement>(id: string): JQuery<TElement> => $(getJQuerySelector(id));
