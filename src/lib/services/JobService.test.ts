import "reflect-metadata";
import type { DataSource } from "typeorm";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDataSource } from "../db/data-source";
import { JobOffering } from "../db/entities";
import { createJob, getJobs } from "./JobService";

vi.mock("../db/entities", () => ({
  JobOffering: class {},
  Alumnus: class {},
  School: class {},
  Event: class {},
}));

vi.mock("../db/data-source", () => ({
  getDataSource: vi.fn(),
}));

describe("JobService", () => {
  const mockRepository = {
    findAndCount: vi.fn(),
    create: vi.fn((data) => data),
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

  describe("getJobs", () => {
    it("calls findAndCount with default filters", async () => {
      mockRepository.findAndCount.mockResolvedValue([[], 0]);

      const result = await getJobs();

      expect(mockDataSource.getRepository).toHaveBeenCalledWith(JobOffering);
      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: {},
        relations: ["school"],
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

    it("applies filters correctly", async () => {
      mockRepository.findAndCount.mockResolvedValue([[], 0]);

      await getJobs({
        name: "Developer",
        schoolId: "school-123",
        page: 3,
        limit: 20,
      });

      expect(mockRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            name: expect.anything(), // ILike result
            school: { id: "school-123" },
          }),
          take: 20,
          skip: 40,
        }),
      );
    });

    it("calculates totalPages correctly", async () => {
      mockRepository.findAndCount.mockResolvedValue([[], 25]);

      const result = await getJobs({ limit: 10 });

      expect(result.totalPages).toBe(3);
    });
  });

  describe("createJob", () => {
    it("creates and saves a job offering", async () => {
      const data = {
        name: "Frontend Engineer",
        details: "Job details",
        additional_info: { salary: "100k" },
      };
      const result = await createJob(data);

      expect(mockDataSource.getRepository).toHaveBeenCalledWith(JobOffering);
      expect(mockRepository.create).toHaveBeenCalledWith(data);
      expect(mockRepository.save).toHaveBeenCalledWith(data);
      expect(result).toEqual(data);
    });
  });
});
