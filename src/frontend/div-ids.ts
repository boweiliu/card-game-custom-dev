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
export const PROTOCARD_COUNT = 'protocard-count';
export const SSE_STATUS = 'sse-status';

// Helper function to get jQuery selector string by ID
export const getJQuerySelector = (id: string): string => `#${id}`;

// Syntax sugar for jQuery ID selection
export const $id = (id: string) => $(getJQuerySelector(id));
