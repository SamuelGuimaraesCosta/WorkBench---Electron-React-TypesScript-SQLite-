import {
	DEFAULT_SETTINGS,
	type Person,
	type SchedulerSettings,
	type Service,
	type ServiceInput
} from '../../shared/scheduler';

export interface SchedulerRepository {
	listPeople(): Promise<Person[]>;
	listServices(): Promise<Service[]>;
	saveService(input: ServiceInput): Promise<Service>;
	removeService(id: number): Promise<void>;
	getSettings(): Promise<SchedulerSettings>;
	saveSettings(s: SchedulerSettings): Promise<SchedulerSettings>;
}

// ---------- dados em memória (temporário) ----------
const pad = (n: number): string => String(n).padStart(2, '0');
const fmt = (d: Date): string =>
	`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

function seedServices(): Service[] {
	const now = new Date();
	const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

	monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));

	const at = (day: number, h: number): string =>
		fmt(new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + day, h));

	return [
		{
			id: 1,
			name: 'Troca de fiação',
			client: 'Mercado Central',
			personId: 1,
			priority: 'alto',
			start: at(0, 8),
			end: at(0, 11)
		},
		{
			id: 2,
			name: 'Revisão de compressor',
			client: 'Padaria Sol',
			personId: 2,
			priority: 'medio',
			start: at(1, 9),
			end: at(1, 12)
		},
		{
			id: 3,
			name: 'Instalação de bancada',
			client: 'Oficina Silva',
			personId: 3,
			priority: 'baixo',
			start: at(1, 10),
			end: at(1, 13)
		},
		{
			id: 4,
			name: 'Reparo urgente',
			client: 'Clínica Vida',
			personId: 1,
			priority: 'atrasado',
			start: at(2, 14),
			end: at(3, 10)
		}
	];
}

const people: Person[] = [
	{ id: 1, name: 'Carlos' },
	{ id: 2, name: 'Ana' },
	{ id: 3, name: 'João' }
];

let services = seedServices();
let settings: SchedulerSettings = { ...DEFAULT_SETTINGS };
let nextId = 100;

// Descomente para testar o loader (simula uma operação lenta)
// const slow = () => new Promise((r) => setTimeout(r, 1200))
const slow = async (): Promise<void> => {};

export const schedulerRepo: SchedulerRepository = {
	async listPeople() {
		await slow();

		return [...people];
	},
	async listServices() {
		await slow();

		return [...services];
	},
	async saveService(input) {
		await slow();

		if (input.id) {
			const exists = services.some((s) => s.id === input.id);

			if (!exists) throw new Error('Serviço não encontrado.');

			const updated = { ...input, id: input.id } as Service;

			services = services.map((s) => (s.id === updated.id ? updated : s));

			return updated;
		}

		const created: Service = { ...input, id: nextId++ };

		services = [...services, created];

		return created;
	},
	async removeService(id) {
		await slow();

		services = services.filter((s) => s.id !== id);
	},
	async getSettings() {
		return { ...settings };
	},
	async saveSettings(s) {
		settings = { ...s };
		return { ...settings };
	}
};
