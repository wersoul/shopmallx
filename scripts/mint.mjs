// Mint a JWT for the given user id/role using the project's JWT_SECRET.
// Usage: node scripts/mint.mjs <userId> <role>
import { SignJWT } from 'jose';
const userId = process.argv[2];
const role = process.argv[3] || 'customer';
const secret = process.env.JWT_SECRET || 'shopmallx-secret';
const token = await new SignJWT({ userId, role })
  .setProtectedHeader({ alg: 'HS256' })
  .setIssuedAt()
  .setExpirationTime('30m')
  .sign(new TextEncoder().encode(secret));
console.log(token);