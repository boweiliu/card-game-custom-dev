// This file contains constant strings for div IDs used in the project.

export const FULLSCREEN_PARENT = 'fullscreen-container-parent';
export const FULLSCREEN = 'full-screen-container';
export const CONTENT = 'content-container';
export const ADD_CARD = 'add-card';
export const CARD = 'card-container';
export const LOADING = 'loading-indicator';
export const SPINNER = 'spinner';
export const APP_ROOT = 'app-root';

// Helper function to get jQuery selector string by ID
export const getJQuerySelector = (id: string): string => `#${id}`;

// Syntax sugar for jQuery ID selection
export const $id = (id: string) => $(getJQuerySelector(id));
