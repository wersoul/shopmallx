// Edge-compatible password hashing using Web Crypto API (PBKDF2-SHA256).
// On Cloudflare Workers/Pages, bcryptjs fails because it depends on Node APIs
// and the bcrypt algorithm requires sync JS loops that are slow in V8 isolates.
// PBKDF2-SHA256 with 100k iterations is the standard alternative.

const ITERATIONS = 100_000;
const SALT_BYTES = 16;
const HASH_BITS = 256;

function toHex(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = '';
  for (const b of bytes) s += b.toString(16).padStart(2, '0');
  return s;
}

function fromHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

async function pbkdf2(password: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: salt.buffer as ArrayBuffer, iterations, hash: 'SHA-256' },
    key,
    HASH_BITS
  );
  return new Uint8Array(bits);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const derived = await pbkdf2(password, salt, ITERATIONS);
  return `pbkdf2$${ITERATIONS}$${toHex(salt)}$${toHex(derived)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  // Native PBKDF2 format only — bcryptjs is not Edge-compatible.
  // For migration of legacy hashes, re-seed the DB (see scripts/gen-pbkdf2.mjs).
  const parts = stored.split('$');
  if (parts.length !== 4 || parts[0] !== 'pbkdf2' || parts[1] !== String(ITERATIONS)) return false;
  const salt = fromHex(parts[2]);
  const expected = fromHex(parts[3]);
  const derived = await pbkdf2(password, salt, ITERATIONS);
  if (derived.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < derived.length; i++) diff |= derived[i] ^ expected[i];
  return diff === 0;
}