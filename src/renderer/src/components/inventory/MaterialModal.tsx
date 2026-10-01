import { JSX, useEffect, useState } from 'react';
import { UNITS, type Material, type MaterialInput } from '../../types/inventory';
import { MaterialImage } from './MaterialImage';
import { errorMessage } from '../../lib/errors';

type Props = {
	initial: Partial<Material>;
	onSave: (m: MaterialInput) => void;
	onDelete: (id: number) => void;
	onClose: () => void;
};

export function MaterialModal({ initial, onSave, onDelete, onClose }: Props): JSX.Element {
	const [name, setName] = useState(initial.name ?? '');
	const [image, setImage] = useState<string | null>(initial.image ?? null);
	const [quantity, setQuantity] = useState(String(initial.quantity ?? 0));
	const [maxQuantity, setMaxQuantity] = useState(String(initial.maxQuantity ?? ''));
	const [value, setValue] = useState(String(initial.value ?? ''));
	const [unit, setUnit] = useState(initial.unit ?? 'un');
	// imagem escolhida nesta sessão e ainda não salva: precisa ser descartada se o usuário desistir
	const isNewImage = image !== null && image !== (initial.image ?? null);
	const close = (): void => {
		if (isNewImage) window.api.materials.discardImage(image!).catch(() => {});

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
			const picked = await window.api.materials.pickImage();

			if (!picked) return;

			if (isNewImage) await window.api.materials.discardImage(image!);

			setImage(picked);
		} catch (e) {
			window.alert(errorMessage(e));
		}
	};
	const clearImage = (): void => {
		if (isNewImage) window.api.materials.discardImage(image!).catch(() => {});

		setImage(null);
	};
	const q = Number(quantity);
	const max = Number(maxQuantity);
	const val = Number(value || 0);
	const overMax = quantity !== '' && maxQuantity !== '' && q > max;
	const invalid =
		!name.trim() || quantity === '' || !(q >= 0) || !(max > 0) || overMax || !(val >= 0);

	const submit = (e: React.SubmitEvent<HTMLFormElement>): void => {
		e.preventDefault();
		if (invalid) return;
		onSave({
			id: initial.id,
			name: name.trim(),
			image,
			quantity: q,
			maxQuantity: max,
			value: val,
			unit
		});
	};

	return (
		<div className="modal-backdrop" onMouseDown={close}>
			<form className="modal" onMouseDown={(e) => e.stopPropagation()} onSubmit={submit}>
				<h2>{initial.id ? 'Editar material' : 'Novo material'}</h2>

				<div className="img-picker">
					<MaterialImage image={image} className="img-picker__preview" />
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
						Quantidade disponível
						<input
							type="number"
							min="0"
							step="any"
							value={quantity}
							onChange={(e) => setQuantity(e.target.value)}
						/>
					</label>
					<label>
						Estoque máximo
						<input
							type="number"
							min="0"
							step="any"
							value={maxQuantity}
							onChange={(e) => setMaxQuantity(e.target.value)}
						/>
					</label>
				</div>

				<div className="modal__row">
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
					<label>
						Unidade
						<select value={unit} onChange={(e) => setUnit(e.target.value)}>
							{UNITS.map((u) => (
								<option key={u} value={u}>
									{u}
								</option>
							))}
						</select>
					</label>
				</div>

				{overMax && (
					<p className="modal__error">A quantidade não pode passar do estoque máximo.</p>
				)}

				<div className="modal__actions">
					{initial.id && (
						<button
							type="button"
							className="btn btn--danger"
							onClick={() =>
								window.confirm('Excluir este material?') && onDelete(initial.id!)
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
