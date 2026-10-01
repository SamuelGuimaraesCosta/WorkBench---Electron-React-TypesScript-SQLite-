import type { Person, SchedulerSettings, Service, ServiceInput } from './scheduler';

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
}
