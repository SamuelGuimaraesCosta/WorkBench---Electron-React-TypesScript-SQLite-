import { HashRouter, Routes, Route, Outlet } from 'react-router-dom';
import { Header } from './components/Header';
import Home from './pages/Home';
import Services from './pages/Services';
import Inventory from './pages/Inventory';
import Tools from './pages/Tools';

function Layout(): React.JSX.Element {
	return (
		<>
			<Header />
			<main style={{ flex: 1, overflow: 'auto' }}>
				<Outlet />
			</main>
		</>
	);
}

export default function App(): React.JSX.Element {
	return (
		<HashRouter>
			<Routes>
				<Route element={<Layout />}>
					<Route index element={<Home />} />
					<Route path="servicos" element={<Services />} />
					<Route path="estoque" element={<Inventory />} />
					<Route path="ferramentas" element={<Tools />} />
				</Route>
			</Routes>
		</HashRouter>
	);
}
