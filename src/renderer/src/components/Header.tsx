import { NavLink, Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import './Header.css';

const links = [
	{ to: '/servicos', label: 'Serviços' },
	{ to: '/estoque', label: 'Estoque' },
	{ to: '/ferramentas', label: 'Ferramentas' }
];

export function Header(): React.JSX.Element {
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
			</nav>
		</header>
	);
}
