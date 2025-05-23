// This file contains constant strings for div IDs used in the project.

export const FULLSCREEN_CONTAINER_PARENT_ID = 'fullscreen-container-parent';
export const FULL_SCREEN_CONTAINER_ID = 'full-screen-container';
export const CONTENT_CONTAINER_ID = 'content-container';
export const ADD_CARD_ID = 'add-card';
export const CARD_CONTAINER_ID = 'card-container';
export const LOADING_INDICATOR_ID = 'loading-indicator';
export const SPINNER_ID = 'spinner';

// Helper function to get jQuery selector string by ID
export const getJQuerySelector = (id: string): string => `#${id}`;

// Syntax sugar for jQuery ID selection
export const $id = (id: string) => $(getJQuerySelector(id));
