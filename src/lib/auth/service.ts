import bcrypt from "bcryptjs";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import type { Alumnus, School } from "../db/entities";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "default_secret_for_development_only",
);
const SESSION_COOKIE_NAME = "aloumnix-session";

export type UserRole = "school" | "alumnus";

export interface SessionPayload {
  userId: string;
  role: UserRole;
  email: string;
  needsPasswordSet: boolean;
}

/**
 * Core authentication and session management service.
 */
export const AuthService = {
  /**
   * Hashes a password using bcrypt.
   */
  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  },

  /**
   * Verifies a password against a hash.
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  },

  /**
   * Creates a session for a user and sets the cookie.
   */
  async createSession(user: School | Alumnus, role: UserRole) {
    const payload: SessionPayload = {
      userId: user.id,
      role,
      email: role === "school" ? (user as School).name : (user as Alumnus).mail,
      needsPasswordSet: !user.isPasswordSet,
    };

    const token = await new SignJWT({ ...payload })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("2h")
      .sign(JWT_SECRET);

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return payload;
  },

  /**
   * Gets the current session from the cookie.
   */
  async getSession(): Promise<SessionPayload | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) return null;

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET, {
        algorithms: ["HS256"],
      });
      return payload as unknown as SessionPayload;
    } catch (_error) {
      return null;
    }
  },

  /**
   * Clears the session cookie.
   */
  async logout() {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
  },
};
