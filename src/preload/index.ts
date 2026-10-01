import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';
import { Api } from '../shared/api';

// Custom APIs for renderer
const api: Api = {
	people: {
		list: () => ipcRenderer.invoke('people:list')
	},
	services: {
		list: () => ipcRenderer.invoke('services:list'),
		save: (input) => ipcRenderer.invoke('services:save', input),
		remove: (id) => ipcRenderer.invoke('services:remove', id)
	},
	settings: {
		get: () => ipcRenderer.invoke('settings:get'),
		save: (settings) => ipcRenderer.invoke('settings:save', settings)
	}
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
	try {
		contextBridge.exposeInMainWorld('electron', electronAPI);
		contextBridge.exposeInMainWorld('api', api);
	} catch (error) {
		console.error(error);
	}
} else {
	// @ts-ignore (define in dts)
	window.electron = electronAPI;
	// @ts-ignore (define in dts)
	window.api = api;
}
