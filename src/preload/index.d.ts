import { ElectronAPI } from '@electron-toolkit/preload';
import { Api } from '../shared/api';

declare global {
	interface Window {
		electron: ElectronAPI;
		api: Api;
	}
}
