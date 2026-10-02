import { JSX, useEffect, useState } from 'react';
import {
	STATUS_LABEL,
	STATUS_ORDER,
	type Tool,
	type ToolInput,
	type ToolStatus
} from '../../types/tools';
import type { Person } from '../../types/scheduler';
import { MaterialImage } from '../inventory/MaterialImage';
import { errorMessage } from '../../lib/errors';

type Props = {
	initial: Partial<Tool>;
	people: Person[];
	onSave: (t: ToolInput) => void;
	onDelete: (id: number) => void;
	onClose: () => void;
};

export function ToolModal({ initial, people, onSave, onDelete, onClose }: Props): JSX.Element {
	const [name, setName] = useState(initial.name ?? '');
	const [image, setImage] = useState<string | null>(initial.image ?? null);
	const [status, setStatus] = useState<ToolStatus>(initial.status ?? 'disponivel');
	const [quantity, setQuantity] = useState(String(initial.quantity ?? 1));
	const [personId, setPersonId] = useState<number | null>(initial.personId ?? null);
	const [value, setValue] = useState(String(initial.value ?? ''));
	const [nextMaintenance, setNextMaintenance] = useState(initial.nextMaintenance ?? '');
	const [disposeBy, setDisposeBy] = useState(initial.disposeBy ?? '');
	// imagem escolhida nesta sessão e ainda não salva: precisa ser descartada se o usuário desistir
	const isNewImage = image !== null && image !== (initial.image ?? null);
	const close = (): void => {
		if (isNewImage) window.api.images.discard(image!).catch(() => {});
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

			if (isNewImage) await window.api.images.discard(image!);

			setImage(picked);
		} catch (e) {
			window.alert(errorMessage(e));
		}
	};
	const clearImage = (): void => {
		if (isNewImage) window.api.images.discard(image!).catch(() => {});

		setImage(null);
	};
	const q = Number(quantity);
	const val = Number(value || 0);
	const invalid = !name.trim() || !Number.isInteger(q) || q < 1 || !(val >= 0);
	const submit = (e: React.SubmitEvent<HTMLFormElement>): void => {
		e.preventDefault();

		if (invalid) return;

		onSave({
			id: initial.id,
			name: name.trim(),
			image,
			status,
			quantity: q,
			personId,
			value: val,
			nextMaintenance: nextMaintenance || null,
			disposeBy: disposeBy || null
		});
	};

	return (
		<div className="modal-backdrop" onMouseDown={close}>
			<form className="modal" onMouseDown={(e) => e.stopPropagation()} onSubmit={submit}>
				<h2>{initial.id ? 'Editar ferramenta' : 'Nova ferramenta'}</h2>

				<div className="img-picker">
					<MaterialImage image={image} className="img-picker__preview" placeholder="🔧" />
					<div className="img-picker__actions">
						<button type="button" className="btn" onClick={pick}>
							{image ? 'Trocar imagem' : 'Escolher imagem'}
						</button>
						{image && (
							<button type="button" className="btn" onClick={clearImage}>
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
						Status
						<select
							value={status}
							onChange={(e) => setStatus(e.target.value as ToolStatus)}
						>
							{STATUS_ORDER.map((s) => (
								<option key={s} value={s}>
									{STATUS_LABEL[s]}
								</option>
							))}
						</select>
					</label>
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
				</div>

				<div className="modal__row">
					<label>
						Quantidade
						<input
							type="number"
							min="1"
							step="1"
							value={quantity}
							onChange={(e) => setQuantity(e.target.value)}
						/>
					</label>
					<label>
						Valor unitário (R$)
						<input
							type="number"
							min="0"
							step="0.01"
							value={value}
							onChange={(e) => setValue(e.target.value)}
						/>
					</label>
				</div>

				<div className="modal__row">
					<label>
						Próxima manutenção
						<input
							type="date"
							value={nextMaintenance}
							onChange={(e) => setNextMaintenance(e.target.value)}
						/>
					</label>
					<label>
						Descarte previsto
						<input
							type="date"
							value={disposeBy}
							onChange={(e) => setDisposeBy(e.target.value)}
						/>
					</label>
				</div>
				<p className="modal__hint">
					As datas são opcionais. Com elas, o sino avisa quando estiverem chegando ou
					vencidas.
				</p>

				<div className="modal__actions">
					{initial.id && (
						<button
							type="button"
							className="btn btn--danger"
							onClick={() =>
								window.confirm('Excluir esta ferramenta?') && onDelete(initial.id!)
							}
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
