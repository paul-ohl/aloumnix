import { type FindManyOptions, type FindOptionsWhere, ILike } from "typeorm";
import { getDataSource } from "../db/data-source";
import { Alumnus } from "../db/entities";

export interface AlumnusFilters {
  fullName?: string;
  graduationYear?: number;
  class?: string;
  schoolSector?: string;
  professionalStatus?: string;
  schoolId?: string;
  page?: number;
  limit?: number;
}

export const getAlumni = async (filters: AlumnusFilters = {}) => {
  const dataSource = await getDataSource();
  const repository = dataSource.getRepository(Alumnus);

  const {
    fullName,
    graduationYear,
    class: className,
    schoolSector,
    professionalStatus,
    schoolId,
    page = 1,
    limit = 10,
  } = filters;
  const skip = (page - 1) * limit;

  const where: FindOptionsWhere<Alumnus> = {};

  if (fullName) where.fullName = ILike(`%${fullName}%`);
  if (graduationYear) where.graduationYear = graduationYear;
  if (className) where.class = ILike(`%${className}%`);
  if (schoolSector) where.schoolSector = ILike(`%${schoolSector}%`);
  if (professionalStatus)
    where.professionalStatus = ILike(`%${professionalStatus}%`);
  if (schoolId) where.school = { id: schoolId };

  const options: FindManyOptions<Alumnus> = {
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

export const createAlumnus = async (data: Partial<Alumnus>) => {
  const dataSource = await getDataSource();
  const repository = dataSource.getRepository(Alumnus);
  const alumnus = repository.create(data);
  return await repository.save(alumnus);
};

export const createAlumni = async (data: Partial<Alumnus>[]) => {
  const dataSource = await getDataSource();
  const repository = dataSource.getRepository(Alumnus);
  const alumni = repository.create(data);
  return await repository.save(alumni);
};
