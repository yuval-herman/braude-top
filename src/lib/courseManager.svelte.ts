import 'core-js/actual/iterator'; // Polyfill
import { SvelteMap, SvelteSet } from 'svelte/reactivity';
import {
	getCurrentActiveInstances,
	getCurrentCourses,
	setCurrentActiveInstances,
	setCurrentCourses,
} from './storage';
import { browser } from '$app/environment';
import { page } from '$app/state';
import { stripExcessProperties } from './utils/utils';

type CourseIdString = `${number}-${number}`; // `${course_id}-${year}`

const courses = new SvelteMap<CourseIdString, Course>();
const instances = new SvelteMap<number, FullCourseInstance>();
const active_instances_ids = new SvelteSet<number>();

const course_updates = $state<Course[]>([]);
const invalidated_instances_ids = $state<number[]>([]);
const invalidated_course_cids = $state<CourseIdString[]>([]);

type UndoStackItem = [Course[], FullCourseInstance[], number[]];
const undoStack: UndoStackItem[] = [];
const redoStack: UndoStackItem[] = [];

function constructUndoStackItem(): UndoStackItem {
	return [
		courses.values().toArray(),
		instances.values().toArray(),
		active_instances_ids.values().toArray(),
	];
}

function loadStackItem(item: UndoStackItem): void {
	item[0].forEach((i) => courses.set(GCID(i), i));
	item[1].forEach((i) => instances.set(i.course_instance_id, i));
	item[2].forEach((i) => active_instances_ids.add(i));
}

export function undo() {
	const item = undoStack.pop();
	if (!item) return;
	redoStack.push(constructUndoStackItem());
	clearState();
	loadStackItem(item);
	saveAllData();
}
export function redo() {
	const item = redoStack.pop();
	if (!item) return;
	undoStack.push(constructUndoStackItem());
	clearState();
	loadStackItem(item);
	saveAllData();
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
function GCID(course: Pick<Course, 'course_id' | 'year'>): CourseIdString;
function GCID(course_id: number, year: number): CourseIdString;
function GCID(
	courseOrId: number | Pick<Course, 'course_id' | 'year'>,
	year?: number
): CourseIdString {
	return typeof courseOrId === 'number'
		? `${courseOrId}-${year!}`
		: `${courseOrId.course_id}-${courseOrId.year}`;
}

function getActiveInstancesIter() {
	return active_instances_ids
		.values()
		.map((id) => instances.get(id))
		.filter((instance): instance is FullCourseInstance => {
			if (!instance) {
				console.error('A selected instance was not found in instance map!');
				return false;
			}
			return true;
		});
}

function constructFullCourses(instances_iter: Iterable<FullCourseInstance>) {
	const full_courses = new Map<CourseIdString, FullCourse>();
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

////////////// SERVER SYNC FUNCTIONS

async function checkForDataUpdates() {
	const course_identifiers = courses
		.values()
		.map((c) => ({ course_id: c.course_id, year: c.year, last_modified: c.last_modified }))
		.toArray();
	const instance_hashes = instances
		.values()
		.map((c) => c.full_instance_hash)
		.toArray();

	// TODO handle network errors.
	const { deleted_courses, missing_hashes, modified_courses } = (await (
		await fetch('/api/db/verify', {
			headers: {
				'Content-Type': 'application/json',
			},
			method: 'POST',
			body: JSON.stringify({ courses: course_identifiers, instance_hashes }),
		})
	).json()) as {
		modified_courses: Course[];
		deleted_courses: Pick<Course, 'course_id' | 'year'>[];
		missing_hashes: string[];
	};

	invalidated_course_cids.push(...deleted_courses.map(GCID));
	invalidated_instances_ids.push(
		...instances
			.values()
			.filter((i) => missing_hashes.includes(i.full_instance_hash))
			.map((i) => i.course_instance_id)
			.toArray()
	);
	course_updates.push(...modified_courses);
}

// TODO should alert users to changes in course details, but this is less important then changes in
// sessions and instances, so no action is needed in such a case
// export function getOutdatedCourses();

export function getDeletedCourses(): Course[] {
	return invalidated_course_cids
		.map((cid) => courses.get(cid) ?? cid)
		.filter((courseOrCid): courseOrCid is Course => {
			if (typeof courseOrCid === 'object') return true;
			console.error(
				`course CID (${courseOrCid}) from invalidated_course_cids was not found in courses map`
			);
			return false;
		});
}

export function getDeletedInstances(): FullCourseInstance[] {
	return invalidated_instances_ids
		.map((id) => instances.get(id) ?? id)
		.filter((instanceOrId): instanceOrId is FullCourseInstance => {
			if (typeof instanceOrId === 'object') return true;
			console.error(
				`instance id (${instanceOrId}) from invalidated_instances_ids was not found in instances map`
			);
			return false;
		});
}

////////////// SAVE DATA FUNCTIONS

function sendDataToServer(data: unknown, data_type: SavedDataTypes) {
	navigator.sendBeacon(
		'/api/user/update/data',
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

function saveLocalData() {
	if (!browser) return;
	setCurrentCourses(getFullCourses(), page.data.year, page.data.semester);
	setCurrentActiveInstances(
		active_instances_ids.values().toArray(),
		page.data.year,
		page.data.semester
	);
}

function saveAllData() {
	saveServerCourses();
	saveServerInstances();
	saveServerActiveInstances();
	saveLocalData();
}

////////////// LOAD DATA FUNCTIONS

const dataTypeToFetch: SavedDataTypes[] = ['courses', 'instances', 'active_instance_ids'];
const fetchDataTypesUrl = `/api/user/get/data?data_types=${JSON.stringify(dataTypeToFetch)}`;

async function loadServerData(): Promise<
	{ data: unknown; data_type: SavedDataTypes }[] | undefined
> {
	if (!page.data.user) return;
	return (await fetch(fetchDataTypesUrl)).json();
}

export async function loadCourses() {
	if (!browser) return;
	clearState();
	undoStack.length = 0;
	redoStack.length = 0;
	try {
		const serverData = await loadServerData();
		if (serverData?.length) {
			const server_courses = serverData.find((d) => d.data_type === 'courses')?.data as
				| undefined
				| Course[];
			const server_instances = serverData.find((d) => d.data_type === 'instances')?.data as
				| undefined
				| FullCourseInstance[];
			const server_active_instance_ids = serverData.find(
				(d) => d.data_type === 'active_instance_ids'
			)?.data as undefined | number[];

			server_courses?.forEach((c) => courses.set(GCID(c), c));
			server_instances?.forEach((i) => instances.set(i.course_instance_id, i));
			server_active_instance_ids?.forEach((i) => active_instances_ids.add(i));
			checkForDataUpdates();
			return;
		}
	} catch (error) {
		console.error(
			error,
			'Could not fetch data from server, data is loaded from localstorage instead.'
		);
	}
	const full_courses = getCurrentCourses(page.data.year, page.data.semester);
	for (const full_course of full_courses) {
		full_course.instances.forEach((instance) =>
			instances.set(instance.course_instance_id, instance)
		);
		// @ts-ignore; By removing the instances this becomes a normal Course object that we can save in the courses map
		delete full_course.instances;
		courses.set(GCID(full_course), full_course);
	}
	getCurrentActiveInstances(page.data.year, page.data.semester)?.forEach((id) =>
		active_instances_ids.add(id)
	);
	checkForDataUpdates();
}

////////////// SET STATE FUNCTIONS

export function toggleInstance(instance_id: number) {
	saveSnapshotToUndo();
	// Tries to deactivate instance. If instance is already deactivated, activates it.
	if (!active_instances_ids.delete(instance_id)) active_instances_ids.add(instance_id);
	saveServerActiveInstances();
	saveLocalData();
}

function addCourseNoUndo(course: Course, course_instances: FullCourseInstance[]) {
	const courseKeys: (keyof Course)[] = [
		'course_id',
		'name',
		'year',
		'credit',
		'description',
		'syllabus_link',
		'last_modified',
	];
	const stripped_course = stripExcessProperties(course, courseKeys);
	courses.set(GCID(stripped_course), stripped_course);
	for (let i = 0; i < course_instances.length; i++)
		instances.set(course_instances[i].course_instance_id, course_instances[i]);

	saveServerInstances();
	saveServerCourses();
	saveLocalData();
}

export function addCourse(course: Course, course_instances: FullCourseInstance[]) {
	saveSnapshotToUndo();
	addCourseNoUndo(course, course_instances);
}

export function addCourseActivateInstance(
	course: Course,
	course_instances: FullCourseInstance[],
	instance_id: number
) {
	addCourseNoUndo(course, course_instances);
	toggleInstance(instance_id);
}

export function removeCourse(CID: CourseIdString): void;
export function removeCourse(course: Course): void;
export function removeCourse(CourseOrCID: CourseIdString | Course): void {
	saveSnapshotToUndo();
	let CID: CourseIdString, course: Course | undefined;
	if (typeof CourseOrCID === 'string') {
		CID = CourseOrCID;
		course = courses.get(CID);
		if (!course) throw Error('Tried to remove non existent course');
	} else {
		CID = GCID(CourseOrCID);
		course = CourseOrCID;
	}
	const instance_ids = instances
		.values()
		.filter((instance) => instance.course_id === course.course_id && instance.year === course.year)
		.map((instance) => instance.course_instance_id);
	courses.delete(CID);
	for (const id of instance_ids) {
		instances.delete(id);
		active_instances_ids.delete(id);
	}
	saveServerInstances();
	saveServerCourses();
	saveLocalData();
}

/** Removes all courses instances and all other related data from state, localstorage, and server */
export function removeAllCoursesData() {
	saveSnapshotToUndo();
	clearState();
	saveAllData();
}

////////////// GET STATE FUNCTIONS

export function hasCourse(course_id: number, year: number): boolean;
export function hasCourse(course: Course): boolean;
export function hasCourse(courseOrId: number | Course, year?: number): boolean {
	return courses.has(typeof courseOrId === 'number' ? GCID(courseOrId, year!) : GCID(courseOrId));
}

/** Will return false for instances that don't exist as well */
export function isInstanceActive(instance: CourseInstance): boolean;
export function isInstanceActive(instance_id: number): boolean;
export function isInstanceActive(instanceOrId: number | CourseInstance): boolean {
	return active_instances_ids.has(
		typeof instanceOrId === 'number' ? instanceOrId : instanceOrId.course_instance_id
	);
}

export function getCoursesAmount(): number {
	return courses.size;
}

export function getActiveCourses(): Course[] {
	const coursesCID = new Set<CourseIdString>();
	for (const instance of getActiveInstancesIter()) {
		const CID = GCID(instance.course_id, instance.year);
		coursesCID.add(CID);
	}
	return coursesCID
		.values()
		.map((CID) => courses.get(CID))
		.filter((course): course is Course => {
			if (!course) {
				console.error('A selected course was not found in course map!');
				return false;
			}
			return true;
		})
		.toArray();
}

export function getActiveExams(): CourseExam[] {
	return getActiveInstancesIter()
		.flatMap((instance) => instance.exams)
		.toArray();
}

export function getActiveInstances(): FullCourseInstance[] {
	return getActiveInstancesIter().toArray();
}

/** get full courses with only active instances included in instance list */
export function getActiveFullCourses(): FullCourse[] {
	return constructFullCourses(getActiveInstancesIter()).toArray();
}

/** get full courses with including non active ones */
export function getFullCourses(): FullCourse[] {
	return constructFullCourses(instances.values()).toArray();
}
