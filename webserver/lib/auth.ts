import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'development-secret-key-change-this-in-prod';

export async function hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

export function signToken(payload: object): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): string | jwt.JwtPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch {
        return null;
    }
}

import { cookies } from 'next/headers';

export async function getSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) return null;

    const payload = verifyToken(token);

    // Narrowing: ensure payload is an object (JwtPayload) and not a string
    if (!payload || typeof payload === 'string' || !payload.userId) return null;

    return {
        user: {
            id: payload.userId,
            email: payload.email,
            name: payload.name
        }
    };
}
