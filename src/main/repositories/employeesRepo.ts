import { eq } from 'drizzle-orm';
import { db } from '../db';
import { employees } from '../db/schema';
import type { Employee, EmployeeInput } from '../../shared/employees';

export const employeesRepo = {
	async list(): Promise<Employee[]> {
		return db().select().from(employees).all();
	},

	async save(input: EmployeeInput): Promise<Employee> {
		const { id, ...values } = input;

		if (id) {
			const updated = db().update(employees).set(values).where(eq(employees.id, id)).returning().get();

			if (!updated) throw new Error('Funcionário não encontrado.');

			return updated;
		}

		return db().insert(employees).values(values).returning().get();
	},

	/** Retorna o removido, para o IPC apagar a foto */
	async remove(id: number): Promise<Employee | undefined> {
		return db().delete(employees).where(eq(employees.id, id)).returning().get();
	}
};
