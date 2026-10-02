import type Database from 'better-sqlite3';

/**
 * Cada item é uma versão do banco. Para mudar a estrutura no futuro,
 * ADICIONE um novo item no final. Nunca edite os que já existem.
 */
const MIGRATIONS: string[] = [
	/* 1 */ `
  CREATE TABLE employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    photo TEXT,
    role TEXT NOT NULL DEFAULT '',
    phone TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL DEFAULT '',
    admission TEXT,
    status TEXT NOT NULL DEFAULT 'ativo',
    notes TEXT NOT NULL DEFAULT ''
  );

  CREATE TABLE services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    client TEXT NOT NULL,
    person_id INTEGER REFERENCES employees(id) ON DELETE SET NULL,
    priority TEXT NOT NULL,
    start_at TEXT NOT NULL,
    end_at TEXT NOT NULL
  );
  CREATE INDEX idx_services_start ON services(start_at);

  CREATE TABLE materials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    image TEXT,
    quantity REAL NOT NULL,
    max_quantity REAL NOT NULL,
    value REAL NOT NULL,
    unit TEXT NOT NULL
  );

  CREATE TABLE tools (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    image TEXT,
    status TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    person_id INTEGER REFERENCES employees(id) ON DELETE SET NULL,
    value REAL NOT NULL,
    next_maintenance TEXT,
    dispose_by TEXT
  );

  CREATE TABLE settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    slot_minutes INTEGER NOT NULL,
    work_days TEXT NOT NULL,
    day_start_hour INTEGER NOT NULL,
    day_end_hour INTEGER NOT NULL
  );
  `
];

/** Aplica as migrations pendentes e devolve a versão que o banco tinha ao abrir (0 = banco novo) */
export function runMigrations(sqlite: Database.Database): number {
	const current = sqlite.pragma('user_version', { simple: true }) as number;

	MIGRATIONS.slice(current).forEach((sql, i) => {
		const version = current + i + 1;
		sqlite.transaction(() => {
			sqlite.exec(sql);
			sqlite.pragma(`user_version = ${version}`);
		})();
	});

	return current;
}
