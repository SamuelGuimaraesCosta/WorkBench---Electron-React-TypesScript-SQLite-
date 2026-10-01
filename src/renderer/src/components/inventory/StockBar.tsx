import { stockLevel, type Material } from '../../types/inventory';
import { num } from '../../lib/format';
import { JSX } from 'react/jsx-runtime';

export function StockBar({ material: m }: { material: Material }): JSX.Element {
	const pct = Math.min(100, (m.quantity / m.maxQuantity) * 100);

	return (
		<div className="stock">
			<div className={`stock__bar stock__bar--${stockLevel(m)}`}>
				<span style={{ width: `${pct}%` }} />
			</div>
			<small>
				{num(m.quantity)} / {num(m.maxQuantity)} {m.unit}
			</small>
		</div>
	);
}
