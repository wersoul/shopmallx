import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { hashPassword, verifyPassword } from './password';
import { d1First, d1Run } from './d1';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'shopmallx-secret');
const COOKIE_NAME = 'shopmallx_token';

export async function signToken(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const c = cookies();
  const token = c.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload) return null;
  const user = await d1First<any>(
    'SELECT id, email, name, role, phone, address, createdAt FROM User WHERE id = ?',
    [payload.userId as string]
  );
  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') throw new Error('Unauthorized');
  return user;
}

export async function login(email: string, password: string) {
  const user = await d1First<any>('SELECT id, email, name, role, password FROM User WHERE email = ?', [email]);
  if (!user) return null;
  const ok = await verifyPassword(password, user.password);
  if (!ok) return null;
  const token = await signToken({ userId: user.id, role: user.role });
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7
  });
  return user;
}

export async function logout() {
  cookies().delete(COOKIE_NAME);
}

export async function register(data: { email: string; password: string; name: string; phone?: string }) {
  const exists = await d1First<any>('SELECT id FROM User WHERE email = ?', [data.email]);
  if (exists) throw new Error('Email นี้ถูกใช้งานแล้ว');
  const hash = await hashPassword(data.password);
  const id = 'u_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  await d1Run(
    'INSERT INTO User (id, email, password, name, phone, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [id, data.email, hash, data.name, data.phone || null, 'customer', new Date().toISOString(), new Date().toISOString()]
  );
  const token = await signToken({ userId: id, role: 'customer' });
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7
  });
  return { id, email: data.email, name: data.name, role: 'customer' };
}