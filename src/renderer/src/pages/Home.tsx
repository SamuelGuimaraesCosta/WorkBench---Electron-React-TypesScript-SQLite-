import { Link } from 'react-router-dom';
import './Home.css';

const modules = [
	{ to: '/servicos', title: 'Serviços', desc: 'Agenda semanal de serviços e responsáveis.' },
	{ to: '/estoque', title: 'Estoque', desc: 'Materiais, quantidades e valores.' },
	{ to: '/ferramentas', title: 'Ferramentas', desc: 'Status, responsáveis e manutenção.' },
	{ to: '/funcionarios', title: 'Funcionários', desc: 'Cadastro e status da equipe.' }
];

export default function Home(): React.JSX.Element {
	return (
		<div className="home">
			<h1 className="home__title">Bem-vindo ao WorkBench</h1>
			<p className="home__subtitle">Escolha um módulo para começar.</p>

			<div className="home__cards">
				{modules.map((m) => (
					<Link key={m.to} to={m.to} className="home__card">
						<h2>{m.title}</h2>
						<p>{m.desc}</p>
					</Link>
				))}
			</div>
		</div>
	);
}
