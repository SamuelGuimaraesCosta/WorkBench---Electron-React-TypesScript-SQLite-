import { JSX } from 'react/jsx-runtime';
import { imageUrl } from '../../lib/images';

export function MaterialImage({
	image,
	className
}: {
	image: string | null;
	className?: string;
}): JSX.Element {
	const src = imageUrl(image);

	return src ? (
		<img src={src} alt="" className={className} draggable={false} />
	) : (
		<div className={`${className ?? ''} img-placeholder`} aria-hidden>
			📦
		</div>
	);
}
