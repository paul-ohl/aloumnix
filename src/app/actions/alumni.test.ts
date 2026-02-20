import { revalidatePath } from "next/cache";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthService, type SessionPayload } from "@/lib/auth/service";
import type { Alumnus } from "@/lib/db/entities";
import * as AlumnusService from "@/lib/services/AlumnusService";
import { bulkCreateAlumniAction, createAlumnusAction } from "./alumni";

vi.mock("@/lib/services/AlumnusService", () => ({
  createAlumnus: vi.fn(),
  createAlumni: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/auth/service", () => ({
  AuthService: {
    getSession: vi.fn(),
  },
}));

describe("Alumni Server Actions", () => {
  const validAlumnus = {
    fullName: "John Doe",
    graduationYear: 2023,
    schoolSector: "CS",
    mail: "john@example.com",
    schoolId: "123e4567-e89b-12d3-a456-426614174000",
  };

  const mockSession: SessionPayload = {
    userId: "school-1",
    role: "school",
    email: "school@example.com",
    needsPasswordSet: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(AuthService.getSession).mockResolvedValue(mockSession);
  });

  describe("createAlumnusAction", () => {
    it("successfully creates an alumnus and revalidates path", async () => {
      vi.mocked(AlumnusService.createAlumnus).mockResolvedValue({} as Alumnus);

      const result = await createAlumnusAction(validAlumnus);

      expect(result).toEqual({ success: true });
      expect(AlumnusService.createAlumnus).toHaveBeenCalledWith(
        expect.objectContaining({
          school: { id: "school-1" },
        }),
      );
      expect(revalidatePath).toHaveBeenCalledWith("/school/dashboard");
    });

    it("returns error if not authorized", async () => {
      vi.mocked(AuthService.getSession).mockResolvedValue(null);

      const result = await createAlumnusAction(validAlumnus);

      expect(result.error).toBe("Unauthorized");
      expect(AlumnusService.createAlumnus).not.toHaveBeenCalled();
    });

    it("returns field errors on validation failure", async () => {
      const result = await createAlumnusAction({
        ...validAlumnus,
        mail: "invalid",
      });

      expect(result.error).toBe("Validation failed");
      expect(result.fieldErrors).toBeDefined();
      expect(AlumnusService.createAlumnus).not.toHaveBeenCalled();
    });

    it("handles database errors gracefully", async () => {
      vi.mocked(AlumnusService.createAlumnus).mockRejectedValue(
        new Error("DB Error"),
      );

      const result = await createAlumnusAction(validAlumnus);

      expect(result.error).toBe("Failed to create student. Please try again.");
    });
  });

  describe("bulkCreateAlumniAction", () => {
    it("successfully creates multiple alumni", async () => {
      vi.mocked(AlumnusService.createAlumni).mockResolvedValue([] as Alumnus[]);

      const result = await bulkCreateAlumniAction([
        validAlumnus,
        { ...validAlumnus, fullName: "Jane Doe", mail: "jane@example.com" },
      ]);

      expect(result.success).toBe(true);
      expect(result.count).toBe(2);
      expect(AlumnusService.createAlumni).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ school: { id: "school-1" } }),
        ]),
      );
      expect(revalidatePath).toHaveBeenCalledWith("/school/dashboard");
    });

    it("returns row-specific errors if validation fails for any row", async () => {
      const result = await bulkCreateAlumniAction([
        validAlumnus,
        { ...validAlumnus, mail: "invalid" },
      ]);

      expect(result.error).toBe("Validation failed for some rows");
      expect(result.rowErrors).toHaveLength(1);
      expect(result.rowErrors?.[0].index).toBe(2);
      expect(AlumnusService.createAlumni).not.toHaveBeenCalled();
    });

    it("handles database errors in bulk creation", async () => {
      vi.mocked(AlumnusService.createAlumni).mockRejectedValue(
        new Error("Bulk DB Error"),
      );

      const result = await bulkCreateAlumniAction([validAlumnus]);

      expect(result.error).toContain("Failed to process bulk upload");
    });
  });
});
