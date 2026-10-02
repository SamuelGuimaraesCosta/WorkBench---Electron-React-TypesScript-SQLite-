import { DEFAULT_SETTINGS, type Person, type SchedulerSettings, type Service, type ServiceInput } from '../../shared/scheduler';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { services, settings } from '../db/schema';

export interface SchedulerRepository {
	listPeople(): Promise<Person[]>;
	listServices(): Promise<Service[]>;
	saveService(input: ServiceInput): Promise<Service>;
	removeService(id: number): Promise<void>;
	getSettings(): Promise<SchedulerSettings>;
	saveSettings(s: SchedulerSettings): Promise<SchedulerSettings>;
}

export const schedulerRepo = {
	async listServices(): Promise<Service[]> {
		return db().select().from(services).all();
	},

	async saveService(input: ServiceInput): Promise<Service> {
		const { id, ...values } = input;

		if (id) {
			const updated = db().update(services).set(values).where(eq(services.id, id)).returning().get();

			if (!updated) throw new Error('Serviço não encontrado.');

			return updated;
		}

		return db().insert(services).values(values).returning().get();
	},

	async removeService(id: number): Promise<void> {
		db().delete(services).where(eq(services.id, id)).run();
	},

	async getSettings(): Promise<SchedulerSettings> {
		const row = db().select().from(settings).where(eq(settings.id, 1)).get();

		if (!row) return { ...DEFAULT_SETTINGS };

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { id: _id, ...rest } = row;

		return rest;
	},

	async saveSettings(s: SchedulerSettings): Promise<SchedulerSettings> {
		db()
			.insert(settings)
			.values({ id: 1, ...s })
			.onConflictDoUpdate({ target: settings.id, set: s })
			.run();
		return { ...s };
	}
};
