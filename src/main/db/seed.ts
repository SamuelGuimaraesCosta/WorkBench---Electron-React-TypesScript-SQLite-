import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

const pad = (n: number): string => String(n).padStart(2, '0');
const fmtDay = (d: Date): string => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const day = (offset: number): string => {
	const d = new Date();

	d.setDate(d.getDate() + offset);

	return fmtDay(d);
};

export function seedDemoData(db: BetterSQLite3Database<typeof schema>): void {
	const monday = new Date();

	monday.setHours(0, 0, 0, 0);
	monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));

	const at = (offset: number, h: number): string => {
		const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + offset, h);

		return `${fmtDay(d)}T${pad(d.getHours())}:00`;
	};

	const [carlos, ana, joao] = db
		.insert(schema.employees)
		.values([
			{ name: 'Carlos', role: 'Eletricista', phone: '(31) 99999-0001', email: 'carlos@exemplo.com', admission: '2021-03-15', status: 'ativo' },
			{ name: 'Ana', role: 'Técnica de refrigeração', phone: '(31) 99999-0002', email: 'ana@exemplo.com', admission: '2022-08-01', status: 'ativo' },
			{ name: 'João', role: 'Auxiliar', phone: '(31) 99999-0003', email: '', admission: '2024-01-10', status: 'ferias' }
		])
		.returning()
		.all();

	db.insert(schema.services)
		.values([
			{ name: 'Troca de fiação', client: 'Mercado Central', personId: carlos.id, priority: 'alto', start: at(0, 8), end: at(0, 11) },
			{ name: 'Revisão de compressor', client: 'Padaria Sol', personId: ana.id, priority: 'medio', start: at(1, 9), end: at(1, 12) },
			{ name: 'Instalação de bancada', client: 'Oficina Silva', personId: joao.id, priority: 'baixo', start: at(1, 10), end: at(1, 13) },
			{ name: 'Reparo urgente', client: 'Clínica Vida', personId: carlos.id, priority: 'atrasado', start: at(2, 14), end: at(3, 10) }
		])
		.run();

	db.insert(schema.materials)
		.values([
			{ name: 'Fio flexível 2,5mm', quantity: 120, maxQuantity: 200, value: 3.5, unit: 'm' },
			{ name: 'Disjuntor 20A', quantity: 4, maxQuantity: 30, value: 18.9, unit: 'un' },
			{ name: 'Parafuso 6x40', quantity: 80, maxQuantity: 100, value: 0.45, unit: 'un' },
			{ name: 'Fita isolante', quantity: 12, maxQuantity: 24, value: 6.9, unit: 'rolo' }
		])
		.run();

	db.insert(schema.tools)
		.values([
			{ name: 'Furadeira de impacto', status: 'disponivel', quantity: 2, personId: carlos.id, value: 450, nextMaintenance: day(3) },
			{ name: 'Serra circular', status: 'em_uso', quantity: 1, personId: ana.id, value: 620, nextMaintenance: day(60) },
			{ name: 'Esmerilhadeira', status: 'necessita_reparo', quantity: 1, value: 380 },
			{ name: 'Alicate amperímetro', status: 'manutencao', quantity: 1, personId: joao.id, value: 290, nextMaintenance: day(-5) },
			{ name: 'Escada articulada', status: 'alugada', quantity: 1, value: 180, disposeBy: day(20) },
			{ name: 'Jogo de chaves', status: 'necessita_troca', quantity: 1, personId: carlos.id, value: 120, disposeBy: day(-10) },
			{ name: 'Parafusadeira', status: 'disponivel', quantity: 3, personId: ana.id, value: 520, nextMaintenance: day(-2) }
		])
		.run();
}
