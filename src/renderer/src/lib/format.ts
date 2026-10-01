const brlFmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const numFmt = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });

export const brl = (v: number): string => brlFmt.format(v);
export const num = (v: number): string => numFmt.format(v);
