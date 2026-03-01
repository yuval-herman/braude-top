import { browser } from '$app/environment';
import { page } from '$app/state';
import 'core-js/actual/iterator'; // Polyfill
import { SvelteMap, SvelteSet } from 'svelte/reactivity';
import {
	getCurrentActiveInstances,
	getCurrentCourses,
	setCurrentActiveInstances,
	setCurrentCourses,
} from './storage';
import { stripExcessProperties } from './utils/utils';
import type { Institute } from './utils/constants.utils';

type CourseIdString = `${SemesterCourse['course_id']}-${number}`; // `${course_id}-${year}`

const courses = new SvelteMap<CourseIdString, SemesterCourse>();
const instances = new SvelteMap<SemesterCourseInstance['instance_id'], SemesterCourseInstance>();
const active_instances_ids = new SvelteSet<SemesterCourseInstance['instance_id']>();

type UndoStackItem = {
	courses: SemesterCourse[];
	instances: SemesterCourseInstance[];
	active_instances_ids: SemesterCourseInstance['instance_id'][];
};

const undoStack: UndoStackItem[] = [];
const redoStack: UndoStackItem[] = [];

function constructUndoStackItem(): UndoStackItem {
	return {
		courses: courses.values().toArray(),
		instances: instances.values().toArray(),
		active_instances_ids: active_instances_ids.values().toArray(),
	};
}

function loadStackItem(item: UndoStackItem): void {
	item.courses.forEach((i) => courses.set(GCID(i), i));
	item.instances.forEach((i) => instances.set(i.instance_id, i));
	item.active_instances_ids.forEach((i) => active_instances_ids.add(i));
}

export function undo(institute: Institute) {
	const item = undoStack.pop();
	if (!item) return;
	redoStack.push(constructUndoStackItem());
	clearState();
	loadStackItem(item);
	saveAllData(institute);
}
export function redo(institute: Institute) {
	const item = redoStack.pop();
	if (!item) return;
	undoStack.push(constructUndoStackItem());
	clearState();
	loadStackItem(item);
	saveAllData(institute);
}
export function saveSnapshotToUndo() {
	undoStack.push(constructUndoStackItem());
	redoStack.length = 0;
}

function clearState(): void {
	courses.clear();
	instances.clear();
	active_instances_ids.clear();
}

// Get course id string
function GCID(
	courseOrId: SemesterCourse['course_id'] | Pick<SemesterCourse, 'course_id' | 'year'>,
	year?: SemesterCourse['year']
): CourseIdString {
	return typeof courseOrId === 'number'
		? `${courseOrId}-${year!}`
		: `${courseOrId.course_id}-${courseOrId.year}`;
}

/** Get a iterator of the active instances, optionally filter by course */
function getActiveInstancesIter(course?: Pick<SemesterCourse, 'course_id' | 'year'>) {
	return active_instances_ids
		.values()
		.map((id) => instances.get(id))
		.filter((instance): instance is SemesterCourseInstance => {
			if (!instance) {
				console.error('A selected instance was not found in instance map!');
				return false;
			} else if (
				course &&
				!(instance.course_id === course.course_id && instance.year === course.year)
			)
				return false;
			else return true;
		});
}

function constructFullCourses(instances_iter: Iterable<SemesterCourseInstance>) {
	const full_courses = new Map<CourseIdString, SemesterCourse>();
	for (const instance of instances_iter) {
		const CID = GCID(instance.course_id, instance.year);
		const course = full_courses.get(CID);
		if (!course) {
			const saved_course = courses.get(CID);
			if (!saved_course) {
				console.error(
					'A selected course was not found in course map while constructing fullCourses array!'
				);
				continue;
			}
			full_courses.set(CID, { ...saved_course, instances: [instance] });
		} else {
			course.instances.push(instance);
		}
	}
	return full_courses.values();
}

////////////// SAVE DATA FUNCTIONS

function sendDataToServer(data: unknown, data_type: SavedDataTypes) {
	if (!page.params.institute) return;
	navigator.sendBeacon(
		page.params.institute + '/api/user/update/data',
		JSON.stringify({
			year: page.data.year,
			semester: page.data.semester,
			data_type,
			data,
		})
	);
}

function saveServerCourses() {
	if (page.data.user) sendDataToServer(courses.values().toArray(), 'courses');
}

function saveServerInstances() {
	if (page.data.user) sendDataToServer(instances.values().toArray(), 'instances');
}

function saveServerActiveInstances() {
	if (page.data.user)
		sendDataToServer(active_instances_ids.values().toArray(), 'active_instance_ids');
}

function saveLocalData(institute: Institute) {
	if (!browser) return;
	setCurrentCourses(institute, getFullCourses(), page.data.year, page.data.semester);
	setCurrentActiveInstances(
		institute,
		active_instances_ids.values().toArray(),
		page.data.year,
		page.data.semester
	);
}

function saveAllData(institute: Institute) {
	saveServerCourses();
	saveServerInstances();
	saveServerActiveInstances();
	saveLocalData(institute);
}

////////////// LOAD DATA FUNCTIONS

const dataTypeToFetch: SavedDataTypes[] = ['courses', 'instances', 'active_instance_ids'];
const fetchDataTypesUrl = `/api/user/get/data?data_types=${JSON.stringify(dataTypeToFetch)}`;

async function loadServerData(): Promise<
	{ data: unknown; data_type: SavedDataTypes }[] | undefined
> {
	if (!page.data.user || !page.params.institute) return;
	return (await fetch(page.params.institute + fetchDataTypesUrl)).json();
}

export async function loadCourses(institute: Institute) {
	if (!browser) return;
	clearState();
	undoStack.length = 0;
	redoStack.length = 0;
	try {
		const serverData = await loadServerData();
		if (serverData?.length) {
			const server_courses = serverData.find((d) => d.data_type === 'courses')?.data as
				| undefined
				| SemesterCourse[];
			const server_instances = serverData.find((d) => d.data_type === 'instances')?.data as
				| undefined
				| SemesterCourseInstance[];
			const server_active_instance_ids = serverData.find(
				(d) => d.data_type === 'active_instance_ids'
			)?.data as undefined | SemesterCourseInstance['instance_id'][];

			server_courses?.forEach((c) => courses.set(GCID(c), c));
			server_instances?.forEach((i) => instances.set(i.instance_id, i));
			server_active_instance_ids?.forEach((i) => active_instances_ids.add(i));
			return;
		}
	} catch (error) {
		console.error(
			error,
			'Could not fetch data from server, data is loaded from localstorage instead.'
		);
	}
	const full_courses = getCurrentCourses(institute, page.data.year, page.data.semester);
	for (const full_course of full_courses) {
		full_course.instances.forEach((instance) => instances.set(instance.instance_id, instance));
		// @ts-ignore;
		// By removing the instances this becomes a normal SemesterCourse object that we can save in the courses map.
		// This is just to save on precious ram :)
		delete full_course.instances;
		courses.set(GCID(full_course), full_course);
	}
	getCurrentActiveInstances(institute, page.data.year, page.data.semester)?.forEach((id) =>
		active_instances_ids.add(id)
	);
}

////////////// SET STATE FUNCTIONS

export function toggleInstance(institute: Institute, instance_id: CourseInstance['instance_id']) {
	saveSnapshotToUndo();
	// Tries to deactivate instance. If instance is already deactivated, activates it.
	if (!active_instances_ids.delete(instance_id)) active_instances_ids.add(instance_id);
	saveServerActiveInstances();
	saveLocalData(institute);
}

function addCourseNoUndo(
	institute: Institute,
	course: SemesterCourse,
	course_instances: SemesterCourseInstance[]
) {
	const courseKeys: (keyof SemesterCourse)[] = ['course_id', 'name', 'year', 'description'];
	const stripped_course = stripExcessProperties(course, courseKeys);
	courses.set(GCID(stripped_course), stripped_course);
	for (let i = 0; i < course_instances.length; i++)
		instances.set(course_instances[i].instance_id, course_instances[i]);

	saveServerInstances();
	saveServerCourses();
	saveLocalData(institute);
}

export function addCourse(
	institute: Institute,
	course: SemesterCourse,
	course_instances: SemesterCourseInstance[]
) {
	saveSnapshotToUndo();
	addCourseNoUndo(institute, course, course_instances);
}

export function addCourseActivateInstance(
	institute: Institute,
	course: SemesterCourse,
	course_instances: SemesterCourseInstance[],
	instance_id: SemesterCourseInstance['instance_id']
) {
	addCourseNoUndo(institute, course, course_instances);
	toggleInstance(institute, instance_id);
}

export function removeInstance(institute: Institute, id: CourseInstance['instance_id']): void;
export function removeInstance(institute: Institute, instance: StrippedCourseInstance): void;
export function removeInstance(
	institute: Institute,
	InstanceOrId: StrippedCourseInstance | CourseInstance['instance_id']
): void {
	saveSnapshotToUndo();
	const id = typeof InstanceOrId === 'string' ? InstanceOrId : InstanceOrId.instance_id;
	instances.delete(id);
	active_instances_ids.delete(id);
	saveServerInstances();
	saveServerCourses();
	saveLocalData(institute);
}

export function removeCourse(institute: Institute, CID: CourseIdString): void;
export function removeCourse(institute: Institute, course: SemesterCourse): void;
export function removeCourse(
	institute: Institute,
	CourseOrCID: CourseIdString | SemesterCourse
): void {
	saveSnapshotToUndo();
	let CID: CourseIdString, course: SemesterCourse | undefined;
	if (typeof CourseOrCID === 'string') {
		CID = CourseOrCID;
		course = courses.get(CID);
		return;
	} else {
		CID = GCID(CourseOrCID);
		course = CourseOrCID;
	}

	for (const instance of instances.values()) {
		if (instance.course_id === course.course_id && instance.year === course.year)
			removeInstance(institute, instance);
	}
	courses.delete(CID);

	saveServerInstances();
	saveServerCourses();
	saveLocalData(institute);
}

/** Removes all courses instances and all other related data from state, localstorage, and server */
export function removeAllCoursesData(institute: Institute) {
	saveSnapshotToUndo();
	clearState();
	saveAllData(institute);
}

////////////// GET STATE FUNCTIONS

export function hasCourse(
	course_id: SemesterCourse['course_id'],
	year: SemesterCourse['year']
): boolean;
export function hasCourse(course: StrippedCourse): boolean;
export function hasCourse(
	courseOrId: SemesterCourse['course_id'] | StrippedCourse,
	year?: SemesterCourse['year']
): boolean {
	return courses.has(GCID(courseOrId, year));
}

export function getCourse(course_id: number, year: number): SemesterCourse | undefined {
	return courses.get(GCID(course_id, year));
}

/** Will return false for instances that don't exist as well */
export function isInstanceActive(instance: StrippedCourseInstance): boolean;
export function isInstanceActive(instance_id: CourseInstance['instance_id']): boolean;
export function isInstanceActive(
	instanceOrId: CourseInstance['instance_id'] | StrippedCourseInstance
): boolean {
	return active_instances_ids.has(
		typeof instanceOrId === 'string' ? instanceOrId : instanceOrId.instance_id
	);
}

export function getCoursesAmount(): number {
	return courses.size;
}

export function getActiveCourses(): SemesterCourse[] {
	const coursesCID = new Set<CourseIdString>();
	for (const instance of getActiveInstancesIter()) {
		const CID = GCID(instance.course_id, instance.year);
		coursesCID.add(CID);
	}
	return coursesCID
		.values()
		.map((CID) => courses.get(CID))
		.filter((course): course is SemesterCourse => {
			if (!course) {
				console.error('A selected course was not found in course map!');
				return false;
			}
			return true;
		})
		.toArray();
}

/** Get a list of exams for the active instances, optionally filter by course */
export function getActiveExams(course?: Pick<SemesterCourse, 'course_id' | 'year'>): Exam[] {
	return getActiveInstancesIter(course)
		.flatMap((instance) => instance.exams)
		.toArray();
}

/** Get a list of the active instances, optionally filter by course */
export function getActiveInstances(
	course?: Pick<SemesterCourse, 'course_id' | 'year'>
): SemesterCourseInstance[] {
	return getActiveInstancesIter(course).toArray();
}

/** get full courses with only active instances included in instance list */
export function getActiveFullCourses(): SemesterCourse[] {
	return constructFullCourses(getActiveInstancesIter()).toArray();
}

/** get full courses with including non active ones */
export function getFullCourses(): SemesterCourse[] {
	return constructFullCourses(instances.values()).toArray();
}
