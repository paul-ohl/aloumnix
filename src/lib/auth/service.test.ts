import bcrypt from "bcryptjs";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Alumnus, School } from "../db/entities";
import { AuthService } from "./service";

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

vi.mock("jose", () => ({
  SignJWT: vi.fn().mockImplementation(
    class {
      setProtectedHeader = vi.fn().mockReturnThis();
      setIssuedAt = vi.fn().mockReturnThis();
      setExpirationTime = vi.fn().mockReturnThis();
      sign = vi.fn().mockResolvedValue("mocked-token");
      // biome-ignore lint/suspicious/noExplicitAny: Mocking jose SignJWT
    } as any,
  ),
  jwtVerify: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

describe("AuthService", () => {
  const mockCookieStore = {
    set: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // biome-ignore lint/suspicious/noExplicitAny: Mocking next/headers cookies
    vi.mocked(cookies).mockResolvedValue(mockCookieStore as any);
  });

  describe("hashPassword", () => {
    it("hashes the password using bcrypt", async () => {
      // Arrange
      const password = "password123";
      const hashedPassword = "hashed-password";
      vi.mocked(bcrypt.hash).mockResolvedValue(hashedPassword as never);

      // Act
      const result = await AuthService.hashPassword(password);

      // Assert
      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
      expect(result).toBe(hashedPassword);
    });
  });

  describe("verifyPassword", () => {
    it("verifies the password using bcrypt", async () => {
      // Arrange
      const password = "password123";
      const hash = "hashed-password";
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      // Act
      const result = await AuthService.verifyPassword(password, hash);

      // Assert
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hash);
      expect(result).toBe(true);
    });
  });

  describe("createSession", () => {
    it("creates a session for a school user", async () => {
      // Arrange
      const user = {
        id: "school-id",
        name: "Test School",
        isPasswordSet: true,
      } as School;
      const role = "school";

      // Act
      const result = await AuthService.createSession(user, role);

      // Assert
      expect(SignJWT).toHaveBeenCalled();
      expect(mockCookieStore.set).toHaveBeenCalledWith(
        "aloumnix-session",
        "mocked-token",
        expect.objectContaining({
          httpOnly: true,
          path: "/",
        }),
      );
      expect(result).toEqual({
        userId: "school-id",
        role: "school",
        email: "Test School",
        needsPasswordSet: false,
      });
    });

    it("creates a session for an alumnus user", async () => {
      // Arrange
      const user = {
        id: "alumnus-id",
        mail: "alumnus@example.com",
      } as Alumnus;
      const role = "alumnus";

      // Act
      const result = await AuthService.createSession(user, role);

      // Assert
      expect(result).toEqual({
        userId: "alumnus-id",
        role: "alumnus",
        email: "alumnus@example.com",
        needsPasswordSet: false,
      });
    });
  });

  describe("getSession", () => {
    it("returns null if no token is present", async () => {
      // Arrange
      mockCookieStore.get.mockReturnValue(undefined);

      // Act
      const result = await AuthService.getSession();

      // Assert
      expect(result).toBeNull();
    });

    it("returns payload if token is valid", async () => {
      // Arrange
      const payload = { userId: "user-id", role: "school" };
      mockCookieStore.get.mockReturnValue({ value: "valid-token" });
      // biome-ignore lint/suspicious/noExplicitAny: Mocking jose jwtVerify result
      vi.mocked(jwtVerify).mockResolvedValue({ payload } as any);

      // Act
      const result = await AuthService.getSession();

      // Assert
      expect(jwtVerify).toHaveBeenCalled();
      expect(result).toEqual(payload);
    });

    it("returns null if token verification fails", async () => {
      // Arrange
      mockCookieStore.get.mockReturnValue({ value: "invalid-token" });
      vi.mocked(jwtVerify).mockRejectedValue(new Error("Invalid token"));

      // Act
      const result = await AuthService.getSession();

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("logout", () => {
    it("deletes the session cookie", async () => {
      // Act
      await AuthService.logout();

      // Assert
      expect(mockCookieStore.delete).toHaveBeenCalledWith("aloumnix-session");
    });
  });
});
