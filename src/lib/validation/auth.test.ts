import { describe, expect, it } from "vitest";
import { validatePassword } from "./auth";

describe("Password Validation", () => {
  it("accepts a valid password", () => {
    expect(validatePassword("Password123")).toBeNull();
  });

  it("rejects short passwords", () => {
    expect(validatePassword("Pass1")).toBe(
      "Password must be at least 8 characters long.",
    );
  });

  it("rejects passwords without uppercase letters", () => {
    expect(validatePassword("password123")).toBe(
      "Password must contain at least one uppercase letter.",
    );
  });

  it("rejects passwords without lowercase letters", () => {
    expect(validatePassword("PASSWORD123")).toBe(
      "Password must contain at least one lowercase letter.",
    );
  });

  it("rejects passwords without numbers", () => {
    expect(validatePassword("Password")).toBe(
      "Password must contain at least one number.",
    );
  });

  describe("Development Environment", () => {
    const originalEnv = process.env.NODE_ENV;

    it("only requires length >= 1 in development", () => {
      // @ts-expect-error
      process.env.NODE_ENV = "development";

      expect(validatePassword("a")).toBeNull();
      expect(validatePassword("123")).toBeNull();
      expect(validatePassword("")).toBe("Password cannot be empty.");

      // @ts-expect-error
      process.env.NODE_ENV = originalEnv;
    });
  });
});
