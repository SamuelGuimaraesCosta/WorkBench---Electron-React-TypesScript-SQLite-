import { useEffect, useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import { AlertsModal } from './AlertsModal';
import { startAlertsWatcher, useAlerts } from '../lib/alerts';
import './Header.css';

const links = [
	{ to: '/servicos', label: 'Serviços' },
	{ to: '/estoque', label: 'Estoque' },
	{ to: '/ferramentas', label: 'Ferramentas' }
];

export function Header(): React.JSX.Element {
	const alerts = useAlerts();
	const navigate = useNavigate();
	const [open, setOpen] = useState(false);

	useEffect(() => {
		startAlertsWatcher();
	}, []);

	const openTool = (id: number): void => {
		setOpen(false);
		navigate('/ferramentas', { state: { openToolId: id } });
	};

	const hasDanger = alerts.some((a) => a.severity === 'danger');

	return (
		<header className="header">
			<div className="header__left">
				<Link to="/" aria-label="Início">
					<img src={logo} alt="WorkBench" className="header__logo" draggable={false} />
				</Link>
			</div>

			<Link to="/" className="header__title">
				WorkBench
			</Link>

			<nav className="header__nav">
				{links.map((l) => (
					<NavLink
						key={l.to}
						to={l.to}
						className={({ isActive }) =>
							`header__link${isActive ? ' header__link--active' : ''}`
						}
					>
						{l.label}
					</NavLink>
				))}

				<button
					className={`header__bell${hasDanger ? ' has-danger' : ''}`}
					onClick={() => setOpen(true)}
					aria-label={`Alertas: ${alerts.length}`}
					title="Alertas"
				>
					🔔
					{alerts.length > 0 && (
						<span className="header__badge">
							{alerts.length > 99 ? '99+' : alerts.length}
						</span>
					)}
				</button>

				{open && (
					<AlertsModal
						alerts={alerts}
						onOpenTool={openTool}
						onClose={() => setOpen(false)}
					/>
				)}
			</nav>
		</header>
	);
}
