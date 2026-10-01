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
	start: string; // 'YYYY-MM-DDTHH:mm'
	end: string;
}

export interface SchedulerSettings {
	slotMinutes: 30 | 60;
	workDays: number[];
	dayStartHour: number;
	dayEndHour: number;
}

/** O que o renderer envia ao salvar (sem id = novo) */
export type ServiceInput = Omit<Service, 'id'> & { id?: number };

export const DEFAULT_SETTINGS: SchedulerSettings = {
	slotMinutes: 60,
	workDays: [1, 2, 3, 4, 5],
	dayStartHour: 7,
	dayEndHour: 19
};
