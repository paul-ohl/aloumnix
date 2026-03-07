import "reflect-metadata";
import { redirect } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthService, type SessionPayload } from "@/lib/auth/service";
import { getDataSource } from "@/lib/db/data-source";
import { EmailService } from "@/lib/services/EmailService";
import {
  loginSchoolAction,
  logoutAction,
  requestAlumniOtpAction,
  setPasswordAction,
  verifyAlumniOtpAction,
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
    fullName = "Test Alumnus";
  },
  AlumnusOtp: class {
    id = "otp-id";
    code = "123456";
    used = false;
    expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  },
  School: class {
    id = "school-id";
    name = "Test School";
    password = "hashed-password";
    isPasswordSet = true;
  },
}));

vi.mock("@/lib/services/EmailService", () => ({
  EmailService: {
    sendOtpEmail: vi.fn(),
  },
}));

describe("Auth Server Actions", () => {
  const mockAlumnusRepository = {
    findOne: vi.fn(),
    update: vi.fn(),
  };

  const mockOtpRepository = {
    findOne: vi.fn(),
    create: vi.fn((data) => ({ ...data, id: "new-otp-id" })),
    save: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };

  const mockSchoolRepository = {
    findOne: vi.fn(),
    update: vi.fn(),
  };

  const mockDataSource = {
    getRepository: vi.fn((entity) => {
      const name = (entity as { name?: string }).name ?? "";
      if (name === "AlumnusOtp") return mockOtpRepository;
      if (name === "Alumnus") return mockAlumnusRepository;
      return mockSchoolRepository;
    }),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // biome-ignore lint/suspicious/noExplicitAny: Mocking DataSource is complex
    vi.mocked(getDataSource).mockResolvedValue(mockDataSource as any);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // School Login
  // ─────────────────────────────────────────────────────────────────────────

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
      mockSchoolRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await loginSchoolAction(undefined, formData);

      // Assert
      expect(result?.error).toBe("School not found.");
    });

    it("returns error if password is required but not provided", async () => {
      // Arrange
      const formData = new FormData();
      formData.append("schoolId", "school-id");
      mockSchoolRepository.findOne.mockResolvedValue({
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
      mockSchoolRepository.findOne.mockResolvedValue({
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
      mockSchoolRepository.findOne.mockResolvedValue({
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
      mockSchoolRepository.findOne.mockResolvedValue(mockSchool);
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
      mockSchoolRepository.findOne.mockResolvedValue(mockSchool);
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
      mockSchoolRepository.findOne.mockRejectedValue(
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

  // ─────────────────────────────────────────────────────────────────────────
  // requestAlumniOtpAction
  // ─────────────────────────────────────────────────────────────────────────

  describe("requestAlumniOtpAction", () => {
    it("returns validation error for invalid email", async () => {
      // Arrange
      const formData = new FormData();
      formData.append("email", "not-an-email");

      // Act
      const result = await requestAlumniOtpAction(undefined, formData);

      // Assert
      expect(result?.error).toBeTruthy();
    });

    it("returns success without sending email if alumnus is not found", async () => {
      // Arrange
      const formData = new FormData();
      formData.append("email", "unknown@example.com");
      mockAlumnusRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await requestAlumniOtpAction(undefined, formData);

      // Assert
      expect(result?.success).toBe(true);
      expect(result?.email).toBe("unknown@example.com");
      expect(EmailService.sendOtpEmail).not.toHaveBeenCalled();
    });

    it("deletes existing unused OTPs, saves a new one and sends email", async () => {
      // Arrange
      const formData = new FormData();
      formData.append("email", "alumnus@example.com");
      const mockAlumnus = {
        id: "alumnus-id",
        mail: "alumnus@example.com",
        fullName: "Test Alumnus",
      };
      mockAlumnusRepository.findOne.mockResolvedValue(mockAlumnus);
      mockOtpRepository.save.mockResolvedValue({});
      vi.mocked(EmailService.sendOtpEmail).mockResolvedValue({} as never);

      // Act
      const result = await requestAlumniOtpAction(undefined, formData);

      // Assert
      expect(mockOtpRepository.delete).toHaveBeenCalledWith({
        alumnus: { id: "alumnus-id" },
        used: false,
      });
      expect(mockOtpRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          alumnus: mockAlumnus,
          used: false,
        }),
      );
      expect(mockOtpRepository.save).toHaveBeenCalled();
      expect(EmailService.sendOtpEmail).toHaveBeenCalledWith(
        { email: "alumnus@example.com", name: "Test Alumnus" },
        expect.stringMatching(/^\d{6}$/),
        10,
      );
      expect(result?.success).toBe(true);
      expect(result?.email).toBe("alumnus@example.com");
    });

    it("returns error when email sending fails", async () => {
      // Arrange
      const formData = new FormData();
      formData.append("email", "alumnus@example.com");
      mockAlumnusRepository.findOne.mockResolvedValue({
        id: "alumnus-id",
        mail: "alumnus@example.com",
        fullName: "Test Alumnus",
      });
      mockOtpRepository.save.mockResolvedValue({});
      vi.mocked(EmailService.sendOtpEmail).mockRejectedValue(
        new Error("Resend API error"),
      );

      // Act
      const result = await requestAlumniOtpAction(undefined, formData);

      // Assert
      expect(result?.error).toBe(
        "Failed to send login code. Please try again.",
      );
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // verifyAlumniOtpAction
  // ─────────────────────────────────────────────────────────────────────────

  describe("verifyAlumniOtpAction", () => {
    it("returns validation error if code is not 6 digits", async () => {
      // Arrange
      const formData = new FormData();
      formData.append("email", "alumnus@example.com");
      formData.append("code", "123");

      // Act
      const result = await verifyAlumniOtpAction(undefined, formData);

      // Assert
      expect(result?.error).toBeTruthy();
    });

    it("returns error if alumnus is not found", async () => {
      // Arrange
      const formData = new FormData();
      formData.append("email", "ghost@example.com");
      formData.append("code", "123456");
      mockAlumnusRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await verifyAlumniOtpAction(undefined, formData);

      // Assert
      expect(result?.error).toBe("Invalid or expired code.");
    });

    it("returns error if no matching valid OTP is found", async () => {
      // Arrange
      const formData = new FormData();
      formData.append("email", "alumnus@example.com");
      formData.append("code", "000000");
      mockAlumnusRepository.findOne.mockResolvedValue({
        id: "alumnus-id",
        mail: "alumnus@example.com",
      });
      mockOtpRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await verifyAlumniOtpAction(undefined, formData);

      // Assert
      expect(result?.error).toBe("Invalid or expired code.");
      expect(AuthService.createSession).not.toHaveBeenCalled();
    });

    it("marks an expired OTP as used and returns an error", async () => {
      // Arrange
      const formData = new FormData();
      formData.append("email", "alumnus@example.com");
      formData.append("code", "123456");
      const mockAlumnus = { id: "alumnus-id", mail: "alumnus@example.com" };
      mockAlumnusRepository.findOne.mockResolvedValue(mockAlumnus);
      mockOtpRepository.findOne.mockResolvedValue({
        id: "otp-id",
        code: "123456",
        used: false,
        // expired 1 minute ago
        expiresAt: new Date(Date.now() - 60 * 1000),
        alumnus: mockAlumnus,
      });

      // Act
      const result = await verifyAlumniOtpAction(undefined, formData);

      // Assert
      expect(mockOtpRepository.update).toHaveBeenCalledWith("otp-id", {
        used: true,
      });
      expect(result?.error).toBe("Invalid or expired code.");
      expect(AuthService.createSession).not.toHaveBeenCalled();
    });

    it("creates a session and redirects to /alumni/dashboard by default", async () => {
      // Arrange
      const formData = new FormData();
      formData.append("email", "alumnus@example.com");
      formData.append("code", "123456");
      const mockAlumnus = {
        id: "alumnus-id",
        mail: "alumnus@example.com",
      };
      mockAlumnusRepository.findOne.mockResolvedValue(mockAlumnus);
      mockOtpRepository.findOne.mockResolvedValue({
        id: "otp-id",
        code: "123456",
        used: false,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        alumnus: mockAlumnus,
      });
      vi.mocked(AuthService.createSession).mockResolvedValue({
        needsPasswordSet: false,
      } as unknown as SessionPayload);
      vi.mocked(redirect).mockImplementation(() => {
        throw new Error("NEXT_REDIRECT");
      });

      // Act & Assert
      await expect(verifyAlumniOtpAction(undefined, formData)).rejects.toThrow(
        "NEXT_REDIRECT",
      );
      expect(mockOtpRepository.update).toHaveBeenCalledWith("otp-id", {
        used: true,
      });
      expect(AuthService.createSession).toHaveBeenCalledWith(
        mockAlumnus,
        "alumnus",
      );
      expect(redirect).toHaveBeenCalledWith("/alumni/dashboard");
    });

    it("redirects to the redirect_to path when it starts with /alumni/", async () => {
      // Arrange
      const formData = new FormData();
      formData.append("email", "alumnus@example.com");
      formData.append("code", "123456");
      formData.append(
        "redirect_to",
        "/alumni/dashboard?tab=events&highlight=evt-123",
      );
      const mockAlumnus = { id: "alumnus-id", mail: "alumnus@example.com" };
      mockAlumnusRepository.findOne.mockResolvedValue(mockAlumnus);
      mockOtpRepository.findOne.mockResolvedValue({
        id: "otp-id",
        code: "123456",
        used: false,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        alumnus: mockAlumnus,
      });
      vi.mocked(AuthService.createSession).mockResolvedValue({
        needsPasswordSet: false,
      } as unknown as SessionPayload);
      vi.mocked(redirect).mockImplementation(() => {
        throw new Error("NEXT_REDIRECT");
      });

      // Act & Assert
      await expect(verifyAlumniOtpAction(undefined, formData)).rejects.toThrow(
        "NEXT_REDIRECT",
      );
      expect(redirect).toHaveBeenCalledWith(
        "/alumni/dashboard?tab=events&highlight=evt-123",
      );
    });

    it("falls back to /alumni/dashboard when redirect_to does not start with /alumni/", async () => {
      // Arrange
      const formData = new FormData();
      formData.append("email", "alumnus@example.com");
      formData.append("code", "123456");
      formData.append("redirect_to", "https://evil.example.com");
      const mockAlumnus = { id: "alumnus-id", mail: "alumnus@example.com" };
      mockAlumnusRepository.findOne.mockResolvedValue(mockAlumnus);
      mockOtpRepository.findOne.mockResolvedValue({
        id: "otp-id",
        code: "123456",
        used: false,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        alumnus: mockAlumnus,
      });
      vi.mocked(AuthService.createSession).mockResolvedValue({
        needsPasswordSet: false,
      } as unknown as SessionPayload);
      vi.mocked(redirect).mockImplementation(() => {
        throw new Error("NEXT_REDIRECT");
      });

      // Act & Assert
      await expect(verifyAlumniOtpAction(undefined, formData)).rejects.toThrow(
        "NEXT_REDIRECT",
      );
      expect(redirect).toHaveBeenCalledWith("/alumni/dashboard");
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // setPasswordAction
  // ─────────────────────────────────────────────────────────────────────────

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
      expect(mockSchoolRepository.update).not.toHaveBeenCalled();
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
      expect(mockSchoolRepository.update).not.toHaveBeenCalled();
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
      expect(redirect).toHaveBeenCalledWith("/login/school");
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
      mockSchoolRepository.findOne.mockResolvedValue({ id: "school-id" });
      vi.mocked(redirect).mockImplementation(() => {
        throw new Error("NEXT_REDIRECT");
      });

      // Act & Assert
      await expect(setPasswordAction(undefined, formData)).rejects.toThrow(
        "NEXT_REDIRECT",
      );
      expect(mockSchoolRepository.update).toHaveBeenCalledWith("school-id", {
        password: "hashed-new-password",
        isPasswordSet: true,
      });
      expect(AuthService.createSession).toHaveBeenCalled();
      expect(redirect).toHaveBeenCalledWith("/school/dashboard");
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // logoutAction
  // ─────────────────────────────────────────────────────────────────────────

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
