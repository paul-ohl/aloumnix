import {
  type FindManyOptions,
  type FindOptionsWhere,
  ILike,
  MoreThanOrEqual,
} from "typeorm";
import { getDataSource } from "../db/data-source";
import { Event } from "../db/entities";

export interface EventFilters {
  name?: string;
  location?: string;
  schoolId?: string;
  fromDate?: Date;
  page?: number;
  limit?: number;
}

export const getEvents = async (filters: EventFilters = {}) => {
  const dataSource = await getDataSource();
  const repository = dataSource.getRepository(Event);

  const { name, location, schoolId, fromDate, page = 1, limit = 10 } = filters;
  const skip = (page - 1) * limit;

  const where: FindOptionsWhere<Event> = {};

  if (name) where.name = ILike(`%${name}%`);
  if (location) where.location = ILike(`%${location}%`);
  if (schoolId) where.school = { id: schoolId };
  if (fromDate) where.datetime = MoreThanOrEqual(fromDate);

  const options: FindManyOptions<Event> = {
    where,
    relations: ["school"],
    take: limit,
    skip: skip,
    order: { datetime: "ASC" },
  };

  const [items, total] = await repository.findAndCount(options);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export const createEvent = async (data: Partial<Event>) => {
  const dataSource = await getDataSource();
  const repository = dataSource.getRepository(Event);
  const event = repository.create(data);
  return await repository.save(event);
};
