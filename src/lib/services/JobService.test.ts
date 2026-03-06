import "reflect-metadata";
import type { DataSource } from "typeorm";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDataSource } from "../db/data-source";
import { JobOffering } from "../db/entities";
import {
  createJob,
  deleteJob,
  deleteJobs,
  getJobById,
  getJobs,
  getJobsByIds,
  updateJob,
} from "./JobService";

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
    find: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn((data) => data),
    save: vi.fn((data) => Promise.resolve(data)),
    update: vi.fn(),
    delete: vi.fn(),
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

  describe("getJobById", () => {
    it("fetches a job by ID", async () => {
      const mockJob = { id: "1", name: "Job 1" };
      mockRepository.findOne.mockResolvedValue(mockJob);

      const result = await getJobById("1");

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: "1" },
        relations: ["school"],
      });
      expect(result).toEqual(mockJob);
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

  describe("updateJob", () => {
    it("updates and returns the job", async () => {
      const id = "1";
      const data = { name: "Updated Job" };
      const updatedJob = { id, ...data };

      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValue(updatedJob);

      const result = await updateJob(id, data);

      expect(mockRepository.update).toHaveBeenCalledWith(id, data);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id },
        relations: ["school"],
      });
      expect(result).toEqual(updatedJob);
    });
  });

  describe("deleteJob", () => {
    it("deletes a job by ID", async () => {
      const id = "1";
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await deleteJob(id);

      expect(mockRepository.delete).toHaveBeenCalledWith(id);
    });
  });

  describe("deleteJobs", () => {
    it("deletes multiple jobs by IDs", async () => {
      const ids = ["1", "2"];
      mockRepository.delete.mockResolvedValue({ affected: 2 });

      await deleteJobs(ids);

      expect(mockRepository.delete).toHaveBeenCalledWith({
        id: expect.anything(), // In(ids)
      });
    });
  });

  describe("getJobsByIds", () => {
    it("fetches multiple jobs by IDs", async () => {
      const ids = ["1", "2"];
      const mockJobs = [{ id: "1" }, { id: "2" }];
      mockRepository.find.mockResolvedValue(mockJobs);

      const result = await getJobsByIds(ids);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { id: expect.anything() },
        relations: ["school"],
      });
      expect(result).toEqual(mockJobs);
    });
  });
});
