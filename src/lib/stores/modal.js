import { writable } from 'svelte/store';

// Central store to manage the globally selected article for the Modal
export const selectedArticleStore = writable(null);
