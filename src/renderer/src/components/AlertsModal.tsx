import { JSX, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { ToolAlert } from '../types/tools';
import './AlertsModal.css';

type Props = {
	alerts: ToolAlert[];
	onOpenTool: (toolId: number) => void;
	onClose: () => void;
};

function Group({
	title,
	items,
	onOpenTool
}: {
	title: string;
	items: ToolAlert[];
	onOpenTool: Props['onOpenTool'];
}): JSX.Element | null {
	if (items.length === 0) return null;
	return (
		<section className="alerts-group">
			<h3>
				{title} ({items.length})
			</h3>
			{items.map((a) => (
				<div key={a.id} className={`alert-item alert-item--${a.severity}`}>
					<div className="alert-item__body">
						<span className="alert-item__title">
							{a.title} · <span className="alert-item__tool">{a.toolName}</span>
						</span>
						<span className="alert-item__detail">{a.detail}</span>
						<span className="alert-item__action">👉 {a.action}</span>
					</div>
					<button className="btn" onClick={() => onOpenTool(a.toolId)}>
						Abrir
					</button>
				</div>
			))}
		</section>
	);
}

export function AlertsModal({ alerts, onOpenTool, onClose }: Props): JSX.Element {
	useEffect(() => {
		const onKey = (e: KeyboardEvent): void => {
			if (e.key === 'Escape') onClose();
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [onClose]);

	const danger = alerts.filter((a) => a.severity === 'danger');
	const warning = alerts.filter((a) => a.severity === 'warning');

	return createPortal(
		<div className="alerts-backdrop" onMouseDown={onClose}>
			<div
				className="alerts-modal"
				role="dialog"
				aria-modal="true"
				onMouseDown={(e) => e.stopPropagation()}
			>
				<h2>🔔 Alertas</h2>

				{alerts.length === 0 ? (
					<p className="alerts-empty">Tudo em dia! Nenhum alerta no momento. 🎉</p>
				) : (
					<>
						<Group title="Urgente" items={danger} onOpenTool={onOpenTool} />
						<Group title="Atenção" items={warning} onOpenTool={onOpenTool} />
					</>
				)}

				<div className="alerts-actions">
					<button className="btn" onClick={onClose}>
						Fechar
					</button>
				</div>
			</div>
		</div>,
		document.body
	);
}
