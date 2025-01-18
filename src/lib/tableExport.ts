import jsPDF from 'jspdf';
import autoTable, { type RowInput } from 'jspdf-autotable';
import { hoursList } from './utils/constants.utils';
import { getDay, getHour } from './utils/formatter.utils';

export function exportTable(items: Item[]) {
	const doc = new jsPDF();

	doc.addFont('/fonts/Rubik-VariableFont_wght.ttf', 'Rubik', 'normal');
	doc.setFont('Rubik'); // set font
	// doc.setR2L(true);

	// Or use javascript directly:
	const head: RowInput[] = [
		[...Array(6)]
			.map((_, i) => getDay(i))
			.reverse()
			.concat(['']),
	];

	const body: RowInput[] = hoursList.map((hour) => {
		const row = [{ content: getHour(hour.hour, hour.min) }];
		const hourIndex = hoursList.findIndex((h) => h.hour === hour.hour && h.min === hour.min);
		const itemsInRow = items.filter(
			(item) => item.start < hourIndex && hourIndex < item.end
		).length;
		return row
			.concat(
				[...Array(6 - itemsInRow)].map((_, i) => {
					const item = items.find((item) => item.day === i && item.start === hourIndex);
					if (!item) return { content: '' };

					return {
						content: [item.type, item.value.name, item.value.instructor, item.value.room].join(
							'\n'
						),
						rowSpan: item.end - item.start,
						styles: { fillColor: '#d0dbfb' },
					};
				})
			)
			.reverse();
	});

	autoTable(doc, {
		head,
		body,
		theme: 'grid',
		styles: { font: 'Rubik', valign: 'middle', halign: 'center' },
		willDrawCell: (data) => {
			if (data.section === 'body' && data.column.index === 6) doc.setR2L(false);
			else doc.setR2L(true);
		},
	});

	doc.save('מערכת שעות.pdf');
}
