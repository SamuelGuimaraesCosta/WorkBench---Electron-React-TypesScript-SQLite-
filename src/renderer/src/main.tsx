import './styles/global.css';
import './styles/ui.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { GlobalLoader } from './components/GlobalLoader';

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<App />
		<GlobalLoader />
	</StrictMode>
);
