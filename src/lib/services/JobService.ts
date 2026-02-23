import { type FindManyOptions, type FindOptionsWhere, ILike } from "typeorm";
import { getDataSource } from "../db/data-source";
import { JobOffering } from "../db/entities";

export interface JobFilters {
  name?: string;
  schoolId?: string;
  page?: number;
  limit?: number;
}

export const getJobs = async (filters: JobFilters = {}) => {
  const dataSource = await getDataSource();
  const repository = dataSource.getRepository(JobOffering);

  const { name, schoolId, page = 1, limit = 10 } = filters;
  const skip = (page - 1) * limit;

  const where: FindOptionsWhere<JobOffering> = {};

  if (name) where.name = ILike(`%${name}%`);
  if (schoolId) where.school = { id: schoolId };

  const options: FindManyOptions<JobOffering> = {
    where,
    relations: ["school"],
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

export const createJob = async (data: Partial<JobOffering>) => {
  const dataSource = await getDataSource();
  const repository = dataSource.getRepository(JobOffering);
  const job = repository.create(data);
  return await repository.save(job);
};
