export type ToolStatus =
	'disponivel' | 'em_uso' | 'manutencao' | 'alugada' | 'necessita_reparo' | 'necessita_troca';

export const STATUS_LABEL: Record<ToolStatus, string> = {
	disponivel: 'Disponível',
	em_uso: 'Em uso',
	manutencao: 'Em manutenção',
	alugada: 'Alugada',
	necessita_reparo: 'Necessita reparo',
	necessita_troca: 'Necessita troca'
};

export const STATUS_ORDER = Object.keys(STATUS_LABEL) as ToolStatus[];

export interface Tool {
	id: number;
	name: string;
	image: string | null;
	status: ToolStatus;
	quantity: number;
	personId: number | null; // responsável (tabela de pessoas)
	value: number; // valor unitário (R$)
	nextMaintenance: string | null; // 'YYYY-MM-DD'
	disposeBy: string | null; // 'YYYY-MM-DD' (descarte/troca prevista)
}

export type ToolInput = Omit<Tool, 'id'> & { id?: number };

// ---------- alertas ----------
export const MAINTENANCE_WARN_DAYS = 7;
export const DISPOSE_WARN_DAYS = 30;

export type AlertKind =
	| 'reparo'
	| 'troca'
	| 'manutencao_vencida'
	| 'manutencao_proxima'
	| 'descarte_vencido'
	| 'descarte_proximo';

export interface ToolAlert {
	id: string;
	toolId: number;
	toolName: string;
	kind: AlertKind;
	severity: 'danger' | 'warning';
	title: string;
	detail: string;
	action: string; // o que fazer
}

function daysUntil(day: string, now: Date): number {
	const [y, m, d] = day.split('-').map(Number);
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	return Math.round((new Date(y, m - 1, d).getTime() - today.getTime()) / 86_400_000);
}

const fmtDay = (s: string): string => s.split('-').reverse().join('/');
const dias = (n: number): string => (n === 1 ? '1 dia' : `${n} dias`);

export function buildAlerts(tools: Tool[], now: Date = new Date()): ToolAlert[] {
	const out: ToolAlert[] = [];

	for (const t of tools) {
		const base = { toolId: t.id, toolName: t.name };

		if (t.status === 'necessita_reparo') {
			out.push({
				...base,
				id: `${t.id}:reparo`,
				kind: 'reparo',
				severity: 'danger',
				title: 'Necessita reparo',
				detail: 'O status da ferramenta está como "Necessita reparo".',
				action: 'Encaminhar para reparo e, ao enviar, mudar o status para "Em manutenção".'
			});
		}

		if (t.status === 'necessita_troca') {
			out.push({
				...base,
				id: `${t.id}:troca`,
				kind: 'troca',
				severity: 'danger',
				title: 'Necessita troca',
				detail: 'O status da ferramenta está como "Necessita troca".',
				action: 'Providenciar uma ferramenta nova e dar baixa nesta.'
			});
		}

		// se já está em manutenção, não avisa de manutenção por data
		if (t.nextMaintenance && t.status !== 'manutencao') {
			const d = daysUntil(t.nextMaintenance, now);
			if (d < 0) {
				out.push({
					...base,
					id: `${t.id}:manut`,
					kind: 'manutencao_vencida',
					severity: 'danger',
					title: 'Manutenção vencida',
					detail: `Venceu há ${dias(-d)} (${fmtDay(t.nextMaintenance)}).`,
					action: 'Realizar a manutenção o quanto antes e atualizar a próxima data.'
				});
			} else if (d <= MAINTENANCE_WARN_DAYS) {
				out.push({
					...base,
					id: `${t.id}:manut`,
					kind: 'manutencao_proxima',
					severity: 'warning',
					title: 'Manutenção próxima',
					detail:
						d === 0
							? `É hoje (${fmtDay(t.nextMaintenance)}).`
							: `Em ${dias(d)} (${fmtDay(t.nextMaintenance)}).`,
					action: 'Agendar a manutenção e deixar a ferramenta disponível para isso.'
				});
			}
		}

		if (t.disposeBy) {
			const d = daysUntil(t.disposeBy, now);
			if (d < 0) {
				out.push({
					...base,
					id: `${t.id}:desc`,
					kind: 'descarte_vencido',
					severity: 'danger',
					title: 'Descarte vencido',
					detail: `O prazo venceu há ${dias(-d)} (${fmtDay(t.disposeBy)}).`,
					action: 'Descartar a ferramenta ou reavaliar o prazo de uso.'
				});
			} else if (d <= DISPOSE_WARN_DAYS) {
				out.push({
					...base,
					id: `${t.id}:desc`,
					kind: 'descarte_proximo',
					severity: 'warning',
					title: 'Descarte próximo',
					detail:
						d === 0
							? `É hoje (${fmtDay(t.disposeBy)}).`
							: `Em ${dias(d)} (${fmtDay(t.disposeBy)}).`,
					action: 'Planejar a reposição antes do descarte.'
				});
			}
		}
	}

	return out.sort(
		(a, b) =>
			(a.severity === b.severity ? 0 : a.severity === 'danger' ? -1 : 1) ||
			a.toolName.localeCompare(b.toolName, 'pt-BR')
	);
}
