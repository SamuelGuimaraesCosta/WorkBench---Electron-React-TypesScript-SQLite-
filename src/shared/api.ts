import type { Person, SchedulerSettings, Service, ServiceInput } from './scheduler';
import type { Material, MaterialInput } from './inventory';
import type { Tool, ToolInput } from './tools';
import { Employee, EmployeeInput } from './employees';

export interface Api {
	people: {
		list(): Promise<Person[]>;
	};
	services: {
		list(): Promise<Service[]>;
		save(input: ServiceInput): Promise<Service>;
		remove(id: number): Promise<void>;
	};
	settings: {
		get(): Promise<SchedulerSettings>;
		save(settings: SchedulerSettings): Promise<SchedulerSettings>;
	};
	materials: {
		list(): Promise<Material[]>;
		save(input: MaterialInput): Promise<Material>;
		remove(id: number): Promise<void>;
		pickImage(): Promise<string | null>; // abre o seletor e copia para userData
		discardImage(name: string): Promise<void>;
	};
	tools: {
		list(): Promise<Tool[]>;
		save(input: ToolInput): Promise<Tool>;
		remove(id: number): Promise<void>;
	};
	images: {
		pick(): Promise<string | null>;
		discard(name: string): Promise<void>;
	};
	employees: {
		list(): Promise<Employee[]>;
		save(input: EmployeeInput): Promise<Employee>;
		remove(id: number): Promise<void>;
	};
}
