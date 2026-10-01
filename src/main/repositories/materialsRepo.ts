import type { Material, MaterialInput } from '../../shared/inventory';

let materials: Material[] = [
	{
		id: 1,
		name: 'Fio flexível 2,5mm',
		image: null,
		quantity: 120,
		maxQuantity: 200,
		value: 3.5,
		unit: 'm'
	},
	{
		id: 2,
		name: 'Disjuntor 20A',
		image: null,
		quantity: 4,
		maxQuantity: 30,
		value: 18.9,
		unit: 'un'
	},
	{
		id: 3,
		name: 'Parafuso 6x40',
		image: null,
		quantity: 80,
		maxQuantity: 100,
		value: 0.45,
		unit: 'un'
	},
	{
		id: 4,
		name: 'Fita isolante',
		image: null,
		quantity: 12,
		maxQuantity: 24,
		value: 6.9,
		unit: 'rolo'
	}
];
let nextId = 100;

export const materialsRepo = {
	async list(): Promise<Material[]> {
		return [...materials];
	},
	async save(input: MaterialInput): Promise<Material> {
		if (input.id) {
			if (!materials.some((m) => m.id === input.id))
				throw new Error('Material não encontrado.');

			const updated = { ...input, id: input.id } as Material;

			materials = materials.map((m) => (m.id === updated.id ? updated : m));

			return updated;
		}

		const created: Material = { ...input, id: nextId++ };

		materials = [...materials, created];

		return created;
	},
	/** Retorna o material removido, para o IPC apagar a imagem */
	async remove(id: number): Promise<Material | undefined> {
		const found = materials.find((m) => m.id === id);

		materials = materials.filter((m) => m.id !== id);

		return found;
	}
};
