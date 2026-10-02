import type { Tool, ToolInput } from '../../shared/tools';

const pad = (n: number): string => String(n).padStart(2, '0');

function day(offset: number): string {
	const d = new Date();

	d.setDate(d.getDate() + offset);

	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

let tools: Tool[] = [
	{
		id: 1,
		name: 'Furadeira de impacto',
		image: null,
		status: 'disponivel',
		quantity: 2,
		personId: 1,
		value: 450,
		nextMaintenance: day(3),
		disposeBy: null
	},
	{
		id: 2,
		name: 'Serra circular',
		image: null,
		status: 'em_uso',
		quantity: 1,
		personId: 2,
		value: 620,
		nextMaintenance: day(60),
		disposeBy: null
	},
	{
		id: 3,
		name: 'Esmerilhadeira',
		image: null,
		status: 'necessita_reparo',
		quantity: 1,
		personId: null,
		value: 380,
		nextMaintenance: null,
		disposeBy: null
	},
	{
		id: 4,
		name: 'Alicate amperímetro',
		image: null,
		status: 'manutencao',
		quantity: 1,
		personId: 3,
		value: 290,
		nextMaintenance: day(-5),
		disposeBy: null
	},
	{
		id: 5,
		name: 'Escada articulada',
		image: null,
		status: 'alugada',
		quantity: 1,
		personId: null,
		value: 180,
		nextMaintenance: null,
		disposeBy: day(20)
	},
	{
		id: 6,
		name: 'Jogo de chaves',
		image: null,
		status: 'necessita_troca',
		quantity: 1,
		personId: 1,
		value: 120,
		nextMaintenance: null,
		disposeBy: day(-10)
	},
	{
		id: 7,
		name: 'Parafusadeira',
		image: null,
		status: 'disponivel',
		quantity: 3,
		personId: 2,
		value: 520,
		nextMaintenance: day(-2),
		disposeBy: null
	}
];
let nextId = 100;

export const toolsRepo = {
	async list(): Promise<Tool[]> {
		return [...tools];
	},

	async save(input: ToolInput): Promise<Tool> {
		if (input.id) {
			if (!tools.some((t) => t.id === input.id))
				throw new Error('Ferramenta não encontrada.');

			const updated = { ...input, id: input.id } as Tool;

			tools = tools.map((t) => (t.id === updated.id ? updated : t));

			return updated;
		}

		const created: Tool = { ...input, id: nextId++ };

		tools = [...tools, created];

		return created;
	},

	/** Retorna a ferramenta removida, para o IPC apagar a imagem */
	async remove(id: number): Promise<Tool | undefined> {
		const found = tools.find((t) => t.id === id);

		tools = tools.filter((t) => t.id !== id);

		return found;
	}
};
