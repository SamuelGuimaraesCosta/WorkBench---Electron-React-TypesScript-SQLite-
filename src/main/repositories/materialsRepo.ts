import type { Material, MaterialInput } from '../../shared/inventory';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { materials } from '../db/schema';

export const materialsRepo = {
	async list(): Promise<Material[]> {
		return db().select().from(materials).all();
	},

	async save(input: MaterialInput): Promise<Material> {
		const { id, ...values } = input;
		if (id) {
			const updated = db().update(materials).set(values).where(eq(materials.id, id)).returning().get();
			if (!updated) throw new Error('Material não encontrado.');
			return updated;
		}
		return db().insert(materials).values(values).returning().get();
	},

	async remove(id: number): Promise<Material | undefined> {
		return db().delete(materials).where(eq(materials.id, id)).returning().get();
	}
};
