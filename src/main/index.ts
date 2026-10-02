import { app, shell, BrowserWindow } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset';
import splashHtml from '../../resources/splash.html?asset';
import { registerSchedulerIpc } from './ipc/scheduler';
import { registerImageProtocol, registerImageScheme } from './images';
import { registerInventoryIpc } from './ipc/inventory';
import { registerToolsIpc } from './ipc/tools';
import { registerImagesIpc } from './ipc/images';

const MIN_SPLASH_MS = 1500; // tempo mínimo na tela, para não piscar

registerImageScheme(); // fora de qualquer função, no topo do módulo

function createSplash(): BrowserWindow {
	const splash = new BrowserWindow({
		width: 420,
		height: 320,
		frame: false,
		transparent: true,
		resizable: false,
		movable: true,
		alwaysOnTop: true,
		skipTaskbar: true,
		center: true,
		show: false,
		icon,
		webPreferences: { sandbox: true }
	});

	splash.loadFile(splashHtml);

	splash.once('ready-to-show', () => splash.show());

	return splash;
}

function createWindow(): BrowserWindow {
	// Create the browser window.
	const mainWindow = new BrowserWindow({
		width: 900,
		height: 670,
		show: false,
		autoHideMenuBar: true,
		icon,
		webPreferences: {
			preload: join(__dirname, '../preload/index.js'),
			sandbox: false
		}
	});

	mainWindow.webContents.setWindowOpenHandler((details) => {
		shell.openExternal(details.url);
		return { action: 'deny' };
	});

	// HMR for renderer base on electron-vite cli.
	// Load the remote URL for development or the local html file for production.
	if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
		mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
	} else {
		mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
	}

	return mainWindow;
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
	// Set app user model id for windows
	electronApp.setAppUserModelId('com.samuelcosta.workbench');

	// Default open or close DevTools by F12 in development
	// and ignore CommandOrControl + R in production.
	// see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
	app.on('browser-window-created', (_, window) => {
		optimizer.watchWindowShortcuts(window);
	});

	registerSchedulerIpc();
	registerImageProtocol();
	registerInventoryIpc();
	registerToolsIpc();
	registerImagesIpc();

	const splash = createSplash();
	const startedAt = Date.now();

	const mainWindow = createWindow();

	mainWindow.once('ready-to-show', () => {
		const restante = Math.max(0, MIN_SPLASH_MS - (Date.now() - startedAt));

		setTimeout(() => {
			if (!splash.isDestroyed()) splash.destroy();

			mainWindow.show();
		}, restante);
	});

	app.on('activate', function () {
		// On macOS it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
