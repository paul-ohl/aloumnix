import { type FindManyOptions, type FindOptionsWhere, ILike } from "typeorm";
import { getDataSource } from "../db/data-source";
import { School } from "../db/entities";

export interface SchoolFilters {
  name?: string;
  location?: string;
  page?: number;
  limit?: number;
}

export const getSchools = async (filters: SchoolFilters = {}) => {
  const dataSource = await getDataSource();
  const repository = dataSource.getRepository(School);

  const { name, location, page = 1, limit = 10 } = filters;
  const skip = (page - 1) * limit;

  const where: FindOptionsWhere<School> = {};

  if (name) {
    where.name = ILike(`%${name}%`);
  }

  if (location) {
    where.location = ILike(`%${location}%`);
  }

  const options: FindManyOptions<School> = {
    where,
    take: limit,
    skip: skip,
    order: { createdAt: "DESC" },
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

export const createSchool = async (data: Partial<School>) => {
  const dataSource = await getDataSource();
  const repository = dataSource.getRepository(School);
  const school = repository.create(data);
  return await repository.save(school);
};
