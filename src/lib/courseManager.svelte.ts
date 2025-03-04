/*

Goals:
automatic server sync
easy toggle between selected and not of courses, and instances
fast check for course existence
components can subscribe for aspects of courses, are they selected? hovered? clicked? etc...


Thoughts:

Server Sync
Server sync can be achieved with id+year combo. Courses stay with the same id every year, so we use the year to differentiate in case description changes or something.
Instances are much more problematic. Their id changes every time we run the update script (script rebuilds db from scratch every time currently...).
The meaning is that we must compare ALL FIELDS of an instance to verify identity.... not cool...
Sessions are easier, they are coupled to an instance, they have the same identity problem as an instance, but we can just delegate the identification to the instance.
Maybe identifying courses with year+id, generate hash for instances+sessions?
This does not REQUIRE changing db generation mechanism, but does benefit if we do generate hashes at generation.
If we wont add instance+session hashes then we will have to compute the hashes immediately after getting them from the server.

Selected toggle
This might require saving some extra data specific to ui.
They way I imagine this working like so:
1. User tries to add a course or an instance within a course.
2. Manager check to see if object (course or instance) exists.
3. a. If it exists, Manager toggles object state, deleting it if it's a course.
   b. If it does not exist, Manager adds object to internal pool and marks as selected if it's an instance.
I think there shouldn't be any network fetches in here. Manager should get all the data it needs from the function call.
Another thing to consider here, is components reactivity. There should be a reactive object (A Set?) that changes based on the selected state of courses and instances.

Existence check
This should be a straight forward function call. This pretty much requires I use a hashmap for efficiency...
By the nature of a hashmap, it probably means, I have to use multiple hashmaps, one for courses and one for instances.
Perhaps I should use a Set instead? A set can check for existence in O(1+n).
I think I will use a hashmap for toggles and server syncs anyway, but if not a Set might come handy here.

Components subscription
There are a couple of directions we can tackle this from.
We can make a reactive object for each of the important pieces of info our component needs, e.g.:
1. Set for selected courses
2. Set for selected instances
3. Variable for hovered instance
etc...
I think this is wasteful though...
I'd rather have functions that return this data from internal saved state.
If we won't use a class (I thought we needed one but I am not so sure anymore), simply having function computing this data on the fly will work.
But computing every time something changes is also wasteful. I think a middle ground is best. we will have a pool pf all courses with their instances, selected or not.
Then we will make Sets for selected courses, instances and so on, but they will only have pointers to the actual objects (probably more like identifiers for later resolution since this IS js after all, but we can dream :)).
All the Sets will be saved internally, and to access them you will use functions the resolve the Sets to actual data.
It sounds complicated but I think in practice this will be simpler then it sounds.

Solution:

Internal structure includes:
1. Map containing courses
2. Map containing instances (sessions are included in instances)


thoughts:

Server sync
I wrote about it earlier but I forgot a crucial thing:
What do we do when the local data is inconsistent with the server?
Obviously the user should be notified in some way, but what about the built schedule?
Should we delete it? Should we wait for user confirmation?
I think we should add a new panel dedicated for solving this inconsistencies.

Solution:

We save the wrong schedule, notify the user, and force him to fix the schedule before continuing to edit it.
I will make the new panel which will show all courses the changed from the update.
The user may ignore the updates, but he won't be able to further edit the schedule without fixing the inconsistencies.

*/

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
function GCID(course: Course): CourseIdString;
function GCID(course_id: number, year: number): CourseIdString;
function GCID(courseOrId: number | Course, year?: number): CourseIdString {
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
}

////////////// SET STATE FUNCTIONS

export function toggleInstance(instance_id: number) {
	saveSnapshotToUndo();
	// Tries to deactivate instance. If instance is already deactivated, activates it.
	if (!active_instances_ids.delete(instance_id)) active_instances_ids.add(instance_id);
	saveServerActiveInstances();
	saveLocalData();
}

export function addCourse(course: Course, course_instances: FullCourseInstance[]) {
	saveSnapshotToUndo();
	const courseKeys: (keyof Course)[] = [
		'course_id',
		'name',
		'year',
		'credit',
		'description',
		'syllabus_link',
	];
	const stripped_course = stripExcessProperties(course, courseKeys);
	courses.set(GCID(stripped_course), stripped_course);
	for (let i = 0; i < course_instances.length; i++)
		instances.set(course_instances[i].course_instance_id, course_instances[i]);

	saveServerInstances();
	saveServerCourses();
	saveLocalData();
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
