export const WEEKDAY_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
export const WEEKDAY_LONG = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

const pad: (n: number) => string = (n: number) => String(n).padStart(2, '0');

export function toLocalInput(d: Date): string {
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatTime(d: Date): string {
	return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function startOfWeek(d: Date): Date {
	const r = new Date(d.getFullYear(), d.getMonth(), d.getDate());

	r.setDate(r.getDate() - ((r.getDay() + 6) % 7)); // semana começa na segunda

	return r;
}

export function addDays(d: Date, n: number): Date {
	const r = new Date(d);

	r.setDate(r.getDate() + n);

	return r;
}

export function sameDay(a: Date, b: Date): boolean {
	return (
		a.getFullYear() === b.getFullYear() &&
		a.getMonth() === b.getMonth() &&
		a.getDate() === b.getDate()
	);
}

export function formatWeekRange(weekStart: Date): string {
	const end = addDays(weekStart, 6);
	const f: (d: Date) => string = (d: Date) =>
		d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

	return `${f(weekStart)} – ${f(end)} ${end.getFullYear()}`;
}
