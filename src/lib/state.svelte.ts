import type { Item, Session } from './types';

export const hoveredInstance = $state<{ items: Item[] }>({ items: [] });
