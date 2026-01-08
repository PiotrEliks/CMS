import path from 'path';

export function normalizeFilename(originalName: string): string {
  const ext = path.extname(originalName);
  const name = path.basename(originalName, ext);

  const base = name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // diakrytyki
    .replace(/ß/g, 'ss') // DE
    .replace(/[^\p{L}\p{N}]+/gu, '-') // <-- TU: bez podwójnych backslashy
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();

  return `${base || 'file'}${ext.toLowerCase()}`;
}
