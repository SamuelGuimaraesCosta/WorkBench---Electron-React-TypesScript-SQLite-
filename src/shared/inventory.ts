export interface Material {
	id: number;
	name: string;
	image: string | null; // nome do arquivo dentro de userData/images
	quantity: number; // quantidade disponível
	maxQuantity: number; // estoque máximo
	value: number; // valor unitário (R$)
	unit: string;
}

export type MaterialInput = Omit<Material, 'id'> & { id?: number };

export const UNITS = ['un', 'kg', 'g', 'm', 'cm', 'L', 'mL', 'cx', 'pç', 'rolo'];

export type StockLevel = 'low' | 'medium' | 'ok';

export function stockLevel(m: Pick<Material, 'quantity' | 'maxQuantity'>): StockLevel {
	const pct = m.maxQuantity > 0 ? m.quantity / m.maxQuantity : 0;
	if (pct <= 0.25) return 'low';
	if (pct <= 0.6) return 'medium';
	return 'ok';
}
