import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

export interface TokenPayload extends JWTPayload {
  userId: string;
  email: string;
  name: string;
  image?: string;
}

function getJwtSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'formify_default_dev_secret_key_change_in_prod';
  return new TextEncoder().encode(secret);
}

export async function signToken(payload: TokenPayload): Promise<string> {
  const secret = getJwtSecret();
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify<TokenPayload>(token, secret);
    return payload;
  } catch {
    return null;
  }
}
