import type { Course, CourseInstance, Item, Session } from './types';

export const hoveredInstance = $state<{ items: Item[] }>({ items: [] });
export const selectedCourses = $state<(Course & CourseInstance & { sessions: Session[] })[]>([]);
