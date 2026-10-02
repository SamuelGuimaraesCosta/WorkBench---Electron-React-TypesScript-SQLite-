import { ipcMain } from 'electron';
import { employeesRepo } from '../repositories/employeesRepo';
import { IMAGE_NAME_RE, deleteImage } from '../images';
import { EMPLOYEE_STATUS_ORDER, type EmployeeInput } from '../../shared/employees';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(e: EmployeeInput): void {
	if (!e.name?.trim()) throw new Error('Informe o nome do funcionário.');

	if (!EMPLOYEE_STATUS_ORDER.includes(e.status)) throw new Error('Status inválido.');

	if (e.email && !EMAIL_RE.test(e.email)) throw new Error('E-mail inválido.');

	if (e.admission && !DATE_RE.test(e.admission)) throw new Error('Data de admissão inválida.');

	if (e.photo && !IMAGE_NAME_RE.test(e.photo)) throw new Error('Imagem inválida.');
}

export function registerEmployeesIpc(): void {
	ipcMain.handle('employees:list', () => employeesRepo.list());

	ipcMain.handle('employees:save', async (_e, input: EmployeeInput) => {
		validate(input);

		const previous = input.id ? (await employeesRepo.list()).find((x) => x.id === input.id) : undefined;

		const saved = await employeesRepo.save(input);

		if (previous?.photo && previous.photo !== saved.photo) await deleteImage(previous.photo);

		return saved;
	});

	ipcMain.handle('employees:remove', async (_e, id: number) => {
		const removed = await employeesRepo.remove(id);

		if (removed?.photo) await deleteImage(removed.photo);
	});
}
