import { JSX, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { Person, SchedulerSettings, Service } from '../../types/scheduler';
import { WEEKDAY_SHORT, addDays, formatTime, sameDay } from '../../lib/dates';

type Seg = { service: Service; startMin: number; endMin: number };
type PlacedSeg = Seg & { lane: number; lanes: number };

/** Distribui serviços sobrepostos lado a lado (estilo Teams/Outlook) */
function layoutDay(items: Seg[]): PlacedSeg[] {
	const sorted = [...items].sort((a, b) => a.startMin - b.startMin || b.endMin - a.endMin);
	const result: PlacedSeg[] = [];
	let cluster: (Seg & { lane: number })[] = [];
	let laneEnds: number[] = [];
	let clusterEnd = -1;

	const flush = (): void => {
		cluster.forEach((c) => result.push({ ...c, lanes: laneEnds.length }));
		cluster = [];
		laneEnds = [];
		clusterEnd = -1;
	};

	for (const s of sorted) {
		if (cluster.length && s.startMin >= clusterEnd) flush();
		let lane = laneEnds.findIndex((end) => end <= s.startMin);
		if (lane === -1) {
			lane = laneEnds.length;
			laneEnds.push(s.endMin);
		} else {
			laneEnds[lane] = s.endMin;
		}
		cluster.push({ ...s, lane });
		clusterEnd = Math.max(clusterEnd, s.endMin);
	}
	flush();
	return result;
}

type Props = {
	weekStart: Date;
	settings: SchedulerSettings;
	services: Service[];
	people: Person[];
	onSlotClick: (date: Date) => void;
	onServiceClick: (service: Service) => void;
};

export function SchedulerGrid({
	weekStart,
	settings,
	services,
	people,
	onSlotClick,
	onServiceClick
}: Props): JSX.Element {
	const { slotMinutes, workDays, dayStartHour, dayEndHour } = settings;
	const today = new Date();
	const slotCount = ((dayEndHour - dayStartHour) * 60) / slotMinutes;

	const rootRef = useRef<HTMLDivElement>(null);
	const headRef = useRef<HTMLDivElement>(null);
	const [available, setAvailable] = useState(0);

	useLayoutEffect(() => {
		const root = rootRef.current;
		if (!root) return;

		const measure = (): void => {
			const headH = headRef.current?.offsetHeight ?? 0;
			setAvailable(Math.max(0, root.clientHeight - headH - 1));
		};

		measure();
		const ro = new ResizeObserver(measure);
		ro.observe(root);
		return () => ro.disconnect();
	}, []);

	// sem altura mínima "grande": a grade sempre cabe na tela (piso de 18px só por segurança)
	const slotHeight = Math.max(18, Math.floor(available / slotCount));
	const pxPerMin = slotHeight / slotMinutes;

	const days = useMemo(
		() =>
			Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)).filter((d) =>
				workDays.includes(d.getDay())
			),
		[weekStart, workDays]
	);

	const slots = useMemo(
		() => Array.from({ length: slotCount }, (_, i) => dayStartHour * 60 + i * slotMinutes),
		[slotCount, dayStartHour, slotMinutes]
	);

	const peopleById = useMemo(() => new Map(people.map((p) => [p.id, p.name])), [people]);

	const segmentsFor = (day: Date): PlacedSeg[] => {
		const dayBegin = new Date(
			day.getFullYear(),
			day.getMonth(),
			day.getDate(),
			dayStartHour
		).getTime();
		const dayEnd = new Date(
			day.getFullYear(),
			day.getMonth(),
			day.getDate(),
			dayEndHour
		).getTime();
		const segs: Seg[] = [];
		for (const s of services) {
			const from = Math.max(new Date(s.start).getTime(), dayBegin);
			const to = Math.min(new Date(s.end).getTime(), dayEnd);
			if (to <= from) continue; // não toca este dia (serviços de vários dias são recortados)
			segs.push({
				service: s,
				startMin: (from - dayBegin) / 60000,
				endMin: (to - dayBegin) / 60000
			});
		}
		return layoutDay(segs);
	};

	const cols = `64px repeat(${days.length}, minmax(120px, 1fr))`;
	const minWidth = 64 + days.length * 120;

	return (
		<div ref={rootRef} className="sched" style={{ ['--slot-h' as string]: `${slotHeight}px` }}>
			<div
				ref={headRef}
				className="sched__head"
				style={{ gridTemplateColumns: cols, minWidth }}
			>
				<div className="sched__corner" />
				{days.map((d) => (
					<div
						key={d.toISOString()}
						className={`sched__dayhead${sameDay(d, today) ? ' is-today' : ''}`}
					>
						<span>{WEEKDAY_SHORT[d.getDay()]}</span>
						<strong>{d.getDate()}</strong>
					</div>
				))}
			</div>

			<div className="sched__body" style={{ gridTemplateColumns: cols, minWidth }}>
				<div className="sched__times">
					{slots.map((m) => (
						<div key={m} className={`sched__time${m % 60 === 0 ? '' : ' is-half'}`}>
							{String(Math.floor(m / 60)).padStart(2, '0')}:
							{String(m % 60).padStart(2, '0')}
						</div>
					))}
				</div>

				{days.map((day) => (
					<div
						key={day.toISOString()}
						className={`sched__col${sameDay(day, today) ? ' is-today' : ''}`}
					>
						{slots.map((m) => (
							<div
								key={m}
								className={`sched__slot${m % 60 === 0 ? ' is-hour' : ''}`}
								onClick={() =>
									onSlotClick(
										new Date(
											day.getFullYear(),
											day.getMonth(),
											day.getDate(),
											Math.floor(m / 60),
											m % 60
										)
									)
								}
							/>
						))}

						{segmentsFor(day).map(({ service: s, startMin, endMin, lane, lanes }) => {
							const person =
								s.personId != null ? peopleById.get(s.personId) : undefined;
							const height = Math.max((endMin - startMin) * pxPerMin, 20);
							// xs = uma linha, sm = duas linhas, md = card completo
							const size = height < 36 ? 'xs' : height < 72 ? 'sm' : 'md';
							const time = `${formatTime(new Date(s.start))}–${formatTime(new Date(s.end))}`;

							return (
								<button
									key={`${s.id}-${startMin}`}
									type="button"
									className={`sched__event sched__event--${s.priority} sched__event--${size}`}
									style={{
										top: startMin * pxPerMin,
										height,
										left: `calc(${(lane / lanes) * 100}% + 2px)`,
										width: `calc(${100 / lanes}% - 4px)`
									}}
									title={`${s.name}\nCliente: ${s.client}\nResponsável: ${person ?? '—'}\n${time}`}
									onClick={() => onServiceClick(s)}
								>
									{size === 'xs' && (
										<>
											<strong>{s.name}</strong>
											<span className="sched__event-time">{time}</span>
										</>
									)}

									{size === 'sm' && (
										<>
											<strong>{s.name}</strong>
											<span>
												{time} · {s.client}
												{person ? ` · 👤 ${person}` : ''}
											</span>
										</>
									)}

									{size === 'md' && (
										<>
											<strong>{s.name}</strong>
											<span>{time}</span>
											<span>{s.client}</span>
											{person && <span>👤 {person}</span>}
										</>
									)}
								</button>
							);
						})}
					</div>
				))}
			</div>
		</div>
	);
}
