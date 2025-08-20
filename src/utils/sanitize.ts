export const sanitizeEmail = (email: string) =>
  (email || '')
    .trim()
    .toLowerCase()
    .replace(/@.+$/, '')       // drop domain
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

export const sanitizeName = (v: string) =>
  (v || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
