import { JSX, useEffect, useMemo, useRef, useState } from 'react';
import { MaterialModal } from '../components/inventory/MaterialModal';
import { MaterialImage } from '../components/inventory/MaterialImage';
import { StockBar } from '../components/inventory/Stockbar';
import type { Material, MaterialInput } from '../types/inventory';
import { withLoader } from '../lib/loader';
import { errorMessage } from '../lib/errors';
import { brl } from '../lib/format';
import './Inventory.css';

type View = 'grid' | 'list' | 'carousel';

const VIEWS: { id: View; label: string }[] = [
	{ id: 'grid', label: '▦ Grade' },
	{ id: 'list', label: '☰ Lista' },
	{ id: 'carousel', label: '◧ Carrossel' }
];
const VIEW_KEY = 'workbench:inventory-view';

function loadView(): View {
	try {
		const v = localStorage.getItem(VIEW_KEY);

		return v === 'grid' || v === 'list' || v === 'carousel' ? v : 'grid';
	} catch {
		return 'grid';
	}
}

export default function Inventory(): JSX.Element {
	const [materials, setMaterials] = useState<Material[]>([]);
	const [loaded, setLoaded] = useState(false);
	const [view, setView] = useState<View>(loadView);
	const [search, setSearch] = useState('');
	const [editing, setEditing] = useState<Partial<Material> | null>(null);
	const trackRef = useRef<HTMLDivElement>(null);
	const fail = (e: unknown): void => window.alert(errorMessage(e));

	useEffect(() => {
		let cancelled = false;

		withLoader(async () => {
			const list = await window.api.materials.list();

			if (cancelled) return;

			setMaterials(list);
			setLoaded(true);
		}, 'Carregando estoque...').catch(fail);
		return () => {
			cancelled = true;
		};
	}, []);

	const changeView = (v: View): void => {
		setView(v);

		try {
			localStorage.setItem(VIEW_KEY, v);
		} catch {
			/* sem persistência, tudo bem */
		}
	};

	const visible = useMemo(() => {
		const term = search.trim().toLowerCase();

		return materials
			.filter((m) => m.name.toLowerCase().includes(term))
			.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
	}, [materials, search]);

	const totalValue = useMemo(
		() => materials.reduce((sum, m) => sum + m.quantity * m.value, 0),
		[materials]
	);

	const save = async (draft: MaterialInput): Promise<void> => {
		try {
			const saved = await withLoader(
				() => window.api.materials.save(draft),
				'Salvando material...'
			);

			setMaterials((list) =>
				draft.id ? list.map((m) => (m.id === saved.id ? saved : m)) : [...list, saved]
			);

			setEditing(null);
		} catch (e) {
			fail(e);
		}
	};

	const remove = async (id: number): Promise<void> => {
		try {
			await withLoader(() => window.api.materials.remove(id), 'Excluindo material...');

			setMaterials((list) => list.filter((m) => m.id !== id));

			setEditing(null);
		} catch (e) {
			fail(e);
		}
	};

	const scrollTrack = (dir: -1 | 1): void => {
		const el = trackRef.current;

		if (el) el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: 'smooth' });
	};

	return (
		<div className="inventory">
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
						className="inventory__search"
						placeholder="Buscar material..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
				</div>

				<div className="toolbar__actions">
					<span className="inventory__total">
						{materials.length} itens · Total em estoque:{' '}
						<strong>{brl(totalValue)}</strong>
					</span>
					<button className="btn btn--primary" onClick={() => setEditing({})}>
						+ Novo material
					</button>
				</div>
			</div>

			<div className="inventory__content">
				{loaded && visible.length === 0 && (
					<p className="inventory__empty">
						{materials.length === 0
							? 'Nenhum material cadastrado ainda.'
							: 'Nenhum material encontrado.'}
					</p>
				)}

				{view === 'grid' && (
					<div className="inv-grid">
						{visible.map((m) => (
							<button key={m.id} className="inv-card" onClick={() => setEditing(m)}>
								<MaterialImage image={m.image} className="inv-card__img" />
								<div className="inv-card__body">
									<strong title={m.name}>{m.name}</strong>
									<StockBar material={m} />
									<span className="inv-card__value">
										{brl(m.value)} / {m.unit}
									</span>
								</div>
							</button>
						))}
					</div>
				)}

				{view === 'list' && visible.length > 0 && (
					<div className="inv-list">
						<div className="inv-row inv-row--head">
							<span />
							<span>Material</span>
							<span>Estoque</span>
							<span>Valor unitário</span>
						</div>
						{visible.map((m) => (
							<button key={m.id} className="inv-row" onClick={() => setEditing(m)}>
								<MaterialImage image={m.image} className="inv-row__img" />
								<strong title={m.name}>{m.name}</strong>
								<StockBar material={m} />
								<span>
									{brl(m.value)} / {m.unit}
								</span>
							</button>
						))}
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
							{visible.map((m) => (
								<button
									key={m.id}
									className="inv-card inv-card--big"
									onClick={() => setEditing(m)}
								>
									<MaterialImage image={m.image} className="inv-card__img" />
									<div className="inv-card__body">
										<strong title={m.name}>{m.name}</strong>
										<StockBar material={m} />
										<span className="inv-card__value">
											{brl(m.value)} / {m.unit}
										</span>
									</div>
								</button>
							))}
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
				<MaterialModal
					key={editing.id ?? 'new'}
					initial={editing}
					onSave={save}
					onDelete={remove}
					onClose={() => setEditing(null)}
				/>
			)}
		</div>
	);
}
