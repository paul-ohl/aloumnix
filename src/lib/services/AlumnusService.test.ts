import "reflect-metadata";
import type { DataSource } from "typeorm";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDataSource } from "../db/data-source";
import {
  createAlumni,
  createAlumnus,
  deleteAlumnus,
  getAlumni,
  updateAlumnus,
} from "./AlumnusService";

vi.mock("../db/entities", () => ({
  Alumnus: class {},
  School: class {},
  Event: class {},
  JobOffering: class {},
}));

vi.mock("../db/data-source", () => ({
  getDataSource: vi.fn(),
}));

describe("AlumnusService", () => {
  const mockRepository = {
    findAndCount: vi.fn(),
    findOne: vi.fn(),
    findOneBy: vi.fn(),
    create: vi.fn((data) => data),
    save: vi.fn((data) => Promise.resolve(data)),
    merge: vi.fn((target, data) => Object.assign(target, data)),
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

  describe("updateAlumnus", () => {
    it("updates and saves an existing alumnus", async () => {
      const id = "uuid";
      const existing = { id, fullName: "Old Name" };
      const updateData = { fullName: "New Name" };

      mockRepository.findOne.mockResolvedValue(existing);

      const result = await updateAlumnus(id, updateData);

      expect(mockRepository.findOne).toHaveBeenCalled();
      expect(mockRepository.merge).toHaveBeenCalledWith(existing, updateData);
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result?.fullName).toBe("New Name");
    });

    it("returns null if alumnus not found", async () => {
      mockRepository.findOne.mockResolvedValue(null);
      const result = await updateAlumnus("uuid", { fullName: "New Name" });
      expect(result).toBeNull();
    });
  });

  describe("deleteAlumnus", () => {
    it("deletes an existing alumnus", async () => {
      const id = "uuid";
      mockRepository.findOneBy.mockResolvedValue({ id });
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await deleteAlumnus(id);

      expect(mockRepository.delete).toHaveBeenCalledWith(id);
      expect(result).toBe(true);
    });

    it("returns false if alumnus not found", async () => {
      mockRepository.findOneBy.mockResolvedValue(null);
      const result = await deleteAlumnus("uuid");
      expect(result).toBe(false);
    });
  });
});
