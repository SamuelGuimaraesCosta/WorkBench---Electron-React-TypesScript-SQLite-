export function errorMessage(e: unknown): string {
	const msg = e instanceof Error ? e.message : String(e);

	return msg.replace(/^Error invoking remote method '[^']+': (Error: )?/, '');
}
