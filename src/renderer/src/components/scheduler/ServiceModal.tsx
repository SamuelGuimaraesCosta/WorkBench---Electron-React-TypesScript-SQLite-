import { JSX, useEffect, useState } from 'react';
import { PRIORITY_LABEL, type Person, type Priority, type Service } from '../../types/scheduler';
import { toLocalInput } from '../../lib/dates';

import type { ServiceInput } from '../../types/scheduler';
export type ServiceDraft = ServiceInput;

type Props = {
	initial: Partial<Service>;
	people: Person[];
	slotMinutes: number;
	onSave: (s: ServiceDraft) => void;
	onDelete: (id: number) => void;
	onClose: () => void;
};

export function ServiceModal({
	initial,
	people,
	slotMinutes,
	onSave,
	onDelete,
	onClose
}: Props): JSX.Element {
	const [name, setName] = useState(initial.name ?? '');
	const [client, setClient] = useState(initial.client ?? '');
	const [personId, setPersonId] = useState<number | null>(initial.personId ?? null);
	const [priority, setPriority] = useState<Priority>(initial.priority ?? 'medio');
	const [start, setStart] = useState(initial.start ?? '');
	const [end, setEnd] = useState(initial.end ?? '');

	useEffect((): (() => void) => {
		const onKey = (e: KeyboardEvent): void => {
			if (e.key === 'Escape') onClose();
		};

		window.addEventListener('keydown', onKey);

		return () => window.removeEventListener('keydown', onKey);
	}, [onClose]);

	const handleStart = (value: string): void => {
		setStart(value);

		if (value && (!end || new Date(end) <= new Date(value))) {
			setEnd(toLocalInput(new Date(new Date(value).getTime() + slotMinutes * 60000)));
		}
	};

	const invalid =
		!name.trim() || !client.trim() || !start || !end || new Date(end) <= new Date(start);

	const submit = (e: React.SubmitEvent<HTMLFormElement>): void => {
		e.preventDefault();

		if (invalid) return;

		onSave({
			id: initial.id,
			name: name.trim(),
			client: client.trim(),
			personId,
			priority,
			start,
			end
		});
	};

	return (
		<div className="modal-backdrop" onMouseDown={onClose}>
			<form className="modal" onMouseDown={(e) => e.stopPropagation()} onSubmit={submit}>
				<h2>{initial.id ? 'Editar serviço' : 'Novo serviço'}</h2>

				<label>
					Serviço
					<input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
				</label>

				<label>
					Cliente
					<input value={client} onChange={(e) => setClient(e.target.value)} />
				</label>

				<div className="modal__row">
					<label>
						Responsável
						<select
							value={personId ?? ''}
							onChange={(e) =>
								setPersonId(e.target.value ? Number(e.target.value) : null)
							}
						>
							<option value="">Sem responsável</option>
							{people.map((p) => (
								<option key={p.id} value={p.id}>
									{p.name}
								</option>
							))}
						</select>
					</label>

					<label>
						Prioridade
						<select
							value={priority}
							onChange={(e) => setPriority(e.target.value as Priority)}
						>
							{(Object.keys(PRIORITY_LABEL) as Priority[]).map((p) => (
								<option key={p} value={p}>
									{PRIORITY_LABEL[p]}
								</option>
							))}
						</select>
					</label>
				</div>

				<div className="modal__row">
					<label>
						Início
						<input
							type="datetime-local"
							value={start}
							onChange={(e) => handleStart(e.target.value)}
						/>
					</label>
					<label>
						Fim
						<input
							type="datetime-local"
							value={end}
							onChange={(e) => setEnd(e.target.value)}
						/>
					</label>
				</div>

				{start && end && new Date(end) <= new Date(start) && (
					<p className="modal__error">O fim precisa ser depois do início.</p>
				)}

				<div className="modal__actions">
					{initial.id && (
						<button
							type="button"
							className="btn btn--danger"
							onClick={() =>
								window.confirm('Excluir este serviço?') && onDelete(initial.id!)
							}
						>
							Excluir
						</button>
					)}
					<span style={{ flex: 1 }} />
					<button type="button" className="btn" onClick={onClose}>
						Cancelar
					</button>
					<button type="submit" className="btn btn--primary" disabled={invalid}>
						Salvar
					</button>
				</div>
			</form>
		</div>
	);
}
