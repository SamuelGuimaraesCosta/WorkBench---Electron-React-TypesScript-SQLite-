import { JSX, useEffect, useState } from 'react';
import { SchedulerGrid } from '../components/scheduler/SchedulerGrid';
import { ServiceModal, type ServiceDraft } from '../components/scheduler/ServiceModal';
import {
	PRIORITY_LABEL,
	type Person,
	type Priority,
	type SchedulerSettings,
	type Service
} from '../types/scheduler';
import { WEEKDAY_LONG, addDays, formatWeekRange, startOfWeek, toLocalInput } from '../lib/dates';
import { withLoader } from '../lib/loader';
import { errorMessage } from '../lib/errors';
import './Services.css';

const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

export default function Services(): JSX.Element {
	const [settings, setSettings] = useState<SchedulerSettings | null>(null);
	const [people, setPeople] = useState<Person[]>([]);
	const [services, setServices] = useState<Service[]>([]);
	const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
	const [editing, setEditing] = useState<Partial<Service> | null>(null);
	const [showSettings, setShowSettings] = useState(false);

	const fail = (e: unknown): void => window.alert(errorMessage(e));

	// carga inicial
	useEffect(() => {
		let cancelled = false;
		withLoader(async () => {
			const [p, s, st] = await Promise.all([
				window.api.people.list(),
				window.api.services.list(),
				window.api.settings.get()
			]);
			if (cancelled) return;
			setPeople(p);
			setServices(s);
			setSettings(st);
		}, 'Carregando agenda...').catch(fail);

		return () => {
			cancelled = true;
		};
	}, []);

	// enquanto não carregou, não renderiza a grade
	if (!settings) return <div className="services" />;

	const updateSettings = (next: SchedulerSettings): void => {
		setSettings(next); // atualiza a tela na hora
		window.api.settings.save(next).catch(fail); // persiste sem bloquear a tela
	};

	const toggleDay = (day: number): void => {
		const has = settings.workDays.includes(day);
		if (has && settings.workDays.length === 1) return; // mantém ao menos um dia
		updateSettings({
			...settings,
			workDays: has ? settings.workDays.filter((d) => d !== day) : [...settings.workDays, day]
		});
	};

	const openNew = (date?: Date): void => {
		const start = date ?? new Date(new Date().setMinutes(0, 0, 0));
		const end = new Date(start.getTime() + settings.slotMinutes * 60000);
		setEditing({ start: toLocalInput(start), end: toLocalInput(end), priority: 'medio' });
	};

	const save = async (draft: ServiceDraft): Promise<void> => {
		try {
			const saved = await withLoader(
				() => window.api.services.save(draft),
				'Salvando serviço...'
			);
			setServices((list) =>
				draft.id ? list.map((s) => (s.id === saved.id ? saved : s)) : [...list, saved]
			);
			setEditing(null);
		} catch (e) {
			fail(e);
		}
	};

	const remove = async (id: number): Promise<void> => {
		try {
			await withLoader(() => window.api.services.remove(id), 'Excluindo serviço...');
			setServices((list) => list.filter((s) => s.id !== id));
			setEditing(null);
		} catch (e) {
			fail(e);
		}
	};

	return (
		<div className="services">
			<div className="toolbar">
				<div className="toolbar__nav">
					<button className="btn" onClick={() => setWeekStart((w) => addDays(w, -7))}>
						‹
					</button>
					<button className="btn" onClick={() => setWeekStart(startOfWeek(new Date()))}>
						Hoje
					</button>
					<button className="btn" onClick={() => setWeekStart((w) => addDays(w, 7))}>
						›
					</button>
					<span className="toolbar__range">{formatWeekRange(weekStart)}</span>
				</div>

				<div className="toolbar__legend">
					{(Object.keys(PRIORITY_LABEL) as Priority[]).map((p) => (
						<span key={p} className={`legend legend--${p}`}>
							{PRIORITY_LABEL[p]}
						</span>
					))}
				</div>

				<div className="toolbar__actions">
					<button className="btn" onClick={() => setShowSettings((v) => !v)}>
						⚙ Configurar grade
					</button>
					<button className="btn btn--primary" onClick={() => openNew()}>
						+ Novo serviço
					</button>
				</div>
			</div>

			{showSettings && (
				<div className="settings">
					<label>
						Intervalo
						<select
							value={settings.slotMinutes}
							onChange={(e) =>
								updateSettings({
									...settings,
									slotMinutes: Number(e.target.value) as 30 | 60
								})
							}
						>
							<option value={60}>1 em 1 hora</option>
							<option value={30}>30 em 30 minutos</option>
						</select>
					</label>

					<label>
						Início do dia
						<select
							value={settings.dayStartHour}
							onChange={(e) =>
								updateSettings({
									...settings,
									dayStartHour: Number(e.target.value)
								})
							}
						>
							{Array.from({ length: settings.dayEndHour }, (_, h) => (
								<option key={h} value={h}>
									{String(h).padStart(2, '0')}:00
								</option>
							))}
						</select>
					</label>

					<label>
						Fim do dia
						<select
							value={settings.dayEndHour}
							onChange={(e) =>
								updateSettings({ ...settings, dayEndHour: Number(e.target.value) })
							}
						>
							{Array.from(
								{ length: 24 - settings.dayStartHour },
								(_, i) => settings.dayStartHour + 1 + i
							).map((h) => (
								<option key={h} value={h}>
									{String(h).padStart(2, '0')}:00
								</option>
							))}
						</select>
					</label>

					<div className="settings__days">
						{DAY_ORDER.map((d) => (
							<label key={d} className="check">
								<input
									type="checkbox"
									checked={settings.workDays.includes(d)}
									onChange={() => toggleDay(d)}
								/>
								{WEEKDAY_LONG[d]}
							</label>
						))}
					</div>
				</div>
			)}

			<SchedulerGrid
				weekStart={weekStart}
				settings={settings}
				services={services}
				people={people}
				onSlotClick={openNew}
				onServiceClick={setEditing}
			/>

			{editing && (
				<ServiceModal
					key={editing.id ?? 'new'}
					initial={editing}
					people={people}
					slotMinutes={settings.slotMinutes}
					onSave={save}
					onDelete={remove}
					onClose={() => setEditing(null)}
				/>
			)}
		</div>
	);
}
