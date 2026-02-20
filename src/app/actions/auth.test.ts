import "reflect-metadata";
import { redirect } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthService, type SessionPayload } from "@/lib/auth/service";
import { getDataSource } from "@/lib/db/data-source";
import {
  loginAlumniAction,
  loginSchoolAction,
  logoutAction,
  setPasswordAction,
} from "./auth";

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

vi.mock("@/lib/auth/service", () => ({
  AuthService: {
    verifyPassword: vi.fn(),
    createSession: vi.fn(),
    getSession: vi.fn(),
    hashPassword: vi.fn(),
    logout: vi.fn(),
  },
}));

vi.mock("@/lib/db/data-source", () => ({
  getDataSource: vi.fn(),
}));

vi.mock("@/lib/db/entities", () => ({
  Alumnus: class {
    id = "alumnus-id";
    mail = "alumnus@example.com";
    password = "hashed-password";
    isPasswordSet = true;
  },
  School: class {
    id = "school-id";
    name = "Test School";
    password = "hashed-password";
    isPasswordSet = true;
  },
}));

describe("Auth Server Actions", () => {
  const mockRepository = {
    findOne: vi.fn(),
    update: vi.fn(),
  };

  const mockDataSource = {
    getRepository: vi.fn(() => mockRepository),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // biome-ignore lint/suspicious/noExplicitAny: Mocking DataSource is complex
    vi.mocked(getDataSource).mockResolvedValue(mockDataSource as any);
  });

  describe("loginSchoolAction", () => {
    it("returns error if schoolId is missing", async () => {
      // Arrange
      const formData = new FormData();

      // Act
      const result = await loginSchoolAction(undefined, formData);

      // Assert
      expect(result?.error).toBe("Please select a school.");
    });

    it("returns error if school is not found", async () => {
      // Arrange
      const formData = new FormData();
      formData.append("schoolId", "unknown");
      mockRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await loginSchoolAction(undefined, formData);

      // Assert
      expect(result?.error).toBe("School not found.");
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: "unknown" },
      });
    });

    it("returns error if password is required but not provided", async () => {
      // Arrange
      const formData = new FormData();
      formData.append("schoolId", "school-id");
      mockRepository.findOne.mockResolvedValue({
        id: "school-id",
        isPasswordSet: true,
        password: "hashed-password",
      });

      // Act
      const result = await loginSchoolAction(undefined, formData);

      // Assert
      expect(result?.error).toBe("Please enter your password.");
    });

    it("returns error if invalid password is provided", async () => {
      // Arrange
      const formData = new FormData();
      formData.append("schoolId", "school-id");
      formData.append("password", "wrong-password");
      mockRepository.findOne.mockResolvedValue({
        id: "school-id",
        isPasswordSet: true,
        password: "hashed-password",
      });
      vi.mocked(AuthService.verifyPassword).mockResolvedValue(false);

      // Act
      const result = await loginSchoolAction(undefined, formData);

      // Assert
      expect(result?.error).toBe("Invalid password.");
    });

    it("returns error on first login if password is provided", async () => {
      // Arrange
      const formData = new FormData();
      formData.append("schoolId", "school-id");
      formData.append("password", "any-password");
      mockRepository.findOne.mockResolvedValue({
        id: "school-id",
        isPasswordSet: false,
      });

      // Act
      const result = await loginSchoolAction(undefined, formData);

      // Assert
      expect(result?.error).toBe(
        "First login must be without password. Please leave it empty.",
      );
    });

    it("successfully logs in and redirects on happy path", async () => {
      // Arrange
      const formData = new FormData();
      formData.append("schoolId", "school-id");
      formData.append("password", "correct-password");
      const mockSchool = {
        id: "school-id",
        isPasswordSet: true,
        password: "hashed-password",
      };
      mockRepository.findOne.mockResolvedValue(mockSchool);
      vi.mocked(AuthService.verifyPassword).mockResolvedValue(true);
      vi.mocked(AuthService.createSession).mockResolvedValue({
        needsPasswordSet: false,
      } as unknown as SessionPayload);
      vi.mocked(redirect).mockImplementation(() => {
        throw new Error("NEXT_REDIRECT");
      });

      // Act & Assert
      await expect(loginSchoolAction(undefined, formData)).rejects.toThrow(
        "NEXT_REDIRECT",
      );
      expect(AuthService.createSession).toHaveBeenCalledWith(
        mockSchool,
        "school",
      );
      expect(redirect).toHaveBeenCalledWith("/school/dashboard");
    });

    it("redirects to /set-password on first login happy path", async () => {
      // Arrange
      const formData = new FormData();
      formData.append("schoolId", "school-id");
      const mockSchool = {
        id: "school-id",
        isPasswordSet: false,
      };
      mockRepository.findOne.mockResolvedValue(mockSchool);
      vi.mocked(AuthService.createSession).mockResolvedValue({
        needsPasswordSet: true,
      } as unknown as SessionPayload);
      vi.mocked(redirect).mockImplementation(() => {
        throw new Error("NEXT_REDIRECT");
      });

      // Act & Assert
      await expect(loginSchoolAction(undefined, formData)).rejects.toThrow(
        "NEXT_REDIRECT",
      );
      expect(redirect).toHaveBeenCalledWith("/set-password");
    });

    it("handles unexpected errors", async () => {
      // Arrange
      const formData = new FormData();
      formData.append("schoolId", "school-id");
      mockRepository.findOne.mockRejectedValue(
        new Error("Database connection failed"),
      );

      // Act
      const result = await loginSchoolAction(undefined, formData);

      // Assert
      expect(result?.error).toBe(
        "An unexpected error occurred. Please try again.",
      );
    });
  });

  describe("loginAlumniAction", () => {
    it("returns error if email is missing", async () => {
      // Arrange
      const formData = new FormData();

      // Act
      const result = await loginAlumniAction(undefined, formData);

      // Assert
      expect(result?.error).toBe("Please enter your email.");
    });

    it("returns error if alumnus is not found", async () => {
      // Arrange
      const formData = new FormData();
      formData.append("email", "unknown@example.com");
      mockRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await loginAlumniAction(undefined, formData);

      // Assert
      expect(result?.error).toBe("Invalid email or password.");
    });

    it("successfully logs in and redirects on happy path", async () => {
      // Arrange
      const formData = new FormData();
      formData.append("email", "alumnus@example.com");
      formData.append("password", "correct-password");
      const mockAlumnus = {
        id: "alumnus-id",
        mail: "alumnus@example.com",
        isPasswordSet: true,
        password: "hashed-password",
      };
      mockRepository.findOne.mockResolvedValue(mockAlumnus);
      vi.mocked(AuthService.verifyPassword).mockResolvedValue(true);
      vi.mocked(AuthService.createSession).mockResolvedValue({
        needsPasswordSet: false,
      } as unknown as SessionPayload);
      vi.mocked(redirect).mockImplementation(() => {
        throw new Error("NEXT_REDIRECT");
      });

      // Act & Assert
      await expect(loginAlumniAction(undefined, formData)).rejects.toThrow(
        "NEXT_REDIRECT",
      );
      expect(AuthService.createSession).toHaveBeenCalledWith(
        mockAlumnus,
        "alumnus",
      );
      expect(redirect).toHaveBeenCalledWith("/alumni/dashboard");
    });
  });

  describe("setPasswordAction", () => {
    it("returns error if password is too short", async () => {
      // Arrange
      const formData = new FormData();
      formData.append("password", "short");
      formData.append("confirmPassword", "short");

      // Act
      const result = await setPasswordAction(undefined, formData);

      // Assert
      expect(result?.error).toBe(
        "Password must be at least 8 characters long.",
      );
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it("returns error if passwords do not match", async () => {
      // Arrange
      const formData = new FormData();
      formData.append("password", "Password123");
      formData.append("confirmPassword", "Different123");

      // Act
      const result = await setPasswordAction(undefined, formData);

      // Assert
      expect(result?.error).toBe("Passwords do not match.");
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it("redirects to login if no session is found", async () => {
      // Arrange
      const formData = new FormData();
      formData.append("password", "Password123");
      formData.append("confirmPassword", "Password123");
      vi.mocked(AuthService.getSession).mockResolvedValue(null);
      vi.mocked(redirect).mockImplementation(() => {
        throw new Error("NEXT_REDIRECT");
      });

      // Act & Assert
      await expect(setPasswordAction(undefined, formData)).rejects.toThrow(
        "NEXT_REDIRECT",
      );
      expect(redirect).toHaveBeenCalledWith("/login/alumni");
    });

    it("successfully sets password for school and redirects", async () => {
      // Arrange
      const formData = new FormData();
      formData.append("password", "Password123");
      formData.append("confirmPassword", "Password123");
      vi.mocked(AuthService.getSession).mockResolvedValue({
        userId: "school-id",
        role: "school",
      } as unknown as SessionPayload);
      vi.mocked(AuthService.hashPassword).mockResolvedValue(
        "hashed-new-password",
      );
      mockRepository.findOne.mockResolvedValue({ id: "school-id" });
      vi.mocked(redirect).mockImplementation(() => {
        throw new Error("NEXT_REDIRECT");
      });

      // Act & Assert
      await expect(setPasswordAction(undefined, formData)).rejects.toThrow(
        "NEXT_REDIRECT",
      );
      expect(mockRepository.update).toHaveBeenCalledWith("school-id", {
        password: "hashed-new-password",
        isPasswordSet: true,
      });
      expect(AuthService.createSession).toHaveBeenCalled();
      expect(redirect).toHaveBeenCalledWith("/school/dashboard");
    });

    it("successfully sets password for alumnus and redirects", async () => {
      // Arrange
      const formData = new FormData();
      formData.append("password", "Password123");
      formData.append("confirmPassword", "Password123");
      vi.mocked(AuthService.getSession).mockResolvedValue({
        userId: "alumnus-id",
        role: "alumnus",
      } as unknown as SessionPayload);
      vi.mocked(AuthService.hashPassword).mockResolvedValue(
        "hashed-new-password",
      );
      mockRepository.findOne.mockResolvedValue({ id: "alumnus-id" });
      vi.mocked(redirect).mockImplementation(() => {
        throw new Error("NEXT_REDIRECT");
      });

      // Act & Assert
      await expect(setPasswordAction(undefined, formData)).rejects.toThrow(
        "NEXT_REDIRECT",
      );
      expect(mockRepository.update).toHaveBeenCalledWith("alumnus-id", {
        password: "hashed-new-password",
        isPasswordSet: true,
      });
      expect(redirect).toHaveBeenCalledWith("/alumni/dashboard");
    });
  });

  describe("logoutAction", () => {
    it("calls logout and redirects to login", async () => {
      // Arrange
      vi.mocked(redirect).mockImplementation(() => {
        throw new Error("NEXT_REDIRECT");
      });

      // Act & Assert
      await expect(logoutAction()).rejects.toThrow("NEXT_REDIRECT");
      expect(AuthService.logout).toHaveBeenCalled();
      expect(redirect).toHaveBeenCalledWith("/login/alumni");
    });
  });
});
