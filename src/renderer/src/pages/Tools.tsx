/* eslint-disable react-hooks/set-state-in-effect */
import { JSX, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ToolModal } from '../components/tools/ToolModal';
import { StatusBadge } from '../components/tools/StatusBadge';
import { MaterialImage } from '../components/inventory/MaterialImage';
import {
	STATUS_LABEL,
	STATUS_ORDER,
	buildAlerts,
	type Tool,
	type ToolAlert,
	type ToolInput,
	type ToolStatus
} from '../types/tools';
import type { Person } from '../types/scheduler';
import { withLoader } from '../lib/loader';
import { refreshAlerts } from '../lib/alerts';
import { errorMessage } from '../lib/errors';
import { brl } from '../lib/format';
import './Tools.css';

type View = 'grid' | 'list' | 'carousel';

const VIEWS: { id: View; label: string }[] = [
	{ id: 'grid', label: '▦ Grade' },
	{ id: 'list', label: '☰ Lista' },
	{ id: 'carousel', label: '◧ Carrossel' }
];

const VIEW_KEY = 'workbench:tools-view';

function loadView(): View {
	try {
		const v = localStorage.getItem(VIEW_KEY);

		return v === 'grid' || v === 'list' || v === 'carousel' ? v : 'grid';
	} catch {
		return 'grid';
	}
}

type CardProps = {
	tool: Tool;
	person?: string;
	alerts: ToolAlert[];
	big?: boolean;
	onOpen: () => void;
};

function ToolCard({ tool: t, person, alerts, big, onOpen }: CardProps): React.JSX.Element {
	const danger = alerts.some((a) => a.severity === 'danger');

	return (
		<button
			className={`inv-card tool-card st--${t.status}${big ? ' inv-card--big' : ''}`}
			onClick={onOpen}
		>
			{alerts.length > 0 && (
				<span
					className={`tool-flag${danger ? ' tool-flag--danger' : ''}`}
					title={alerts.map((a) => a.title).join('\n')}
				>
					⚠ {alerts.length}
				</span>
			)}
			<MaterialImage image={t.image} className="inv-card__img" placeholder="🔧" />
			<div className="inv-card__body">
				<strong title={t.name}>{t.name}</strong>
				<StatusBadge status={t.status} />
				<span className="inv-card__value">
					Qtd: {t.quantity} · 👤 {person ?? 'Sem responsável'}
				</span>
				<span className="inv-card__value">{brl(t.value)}</span>
			</div>
		</button>
	);
}

export default function Tools(): React.JSX.Element {
	const [tools, setTools] = useState<Tool[]>([]);
	const [people, setPeople] = useState<Person[]>([]);
	const [loaded, setLoaded] = useState(false);
	const [view, setView] = useState<View>(loadView);
	const [search, setSearch] = useState('');
	const [statusFilter, setStatusFilter] = useState<ToolStatus | 'all'>('all');
	const [editing, setEditing] = useState<Partial<Tool> | null>(null);
	const trackRef = useRef<HTMLDivElement>(null);

	const location = useLocation();
	const navigate = useNavigate();

	const fail = (e: unknown): void => window.alert(errorMessage(e));

	useEffect(() => {
		let cancelled = false;

		withLoader(async () => {
			const [t, p] = await Promise.all([window.api.tools.list(), window.api.people.list()]);

			if (cancelled) return;

			setTools(t);

			setPeople(p);

			setLoaded(true);
		}, 'Carregando ferramentas...').catch(fail);
		return () => {
			cancelled = true;
		};
	}, []);

	// veio do sino: abre a ferramenta do alerta
	useEffect(() => {
		const id = (location.state as { openToolId?: number } | null)?.openToolId;

		if (!loaded || id == null) return;

		const tool = tools.find((t) => t.id === id);

		if (tool) setEditing(tool);

		navigate(location.pathname, { replace: true, state: null });
	}, [loaded, location.state, location.pathname, tools, navigate]);

	const changeView = (v: View): void => {
		setView(v);
		try {
			localStorage.setItem(VIEW_KEY, v);
		} catch {
			/* sem persistência, tudo bem */
		}
	};

	const peopleById = useMemo(() => new Map(people.map((p) => [p.id, p.name])), [people]);

	const alertsByTool = useMemo(() => {
		const map = new Map<number, ToolAlert[]>();
		for (const a of buildAlerts(tools)) map.set(a.toolId, [...(map.get(a.toolId) ?? []), a]);
		return map;
	}, [tools]);

	const counts = useMemo(() => {
		const c = Object.fromEntries(STATUS_ORDER.map((s) => [s, 0])) as Record<ToolStatus, number>;
		tools.forEach((t) => c[t.status]++);
		return c;
	}, [tools]);

	const visible = useMemo(() => {
		const term = search.trim().toLowerCase();
		return tools
			.filter(
				(t) =>
					(statusFilter === 'all' || t.status === statusFilter) &&
					t.name.toLowerCase().includes(term)
			)
			.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
	}, [tools, search, statusFilter]);

	const totalValue = useMemo(
		() => tools.reduce((sum, t) => sum + t.quantity * t.value, 0),
		[tools]
	);

	const save = async (draft: ToolInput): Promise<void> => {
		try {
			const saved = await withLoader(
				() => window.api.tools.save(draft),
				'Salvando ferramenta...'
			);
			setTools((list) =>
				draft.id ? list.map((t) => (t.id === saved.id ? saved : t)) : [...list, saved]
			);
			setEditing(null);
			refreshAlerts();
		} catch (e) {
			fail(e);
		}
	};

	const remove = async (id: number): Promise<void> => {
		try {
			await withLoader(() => window.api.tools.remove(id), 'Excluindo ferramenta...');
			setTools((list) => list.filter((t) => t.id !== id));
			setEditing(null);
			refreshAlerts();
		} catch (e) {
			fail(e);
		}
	};

	const scrollTrack = (dir: -1 | 1): void => {
		const el = trackRef.current;
		if (el) el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: 'smooth' });
	};

	const cardFor = (t: Tool, big?: boolean): JSX.Element => (
		<ToolCard
			key={t.id}
			tool={t}
			big={big}
			person={t.personId != null ? peopleById.get(t.personId) : undefined}
			alerts={alertsByTool.get(t.id) ?? []}
			onOpen={() => setEditing(t)}
		/>
	);

	return (
		<div className="tools">
			<div className="toolbar">
				<div className="toolbar__nav">
					<div className="segmented">
						{VIEWS.map((v) => (
							<button
								key={v.id}
								className={`segmented__item${view === v.id ? ' is-active' : ''}`}
								onClick={() => changeView(v.id)}
							>
								{v.label}
							</button>
						))}
					</div>
					<input
						type="search"
						className="tools__search"
						placeholder="Buscar ferramenta..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
				</div>

				<div className="toolbar__actions">
					<span className="tools__total">
						{tools.length} ferramentas · Valor total: <strong>{brl(totalValue)}</strong>
					</span>
					<button className="btn btn--primary" onClick={() => setEditing({})}>
						+ Nova ferramenta
					</button>
				</div>
			</div>

			<div className="chips">
				<button
					className={`chip${statusFilter === 'all' ? ' is-active' : ''}`}
					onClick={() => setStatusFilter('all')}
				>
					Todas <b>{tools.length}</b>
				</button>
				{STATUS_ORDER.map((s) => (
					<button
						key={s}
						className={`chip st--${s}${statusFilter === s ? ' is-active' : ''}`}
						onClick={() => setStatusFilter(statusFilter === s ? 'all' : s)}
					>
						<span className="dot" />
						{STATUS_LABEL[s]} <b>{counts[s]}</b>
					</button>
				))}
			</div>

			<div className="tools__content">
				{loaded && visible.length === 0 && (
					<p className="tools__empty">
						{tools.length === 0
							? 'Nenhuma ferramenta cadastrada ainda.'
							: 'Nenhuma ferramenta encontrada.'}
					</p>
				)}

				{view === 'grid' && (
					<div className="inv-grid">{visible.map((t) => cardFor(t))}</div>
				)}

				{view === 'list' && visible.length > 0 && (
					<div className="inv-list">
						<div className="inv-row inv-row--head tool-row">
							<span />
							<span>Ferramenta</span>
							<span>Status</span>
							<span>Responsável</span>
							<span>Qtd</span>
							<span>Valor unitário</span>
							<span />
						</div>
						{visible.map((t) => {
							const alerts = alertsByTool.get(t.id) ?? [];
							const person =
								t.personId != null ? peopleById.get(t.personId) : undefined;
							return (
								<button
									key={t.id}
									className={`inv-row tool-row st--${t.status}`}
									onClick={() => setEditing(t)}
								>
									<MaterialImage
										image={t.image}
										className="inv-row__img"
										placeholder="🔧"
									/>
									<strong title={t.name}>{t.name}</strong>
									<StatusBadge status={t.status} />
									<span>{person ? `👤 ${person}` : '—'}</span>
									<span>{t.quantity}</span>
									<span>{brl(t.value)}</span>
									<span
										className={`tool-flag tool-flag--inline${alerts.some((a) => a.severity === 'danger') ? ' tool-flag--danger' : ''}`}
										title={alerts.map((a) => a.title).join('\n')}
										style={{ visibility: alerts.length ? 'visible' : 'hidden' }}
									>
										⚠ {alerts.length}
									</span>
								</button>
							);
						})}
					</div>
				)}

				{view === 'carousel' && visible.length > 0 && (
					<div className="inv-carousel">
						<button
							className="inv-carousel__arrow inv-carousel__arrow--left"
							onClick={() => scrollTrack(-1)}
							aria-label="Anterior"
						>
							‹
						</button>
						<div ref={trackRef} className="inv-carousel__track">
							{visible.map((t) => cardFor(t, true))}
						</div>
						<button
							className="inv-carousel__arrow inv-carousel__arrow--right"
							onClick={() => scrollTrack(1)}
							aria-label="Próximo"
						>
							›
						</button>
					</div>
				)}
			</div>

			{editing && (
				<ToolModal
					key={editing.id ?? 'new'}
					initial={editing}
					people={people}
					onSave={save}
					onDelete={remove}
					onClose={() => setEditing(null)}
				/>
			)}
		</div>
	);
}
