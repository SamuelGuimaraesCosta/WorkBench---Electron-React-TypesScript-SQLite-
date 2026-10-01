import { useSyncExternalStore } from 'react';

type LoaderState = { isLoading: boolean; message: string };

let messages: string[] = [];
let state: LoaderState = { isLoading: false, message: '' };

const listeners = new Set<() => void>();

function emit(): void {
	state = {
		isLoading: messages.length > 0,
		message: messages[messages.length - 1] ?? ''
	};

	// Bloqueia teclado/foco no app inteiro (o clique já é barrado pelo overlay)
	const root = document.getElementById('root');
	root?.toggleAttribute('inert', state.isLoading);
	if (state.isLoading && document.activeElement instanceof HTMLElement) {
		document.activeElement.blur();
	}

	listeners.forEach((l) => l());
}

export function startLoader(message = 'Carregando...'): void {
	messages.push(message);
	emit();
}

export function stopLoader(): void {
	messages.pop();
	emit();
}

/** Zera tudo (útil em caso de erro inesperado) */
export function resetLoader(): void {
	messages = [];
	emit();
}

/** Atalho: inicia, executa e encerra, mesmo se der erro */
export async function withLoader<T>(fn: () => Promise<T>, message?: string): Promise<T> {
	startLoader(message);
	try {
		return await fn();
	} finally {
		stopLoader();
	}
}

export function useLoaderState(): LoaderState {
	return useSyncExternalStore(
		(cb) => {
			listeners.add(cb);
			return () => listeners.delete(cb);
		},
		() => state
	);
}
