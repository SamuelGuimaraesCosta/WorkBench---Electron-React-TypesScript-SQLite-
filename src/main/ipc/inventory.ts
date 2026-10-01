import { BrowserWindow, dialog, ipcMain } from 'electron';
import { materialsRepo } from '../repositories/materialsRepo';
import { IMAGE_NAME_RE, deleteImage, importImage } from '../images';
import type { MaterialInput } from '../../shared/inventory';

function validate(m: MaterialInput): void {
	if (!m.name?.trim()) throw new Error('Informe o nome do material.');

	if (!m.unit?.trim()) throw new Error('Informe a unidade.');

	if (!(m.quantity >= 0)) throw new Error('Quantidade inválida.');

	if (!(m.maxQuantity > 0)) throw new Error('O estoque máximo deve ser maior que zero.');

	if (m.quantity > m.maxQuantity)
		throw new Error('A quantidade não pode passar do estoque máximo.');

	if (!(m.value >= 0)) throw new Error('Valor inválido.');

	if (m.image && !IMAGE_NAME_RE.test(m.image)) throw new Error('Imagem inválida.');
}

export function registerInventoryIpc(): void {
	ipcMain.handle('materials:list', () => materialsRepo.list());

	ipcMain.handle('materials:save', async (_e, input: MaterialInput) => {
		validate(input);

		const previous = input.id
			? (await materialsRepo.list()).find((m) => m.id === input.id)
			: undefined;
		const saved = await materialsRepo.save(input);
		// trocou ou removeu a imagem: apaga o arquivo antigo
		if (previous?.image && previous.image !== saved.image) await deleteImage(previous.image);

		return saved;
	});

	ipcMain.handle('materials:remove', async (_e, id: number) => {
		const removed = await materialsRepo.remove(id);

		if (removed?.image) await deleteImage(removed.image);
	});

	ipcMain.handle('materials:pickImage', async (e) => {
		const win = BrowserWindow.fromWebContents(e.sender);
		const options: Electron.OpenDialogOptions = {
			title: 'Escolher imagem',
			properties: ['openFile'],
			filters: [{ name: 'Imagens', extensions: ['png', 'jpg', 'jpeg', 'webp', 'gif'] }]
		};
		const result = win
			? await dialog.showOpenDialog(win, options)
			: await dialog.showOpenDialog(options);

		if (result.canceled || !result.filePaths[0]) return null;

		return importImage(result.filePaths[0]);
	});

	ipcMain.handle('materials:discardImage', (_e, name: string) => deleteImage(name));
}
