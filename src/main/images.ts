import { app, net, protocol } from 'electron';
import { randomUUID } from 'node:crypto';
import { copyFile, mkdir, unlink } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';
import { pathToFileURL } from 'node:url';

export const IMAGE_SCHEME = 'wb-img';
export const IMAGE_NAME_RE = /^[\w-]+\.(png|jpe?g|webp|gif)$/i;

const imagesDir = (): string => join(app.getPath('userData'), 'images');

/** Deve ser chamado ANTES do app ficar pronto */
export function registerImageScheme(): void {
	protocol.registerSchemesAsPrivileged([
		{
			scheme: IMAGE_SCHEME,
			privileges: { standard: true, secure: true, supportFetchAPI: true }
		}
	]);
}

/** Deve ser chamado dentro do app.whenReady() */
export function registerImageProtocol(): void {
	protocol.handle(IMAGE_SCHEME, (request) => {
		const file = basename(decodeURIComponent(new URL(request.url).pathname)); // basename evita path traversal

		if (!IMAGE_NAME_RE.test(file)) return new Response('Not found', { status: 404 });

		return net.fetch(pathToFileURL(join(imagesDir(), file)).toString());
	});
}

export async function importImage(sourcePath: string): Promise<string> {
	const ext = extname(sourcePath).toLowerCase();
	const name = `${randomUUID()}${ext}`;

	if (!IMAGE_NAME_RE.test(name)) throw new Error('Formato de imagem não suportado.');

	await mkdir(imagesDir(), { recursive: true });

	await copyFile(sourcePath, join(imagesDir(), name));

	return name;
}

export async function deleteImage(name: string): Promise<void> {
	if (!IMAGE_NAME_RE.test(name)) return;

	await unlink(join(imagesDir(), name)).catch(() => {}); // ignora se já não existe
}
