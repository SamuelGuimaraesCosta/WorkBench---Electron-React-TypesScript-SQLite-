import { useEffect, useMemo, useState } from 'react';
import { EmployeeModal } from '../components/employees/EmployeeModal';
import { MaterialImage } from '../components/inventory/MaterialImage';
import { EMPLOYEE_STATUS_LABEL, EMPLOYEE_STATUS_ORDER, type Employee, type EmployeeInput, type EmployeeStatus } from '../types/employees';
import { withLoader } from '../lib/loader';
import { errorMessage } from '../lib/errors';
import './Employees.css';

const fmtDate = (s: string | null): string => (s ? s.split('-').reverse().join('/') : '—');

export default function Employees(): React.JSX.Element {
	const [employees, setEmployees] = useState<Employee[]>([]);
	const [loaded, setLoaded] = useState(false);
	const [search, setSearch] = useState('');
	const [statusFilter, setStatusFilter] = useState<EmployeeStatus | 'all'>('all');
	const [editing, setEditing] = useState<Partial<Employee> | null>(null);
	const fail = (e: unknown): void => window.alert(errorMessage(e));

	useEffect(() => {
		let cancelled = false;

		withLoader(async () => {
			const list = await window.api.employees.list();

			if (cancelled) return;

			setEmployees(list);

			setLoaded(true);
		}, 'Carregando funcionários...').catch(fail);
		return () => {
			cancelled = true;
		};
	}, []);

	const counts = useMemo(() => {
		const c = Object.fromEntries(EMPLOYEE_STATUS_ORDER.map((s) => [s, 0])) as Record<EmployeeStatus, number>;

		employees.forEach((e) => c[e.status]++);

		return c;
	}, [employees]);
	const visible = useMemo(() => {
		const term = search.trim().toLowerCase();

		return employees
			.filter((e) => (statusFilter === 'all' || e.status === statusFilter) && `${e.name} ${e.role}`.toLowerCase().includes(term))
			.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
	}, [employees, search, statusFilter]);
	const save = async (draft: EmployeeInput): Promise<void> => {
		try {
			const saved = await withLoader(() => window.api.employees.save(draft), 'Salvando funcionário...');

			setEmployees((list) => (draft.id ? list.map((e) => (e.id === saved.id ? saved : e)) : [...list, saved]));

			setEditing(null);
		} catch (e) {
			fail(e);
		}
	};
	const remove = async (id: number): Promise<void> => {
		try {
			await withLoader(() => window.api.employees.remove(id), 'Excluindo funcionário...');

			setEmployees((list) => list.filter((e) => e.id !== id));

			setEditing(null);
		} catch (e) {
			fail(e);
		}
	};

	return (
		<div className="employees">
			<div className="toolbar">
				<div className="toolbar__nav">
					<input type="search" className="employees__search" placeholder="Buscar por nome ou cargo..." value={search} onChange={(e) => setSearch(e.target.value)} />
				</div>
				<div className="toolbar__actions">
					<button className="btn btn--primary" onClick={() => setEditing({})}>
						+ Novo funcionário
					</button>
				</div>
			</div>

			<div className="chips">
				<button className={`chip${statusFilter === 'all' ? ' is-active' : ''}`} onClick={() => setStatusFilter('all')}>
					Todos <b>{employees.length}</b>
				</button>
				{EMPLOYEE_STATUS_ORDER.map((s) => (
					<button key={s} className={`chip emp--${s}${statusFilter === s ? ' is-active' : ''}`} onClick={() => setStatusFilter(statusFilter === s ? 'all' : s)}>
						<span className="dot" />
						{EMPLOYEE_STATUS_LABEL[s]} <b>{counts[s]}</b>
					</button>
				))}
			</div>

			<div className="employees__content">
				{loaded && visible.length === 0 && <p className="employees__empty">{employees.length === 0 ? 'Nenhum funcionário cadastrado ainda.' : 'Nenhum funcionário encontrado.'}</p>}

				<div className="emp-grid">
					{visible.map((e) => (
						<button key={e.id} className={`emp-card emp--${e.status}`} onClick={() => setEditing(e)}>
							<MaterialImage image={e.photo} className="emp-card__photo" placeholder="👤" />
							<div className="emp-card__info">
								<strong title={e.name}>{e.name}</strong>
								<span className="emp-card__role">{e.role || 'Sem cargo'}</span>
								<span className="badge">
									<span className="dot" />
									{EMPLOYEE_STATUS_LABEL[e.status]}
								</span>
								<span className="emp-card__line">📞 {e.phone || '—'}</span>
								<span className="emp-card__line" title={e.email}>
									✉ {e.email || '—'}
								</span>
								<span className="emp-card__line">Admissão: {fmtDate(e.admission)}</span>
							</div>
						</button>
					))}
				</div>
			</div>

			{editing && <EmployeeModal key={editing.id ?? 'new'} initial={editing} onSave={save} onDelete={remove} onClose={() => setEditing(null)} />}
		</div>
	);
}
