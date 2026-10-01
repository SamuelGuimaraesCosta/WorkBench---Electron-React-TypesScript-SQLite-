import type { Person, SchedulerSettings, Service, ServiceInput } from './scheduler';
import type { Material, MaterialInput } from './inventory';

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
}
