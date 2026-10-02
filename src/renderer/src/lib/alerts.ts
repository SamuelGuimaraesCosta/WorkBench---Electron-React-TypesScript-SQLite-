import { useSyncExternalStore } from 'react';
import { buildAlerts, type ToolAlert } from '../types/tools';

let alerts: ToolAlert[] = [];
const listeners = new Set<() => void>();

export async function refreshAlerts(): Promise<void> {
	try {
		alerts = buildAlerts(await window.api.tools.list());

		listeners.forEach((l) => l());
	} catch (e) {
		console.error('Falha ao atualizar alertas', e);
	}
}

export function useAlerts(): ToolAlert[] {
	return useSyncExternalStore(
		(cb) => {
			listeners.add(cb);

			return () => listeners.delete(cb);
		},
		() => alerts
	);
}

let started = false;
/** Atualiza ao abrir, ao voltar para a janela e a cada 30 min (as datas mudam com o tempo) */
export function startAlertsWatcher(): void {
	if (started) return;

	started = true;

	refreshAlerts();

	window.addEventListener('focus', refreshAlerts);

	setInterval(refreshAlerts, 30 * 60 * 1000);
}
