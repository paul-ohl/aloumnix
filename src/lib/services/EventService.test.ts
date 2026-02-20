import "reflect-metadata";
import type { DataSource } from "typeorm";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDataSource } from "../db/data-source";
import { createEvent, getEvents } from "./EventService";

vi.mock("../db/entities", () => ({
  Event: class {},
  School: class {},
}));

vi.mock("../db/data-source", () => ({
  getDataSource: vi.fn(),
}));

describe("EventService", () => {
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

  describe("getEvents", () => {
    it("calls findAndCount with default pagination when no filters are provided", async () => {
      // Arrange
      mockRepository.findAndCount.mockResolvedValue([[], 0]);

      // Act
      await getEvents();

      // Assert
      expect(mockRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
          skip: 0,
        }),
      );
    });

    it("applies name filter using ILike", async () => {
      // Arrange
      mockRepository.findAndCount.mockResolvedValue([[], 0]);

      // Act
      await getEvents({ name: "Workshop" });

      // Assert
      expect(mockRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            name: expect.anything(),
          }),
        }),
      );
    });

    it("applies location filter using ILike", async () => {
      // Arrange
      mockRepository.findAndCount.mockResolvedValue([[], 0]);

      // Act
      await getEvents({ location: "Paris" });

      // Assert
      expect(mockRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            location: expect.anything(),
          }),
        }),
      );
    });

    it("applies schoolId filter", async () => {
      // Arrange
      mockRepository.findAndCount.mockResolvedValue([[], 0]);

      // Act
      await getEvents({ schoolId: "school-123" });

      // Assert
      expect(mockRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            school: { id: "school-123" },
          }),
        }),
      );
    });

    it("applies fromDate filter using MoreThanOrEqual", async () => {
      // Arrange
      mockRepository.findAndCount.mockResolvedValue([[], 0]);
      const fromDate = new Date("2026-01-01");

      // Act
      await getEvents({ fromDate });

      // Assert
      expect(mockRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            datetime: expect.anything(),
          }),
        }),
      );
    });

    it("handles pagination correctly", async () => {
      // Arrange
      mockRepository.findAndCount.mockResolvedValue([[], 0]);

      // Act
      await getEvents({ page: 3, limit: 20 });

      // Assert
      expect(mockRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 20,
          skip: 40,
        }),
      );
    });

    it("returns correct pagination metadata", async () => {
      // Arrange
      const mockItems = [{ id: 1, name: "Event 1" }];
      mockRepository.findAndCount.mockResolvedValue([mockItems, 25]);

      // Act
      const result = await getEvents({ page: 2, limit: 10 });

      // Assert
      expect(result).toEqual({
        items: mockItems,
        total: 25,
        page: 2,
        limit: 10,
        totalPages: 3,
      });
    });
  });

  describe("createEvent", () => {
    it("creates and saves an event", async () => {
      // Arrange
      const eventData = { name: "Networking Night", location: "London" };

      // Act
      const result = await createEvent(eventData);

      // Assert
      expect(mockRepository.create).toHaveBeenCalledWith(eventData);
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toEqual(eventData);
    });
  });
});
