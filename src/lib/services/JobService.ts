import {
  type FindManyOptions,
  type FindOptionsWhere,
  ILike,
  In,
} from "typeorm";
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

export const getJobById = async (id: string) => {
  const dataSource = await getDataSource();
  const repository = dataSource.getRepository(JobOffering);
  return await repository.findOne({ where: { id }, relations: ["school"] });
};

export const createJob = async (data: Partial<JobOffering>) => {
  const dataSource = await getDataSource();
  const repository = dataSource.getRepository(JobOffering);
  const job = repository.create(data);
  return await repository.save(job);
};

export const updateJob = async (id: string, data: Partial<JobOffering>) => {
  const dataSource = await getDataSource();
  const repository = dataSource.getRepository(JobOffering);
  // biome-ignore lint/suspicious/noExplicitAny: TypeORM update type mismatch with jsonb
  await repository.update(id, data as any);
  return await repository.findOne({ where: { id }, relations: ["school"] });
};

export const deleteJob = async (id: string) => {
  const dataSource = await getDataSource();
  const repository = dataSource.getRepository(JobOffering);
  return await repository.delete(id);
};

export const deleteJobs = async (ids: string[]) => {
  const dataSource = await getDataSource();
  const repository = dataSource.getRepository(JobOffering);
  return await repository.delete({ id: In(ids) });
};

export const getJobsByIds = async (ids: string[]) => {
  const dataSource = await getDataSource();
  const repository = dataSource.getRepository(JobOffering);
  return await repository.find({
    where: { id: In(ids) },
    relations: ["school"],
  });
};
