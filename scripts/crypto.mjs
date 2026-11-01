// Shared crypto helpers (Node 20+, WebCrypto). Same formats the browser gate uses.
const subtle = globalThis.crypto.subtle;
export const ITER = 310000;
export const b64 = (u8) => Buffer.from(u8).toString('base64');
export const unb64 = (s) => new Uint8Array(Buffer.from(s, 'base64'));
export const rand = (n) => globalThis.crypto.getRandomValues(new Uint8Array(n));

export async function passKey(password, salt, iter = ITER) {
  const base = await subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
  return subtle.deriveKey({ name: 'PBKDF2', salt, iterations: iter, hash: 'SHA-256' }, base,
    { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}

export async function contentKey(rawB64) {
  const raw = unb64(rawB64);
  if (raw.length !== 32) throw new Error('CONTENT_KEY must be 32 bytes, base64-encoded');
  return subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt']);
}

// Wrap the content key with a password -> key.json
export async function wrap(password, contentKeyB64) {
  if (!password || password.length < 4) throw new Error('SITE_PASSWORD is missing or too short');
  const salt = rand(16), iv = rand(12);
  const pk = await passKey(password, salt);
  const wrapped = new Uint8Array(await subtle.encrypt({ name: 'AES-GCM', iv }, pk, unb64(contentKeyB64)));
  return { v: b64(rand(9)).replace(/[+/=]/g, ''), iter: ITER, salt: b64(salt), iv: b64(iv), wrapped: b64(wrapped) };
}

// Encrypt the full page with the content key
export async function seal(html, contentKeyB64) {
  const iv = rand(12), key = await contentKey(contentKeyB64);
  const ct = new Uint8Array(await subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(html)));
  return { iv: b64(iv), ct: b64(ct) };
}
