import "reflect-metadata";
import type { DataSource } from "typeorm";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDataSource } from "../db/data-source";
import { createAlumni, createAlumnus, getAlumni } from "./AlumnusService";

vi.mock("../db/entities", () => ({
  Alumnus: class {},
  School: class {},
  Event: class {},
  JobOffering: class {},
  User: class {},
}));

vi.mock("../db/data-source", () => ({
  getDataSource: vi.fn(),
}));

describe("AlumnusService", () => {
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

  describe("getAlumni", () => {
    it("calls findAndCount with correct options", async () => {
      mockRepository.findAndCount.mockResolvedValue([[], 0]);

      await getAlumni({ fullName: "John", page: 2, limit: 5 });

      expect(mockRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ fullName: expect.anything() }),
          take: 5,
          skip: 5,
        }),
      );
    });
  });

  describe("createAlumnus", () => {
    it("creates and saves an alumnus", async () => {
      const data = { fullName: "John Doe" };
      const result = await createAlumnus(data);

      expect(mockRepository.create).toHaveBeenCalledWith(data);
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toEqual(data);
    });
  });

  describe("createAlumni", () => {
    it("creates and saves multiple alumni", async () => {
      const data = [{ fullName: "John" }, { fullName: "Jane" }];
      const result = await createAlumni(data);

      expect(mockRepository.create).toHaveBeenCalledWith(data);
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toEqual(data);
    });
  });
});
