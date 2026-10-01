import { createPortal } from 'react-dom';
import { useLoaderState } from '../lib/loader';
import gears from '../assets/gear-loader-white.gif';
import './GlobalLoader.css';

export function GlobalLoader(): React.JSX.Element | null {
	const { isLoading, message } = useLoaderState();
	if (!isLoading) return null;

	return createPortal(
		<div className="loader-overlay" role="alertdialog" aria-busy="true" aria-live="assertive">
			<div className="loader-box">
				<img src={gears} alt="" className="loader-gif" draggable={false} />
				<p className="loader-text">{message}</p>
			</div>
		</div>,
		document.body
	);
}
