import { app } from 'electron';
import { is } from '@electron-toolkit/utils';
import Database from 'better-sqlite3';
import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import * as schema from './schema';
import { runMigrations } from './migrations';
import { seedDemoData } from './seed';

type Db = BetterSQLite3Database<typeof schema>;

let sqlite: Database.Database | null = null;
let instance: Db | null = null;

export function initDatabase(): void {
	const dir = app.getPath('userData');

	mkdirSync(dir, { recursive: true });

	sqlite = new Database(join(dir, 'workbench.db'));
	sqlite.pragma('journal_mode = WAL');
	sqlite.pragma('foreign_keys = ON'); // necessário para o ON DELETE SET NULL funcionar

	const previousVersion = runMigrations(sqlite);

	instance = drizzle(sqlite, { schema });

	// banco recém-criado: no dev, já vem com dados de exemplo
	if (previousVersion === 0 && is.dev) seedDemoData(instance);
}

export function db(): Db {
	if (!instance) throw new Error('Banco de dados não inicializado.');

	return instance;
}

export function closeDatabase(): void {
	sqlite?.close();
	sqlite = null;
	instance = null;
}
