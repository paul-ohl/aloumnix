import { describe, expect, it } from "vitest";
import { alumnusSchema } from "./alumni";

describe("alumnusSchema", () => {
  const validData = {
    fullName: "John Doe",
    graduationYear: 2023,
    class: "A",
    schoolSector: "Computer Science",
    mail: "john@example.com",
    schoolId: "123e4567-e89b-12d3-a456-426614174000",
    linkedInProfile: "https://linkedin.com/in/johndoe",
    professionalStatus: "Software Engineer",
  };

  it("validates correct data", () => {
    const result = alumnusSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("fails on invalid email", () => {
    const result = alumnusSchema.safeParse({
      ...validData,
      mail: "not-an-email",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.mail).toContain(
        "Invalid email address",
      );
    }
  });

  it("fails on short full name", () => {
    const result = alumnusSchema.safeParse({ ...validData, fullName: "J" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.fullName).toContain(
        "Full name must be at least 2 characters",
      );
    }
  });

  it("fails on invalid graduation year", () => {
    const result = alumnusSchema.safeParse({
      ...validData,
      graduationYear: 1899,
    });
    expect(result.success).toBe(false);

    const resultFuture = alumnusSchema.safeParse({
      ...validData,
      graduationYear: 2100,
    });
    expect(resultFuture.success).toBe(false);
  });

  it("validates optional fields", () => {
    const {
      class: _,
      linkedInProfile: __,
      professionalStatus: ___,
      ...requiredOnly
    } = validData;
    const result = alumnusSchema.safeParse(requiredOnly);
    expect(result.success).toBe(true);
  });

  it("fails on invalid LinkedIn URL", () => {
    const result = alumnusSchema.safeParse({
      ...validData,
      linkedInProfile: "not-a-url",
    });
    expect(result.success).toBe(false);
  });

  it("allows empty string for LinkedIn URL", () => {
    const result = alumnusSchema.safeParse({
      ...validData,
      linkedInProfile: "",
    });
    expect(result.success).toBe(true);
  });
});
