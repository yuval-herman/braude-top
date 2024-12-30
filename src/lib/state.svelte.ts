import type { FullCourse, Item } from './types';

export const hoveredInstance = $state<{ items: Item[] }>({ items: [] });
export const selectedCourses = $state<FullCourse[]>([]);
