import { describe, expect, it } from "vitest";
import { requestOtpSchema, validatePassword, verifyOtpSchema } from "./auth";

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

describe("requestOtpSchema", () => {
  it("accepts a valid email", () => {
    const result = requestOtpSchema.safeParse({ email: "user@example.com" });
    expect(result.success).toBe(true);
  });

  it("rejects a missing email", () => {
    const result = requestOtpSchema.safeParse({ email: "" });
    expect(result.success).toBe(false);
  });

  it("rejects a malformed email", () => {
    const result = requestOtpSchema.safeParse({ email: "not-an-email" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Please enter a valid email address.",
      );
    }
  });
});

describe("verifyOtpSchema", () => {
  it("accepts a valid email and 6-digit numeric code", () => {
    const result = verifyOtpSchema.safeParse({
      email: "user@example.com",
      code: "123456",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a code shorter than 6 digits", () => {
    const result = verifyOtpSchema.safeParse({
      email: "user@example.com",
      code: "123",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "The code must be exactly 6 digits.",
      );
    }
  });

  it("rejects a code longer than 6 digits", () => {
    const result = verifyOtpSchema.safeParse({
      email: "user@example.com",
      code: "1234567",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a code containing non-digit characters", () => {
    const result = verifyOtpSchema.safeParse({
      email: "user@example.com",
      code: "12345a",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "The code must contain only digits.",
      );
    }
  });

  it("rejects an invalid email even with a valid code", () => {
    const result = verifyOtpSchema.safeParse({
      email: "bad-email",
      code: "123456",
    });
    expect(result.success).toBe(false);
  });
});
