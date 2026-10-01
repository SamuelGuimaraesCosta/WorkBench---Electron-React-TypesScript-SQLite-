import { ipcMain } from 'electron';
import { schedulerRepo } from '../repositories/schedulerRepo';
import type { SchedulerSettings, ServiceInput } from '../../shared/scheduler';

function validateService(s: ServiceInput): void {
	if (!s.name?.trim()) throw new Error('Informe o nome do serviço.');
	if (!s.client?.trim()) throw new Error('Informe o cliente.');
	if (!s.start || !s.end) throw new Error('Informe início e fim.');
	if (new Date(s.end) <= new Date(s.start))
		throw new Error('O fim precisa ser depois do início.');
}

function validateSettings(s: SchedulerSettings): void {
	if (![30, 60].includes(s.slotMinutes)) throw new Error('Intervalo inválido.');
	if (!s.workDays?.length) throw new Error('Selecione ao menos um dia de trabalho.');
	if (s.dayEndHour <= s.dayStartHour) throw new Error('Horário do dia inválido.');
}

export function registerSchedulerIpc(): void {
	ipcMain.handle('people:list', () => schedulerRepo.listPeople());

	ipcMain.handle('services:list', () => schedulerRepo.listServices());
	ipcMain.handle('services:save', (_e, input: ServiceInput) => {
		validateService(input);
		return schedulerRepo.saveService(input);
	});
	ipcMain.handle('services:remove', (_e, id: number) => schedulerRepo.removeService(id));

	ipcMain.handle('settings:get', () => schedulerRepo.getSettings());
	ipcMain.handle('settings:save', (_e, s: SchedulerSettings) => {
		validateSettings(s);
		return schedulerRepo.saveSettings(s);
	});
}
