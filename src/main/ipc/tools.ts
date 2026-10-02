import { ipcMain } from 'electron';
import { toolsRepo } from '../repositories/toolsRepo';
import { IMAGE_NAME_RE, deleteImage } from '../images';
import { STATUS_ORDER, type ToolInput } from '../../shared/tools';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function validate(t: ToolInput): void {
	if (!t.name?.trim()) throw new Error('Informe o nome da ferramenta.');

	if (!STATUS_ORDER.includes(t.status)) throw new Error('Status inválido.');

	if (!Number.isInteger(t.quantity) || t.quantity < 1)
		throw new Error('A quantidade deve ser um número inteiro maior que zero.');

	if (!(t.value >= 0)) throw new Error('Valor inválido.');

	if (t.nextMaintenance && !DATE_RE.test(t.nextMaintenance))
		throw new Error('Data de manutenção inválida.');

	if (t.disposeBy && !DATE_RE.test(t.disposeBy)) throw new Error('Data de descarte inválida.');

	if (t.image && !IMAGE_NAME_RE.test(t.image)) throw new Error('Imagem inválida.');
}

export function registerToolsIpc(): void {
	ipcMain.handle('tools:list', () => toolsRepo.list());

	ipcMain.handle('tools:save', async (_e, input: ToolInput) => {
		validate(input);

		const previous = input.id
			? (await toolsRepo.list()).find((t) => t.id === input.id)
			: undefined;
		const saved = await toolsRepo.save(input);

		if (previous?.image && previous.image !== saved.image) await deleteImage(previous.image);

		return saved;
	});

	ipcMain.handle('tools:remove', async (_e, id: number) => {
		const removed = await toolsRepo.remove(id);

		if (removed?.image) await deleteImage(removed.image);
	});
}
