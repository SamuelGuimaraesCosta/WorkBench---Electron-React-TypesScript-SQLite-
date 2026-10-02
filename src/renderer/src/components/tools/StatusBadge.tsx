import { JSX } from 'react/jsx-runtime';
import { STATUS_LABEL, type ToolStatus } from '../../types/tools';

export function StatusBadge({ status }: { status: ToolStatus }): JSX.Element {
	return (
		<span className={`badge st--${status}`}>
			<span className="dot" />
			{STATUS_LABEL[status]}
		</span>
	);
}
