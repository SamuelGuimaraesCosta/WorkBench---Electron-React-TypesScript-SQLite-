import { JSX } from 'react/jsx-runtime';
import { imageUrl } from '../../lib/images';

type Props = { image: string | null; className?: string; placeholder?: string };

export function MaterialImage({ image, className, placeholder = '📦' }: Props): JSX.Element {
	const src = imageUrl(image);

	return src ? (
		<img src={src} alt="" className={className} draggable={false} />
	) : (
		<div className={`${className ?? ''} img-placeholder`} aria-hidden>
			{placeholder}
		</div>
	);
}
