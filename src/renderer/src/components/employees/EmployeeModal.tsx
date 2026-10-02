import { useEffect, useState } from 'react';
import { EMPLOYEE_STATUS_LABEL, EMPLOYEE_STATUS_ORDER, type Employee, type EmployeeInput, type EmployeeStatus } from '../../types/employees';
import { MaterialImage } from '../inventory/MaterialImage';
import { errorMessage } from '../../lib/errors';

type Props = {
	initial: Partial<Employee>;
	onSave: (e: EmployeeInput) => void;
	onDelete: (id: number) => void;
	onClose: () => void;
};

export function EmployeeModal({ initial, onSave, onDelete, onClose }: Props): React.JSX.Element {
	const [name, setName] = useState(initial.name ?? '');
	const [photo, setPhoto] = useState<string | null>(initial.photo ?? null);
	const [role, setRole] = useState(initial.role ?? '');
	const [phone, setPhone] = useState(initial.phone ?? '');
	const [email, setEmail] = useState(initial.email ?? '');
	const [admission, setAdmission] = useState(initial.admission ?? '');
	const [status, setStatus] = useState<EmployeeStatus>(initial.status ?? 'ativo');
	const [notes, setNotes] = useState(initial.notes ?? '');
	const isNewPhoto = photo !== null && photo !== (initial.photo ?? null);
	const close = (): void => {
		if (isNewPhoto) window.api.images.discard(photo!).catch(() => {});

		onClose();
	};

	useEffect(() => {
		const onKey = (e: KeyboardEvent): void => {
			if (e.key === 'Escape') onClose();
		};

		window.addEventListener('keydown', onKey);

		return () => window.removeEventListener('keydown', onKey);
	});

	const pick = async (): Promise<void> => {
		try {
			const picked = await window.api.images.pick();

			if (!picked) return;

			if (isNewPhoto) await window.api.images.discard(photo!);

			setPhoto(picked);
		} catch (e) {
			window.alert(errorMessage(e));
		}
	};
	const clearPhoto = (): void => {
		if (isNewPhoto) window.api.images.discard(photo!).catch(() => {});

		setPhoto(null);
	};
	const emailInvalid = email !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
	const invalid = !name.trim() || emailInvalid;
	const submit = (e: React.SubmitEvent<HTMLFormElement>): void => {
		e.preventDefault();

		if (invalid) return;

		onSave({
			id: initial.id,
			name: name.trim(),
			photo,
			role: role.trim(),
			phone: phone.trim(),
			email: email.trim(),
			admission: admission || null,
			status,
			notes: notes.trim()
		});
	};

	return (
		<div className="modal-backdrop" onMouseDown={close}>
			<form className="modal" onMouseDown={(e) => e.stopPropagation()} onSubmit={submit}>
				<h2>{initial.id ? 'Editar funcionário' : 'Novo funcionário'}</h2>

				<div className="img-picker">
					<MaterialImage image={photo} className="img-picker__preview" placeholder="👤" />
					<div className="img-picker__actions">
						<button type="button" className="btn" onClick={pick}>
							{photo ? 'Trocar foto' : 'Escolher foto'}
						</button>
						{photo && (
							<button type="button" className="btn" onClick={clearPhoto}>
								Remover
							</button>
						)}
					</div>
				</div>

				<label>
					Nome
					<input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
				</label>

				<div className="modal__row">
					<label>
						Cargo
						<input value={role} onChange={(e) => setRole(e.target.value)} />
					</label>
					<label>
						Status
						<select value={status} onChange={(e) => setStatus(e.target.value as EmployeeStatus)}>
							{EMPLOYEE_STATUS_ORDER.map((s) => (
								<option key={s} value={s}>
									{EMPLOYEE_STATUS_LABEL[s]}
								</option>
							))}
						</select>
					</label>
				</div>

				<div className="modal__row">
					<label>
						Telefone
						<input value={phone} onChange={(e) => setPhone(e.target.value)} />
					</label>
					<label>
						Data de admissão
						<input type="date" value={admission} onChange={(e) => setAdmission(e.target.value)} />
					</label>
				</div>

				<label>
					E-mail
					<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
				</label>
				{emailInvalid && <p className="modal__error">E-mail inválido.</p>}

				<label>
					Observações
					<textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
				</label>

				<div className="modal__actions">
					{initial.id && (
						<button
							type="button"
							className="btn btn--danger"
							onClick={() => window.confirm('Excluir este funcionário? Serviços e ferramentas que o usam ficarão sem responsável.') && onDelete(initial.id!)}
						>
							Excluir
						</button>
					)}
					<span style={{ flex: 1 }} />
					<button type="button" className="btn" onClick={close}>
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
