export type EmployeeStatus = 'ativo' | 'ferias' | 'afastado' | 'desligado';

export const EMPLOYEE_STATUS_LABEL: Record<EmployeeStatus, string> = {
	ativo: 'Ativo',
	ferias: 'Férias',
	afastado: 'Afastado',
	desligado: 'Desligado'
};

export const EMPLOYEE_STATUS_ORDER = Object.keys(EMPLOYEE_STATUS_LABEL) as EmployeeStatus[];

export interface Employee {
	id: number;
	name: string;
	photo: string | null;
	role: string; // cargo
	phone: string;
	email: string;
	admission: string | null; // 'YYYY-MM-DD'
	status: EmployeeStatus;
	notes: string;
}

export type EmployeeInput = Omit<Employee, 'id'> & { id?: number };
