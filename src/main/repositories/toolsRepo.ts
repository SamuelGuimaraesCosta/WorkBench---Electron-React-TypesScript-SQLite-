import type { Tool, ToolInput } from '../../shared/tools';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { tools } from '../db/schema';

export const toolsRepo = {
	async list(): Promise<Tool[]> {
		return db().select().from(tools).all();
	},

	async save(input: ToolInput): Promise<Tool> {
		const { id, ...values } = input;
		if (id) {
			const updated = db().update(tools).set(values).where(eq(tools.id, id)).returning().get();
			if (!updated) throw new Error('Ferramenta não encontrada.');
			return updated;
		}
		return db().insert(tools).values(values).returning().get();
	},

	async remove(id: number): Promise<Tool | undefined> {
		return db().delete(tools).where(eq(tools.id, id)).returning().get();
	}
};
