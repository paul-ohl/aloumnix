import "reflect-metadata";
import type { DataSource } from "typeorm";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDataSource } from "../db/data-source";
import { createSchool, getSchools } from "./SchoolService";

vi.mock("../db/entities", () => ({
  School: class {},
  Alumnus: class {},
  Event: class {},
  JobOffering: class {},
}));

vi.mock("../db/data-source", () => ({
  getDataSource: vi.fn(),
}));

describe("SchoolService", () => {
  const mockRepository = {
    findAndCount: vi.fn(),
    create: vi.fn((data) => ({ ...data, id: "1" })),
    save: vi.fn((data) => Promise.resolve(data)),
  };

  const mockDataSource = {
    getRepository: vi.fn(() => mockRepository),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getDataSource).mockResolvedValue(
      mockDataSource as unknown as DataSource,
    );
  });

  describe("getSchools", () => {
    it("calls findAndCount with default options when no filters are provided", async () => {
      // Arrange
      mockRepository.findAndCount.mockResolvedValue([[], 0]);

      // Act
      const result = await getSchools();

      // Assert
      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: {},
        take: 10,
        skip: 0,
        order: { createdAt: "DESC" },
      });
      expect(result).toEqual({
        items: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });
    });

    it("applies name and location filters using ILike", async () => {
      // Arrange
      mockRepository.findAndCount.mockResolvedValue([[], 0]);
      const filters = { name: "Harvard", location: "Cambridge" };

      // Act
      await getSchools(filters);

      // Assert
      expect(mockRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            name: expect.anything(),
            location: expect.anything(),
          },
        }),
      );
    });

    it("handles pagination correctly", async () => {
      // Arrange
      mockRepository.findAndCount.mockResolvedValue([[], 25]);
      const filters = { page: 3, limit: 5 };

      // Act
      const result = await getSchools(filters);

      // Assert
      expect(mockRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 5,
          skip: 10,
        }),
      );
      expect(result.page).toBe(3);
      expect(result.totalPages).toBe(5);
    });
  });

  describe("createSchool", () => {
    it("creates and saves a school", async () => {
      // Arrange
      const schoolData = { name: "New School", location: "New York" };

      // Act
      const result = await createSchool(schoolData);

      // Assert
      expect(mockRepository.create).toHaveBeenCalledWith(schoolData);
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining(schoolData));
    });
  });
});
