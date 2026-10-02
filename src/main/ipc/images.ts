import { BrowserWindow, dialog, ipcMain } from 'electron';
import { deleteImage, importImage } from '../images';

export function registerImagesIpc(): void {
	ipcMain.handle('images:pick', async (e) => {
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

	ipcMain.handle('images:discard', (_e, name: string) => deleteImage(name));
}
