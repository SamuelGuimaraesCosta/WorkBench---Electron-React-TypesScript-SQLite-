import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import type { EmployeeStatus } from '../../shared/employees';
import type { Priority } from '../../shared/scheduler';
import type { ToolStatus } from '../../shared/tools';

export const employees = sqliteTable('employees', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	photo: text('photo'),
	role: text('role').notNull().default(''),
	phone: text('phone').notNull().default(''),
	email: text('email').notNull().default(''),
	admission: text('admission'),
	status: text('status').$type<EmployeeStatus>().notNull().default('ativo'),
	notes: text('notes').notNull().default('')
});

export const services = sqliteTable('services', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	client: text('client').notNull(),
	personId: integer('person_id').references(() => employees.id, { onDelete: 'set null' }),
	priority: text('priority').$type<Priority>().notNull(),
	start: text('start_at').notNull(), // 'YYYY-MM-DDTHH:mm'
	end: text('end_at').notNull()
});

export const materials = sqliteTable('materials', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	image: text('image'),
	quantity: real('quantity').notNull(),
	maxQuantity: real('max_quantity').notNull(),
	value: real('value').notNull(),
	unit: text('unit').notNull()
});

export const tools = sqliteTable('tools', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	image: text('image'),
	status: text('status').$type<ToolStatus>().notNull(),
	quantity: integer('quantity').notNull(),
	personId: integer('person_id').references(() => employees.id, { onDelete: 'set null' }),
	value: real('value').notNull(),
	nextMaintenance: text('next_maintenance'),
	disposeBy: text('dispose_by')
});

// linha única (id sempre 1)
export const settings = sqliteTable('settings', {
	id: integer('id').primaryKey(),
	slotMinutes: integer('slot_minutes').$type<30 | 60>().notNull(),
	workDays: text('work_days', { mode: 'json' }).$type<number[]>().notNull(),
	dayStartHour: integer('day_start_hour').notNull(),
	dayEndHour: integer('day_end_hour').notNull()
});
