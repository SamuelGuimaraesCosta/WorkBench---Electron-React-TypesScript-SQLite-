export type Priority = 'baixo' | 'medio' | 'alto' | 'atrasado';

export const PRIORITY_LABEL: Record<Priority, string> = {
	baixo: 'Baixo',
	medio: 'Médio',
	alto: 'Alto',
	atrasado: 'Atrasado'
};

export interface Person {
	id: number;
	name: string;
}

export interface Service {
	id: number;
	name: string;
	client: string;
	personId: number | null;
	priority: Priority;
	start: string; // 'YYYY-MM-DDTHH:mm' (horário local)
	end: string;
}

export interface SchedulerSettings {
	slotMinutes: 30 | 60;
	workDays: number[]; // 0 = domingo ... 6 = sábado
	dayStartHour: number;
	dayEndHour: number;
}
