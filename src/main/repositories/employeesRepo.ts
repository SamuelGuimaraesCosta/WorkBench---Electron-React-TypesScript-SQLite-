import type { Employee, EmployeeInput } from '../../shared/employees';

let employees: Employee[] = [
	{ id: 1, name: 'Carlos', photo: null, role: 'Eletricista', phone: '(31) 99999-0001', email: 'carlos@exemplo.com', admission: '2021-03-15', status: 'ativo', notes: '' },
	{ id: 2, name: 'Ana', photo: null, role: 'Técnica de refrigeração', phone: '(31) 99999-0002', email: 'ana@exemplo.com', admission: '2022-08-01', status: 'ativo', notes: '' },
	{ id: 3, name: 'João', photo: null, role: 'Auxiliar', phone: '(31) 99999-0003', email: '', admission: '2024-01-10', status: 'ferias', notes: '' }
];
let nextId = 100;

export const employeesRepo = {
	async list(): Promise<Employee[]> {
		return [...employees];
	},

	async save(input: EmployeeInput): Promise<Employee> {
		if (input.id) {
			if (!employees.some((e) => e.id === input.id)) throw new Error('Funcionário não encontrado.');
			const updated = { ...input, id: input.id } as Employee;
			employees = employees.map((e) => (e.id === updated.id ? updated : e));
			return updated;
		}
		const created: Employee = { ...input, id: nextId++ };
		employees = [...employees, created];
		return created;
	},

	async remove(id: number): Promise<Employee | undefined> {
		const found = employees.find((e) => e.id === id);
		employees = employees.filter((e) => e.id !== id);
		return found;
	}
};
