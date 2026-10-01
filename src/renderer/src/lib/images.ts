export function imageUrl(name: string | null | undefined): string | null {
	return name ? `wb-img://local/${encodeURIComponent(name)}` : null;
}
