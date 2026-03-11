import type { FindOptionsWhere } from "typeorm";
import { getDataSource } from "../db/data-source";
import { Alumnus } from "../db/entities";

export interface AlumnusFilters {
  fullName?: string;
  mail?: string;
  search?: string;
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
    mail,
    search,
    graduationYear,
    class: className,
    schoolSector,
    professionalStatus,
    schoolId,
    page = 1,
    limit = 10,
  } = filters;
  const skip = (page - 1) * limit;

  const query = repository
    .createQueryBuilder("alumnus")
    .leftJoinAndSelect("alumnus.school", "school")
    .skip(skip)
    .take(limit)
    .orderBy("alumnus.createdAt", "DESC");

  if (schoolId) {
    query.andWhere("school.id = :schoolId", { schoolId });
  }

  if (fullName) {
    query.andWhere("alumnus.fullName ILIKE :fullName", {
      fullName: `%${fullName}%`,
    });
  }

  if (mail) {
    query.andWhere("alumnus.mail ILIKE :mail", { mail: `%${mail}%` });
  }

  if (search) {
    query.andWhere(
      "(alumnus.fullName ILIKE :search OR alumnus.mail ILIKE :search)",
      { search: `%${search}%` },
    );
  }

  if (graduationYear) {
    query.andWhere("alumnus.graduationYear = :graduationYear", {
      graduationYear,
    });
  }

  if (className) {
    query.andWhere("alumnus.class ILIKE :className", {
      className: `%${className}%`,
    });
  }

  if (schoolSector) {
    query.andWhere("alumnus.schoolSector = :schoolSector", { schoolSector });
  }

  if (professionalStatus) {
    query.andWhere("alumnus.professionalStatus ILIKE :professionalStatus", {
      professionalStatus: `%${professionalStatus}%`,
    });
  }

  const [items, total] = await query.getManyAndCount();

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export const getUniqueSchoolSectors = async (schoolId?: string) => {
  const dataSource = await getDataSource();
  const repository = dataSource.getRepository(Alumnus);

  const query = repository
    .createQueryBuilder("alumnus")
    .select("DISTINCT alumnus.schoolSector", "schoolSector")
    .where("alumnus.schoolSector IS NOT NULL")
    .orderBy("alumnus.schoolSector", "ASC");

  if (schoolId) {
    query.andWhere("alumnus.schoolId = :schoolId", { schoolId });
  }

  const result = await query.getRawMany();
  return result.map((r) => r.schoolSector) as string[];
};

export const getUniqueGraduationYears = async (schoolId?: string) => {
  const dataSource = await getDataSource();
  const repository = dataSource.getRepository(Alumnus);

  const query = repository
    .createQueryBuilder("alumnus")
    .select("DISTINCT alumnus.graduationYear", "graduationYear")
    .where("alumnus.graduationYear IS NOT NULL")
    .orderBy("alumnus.graduationYear", "DESC");

  if (schoolId) {
    query.andWhere("alumnus.schoolId = :schoolId", { schoolId });
  }

  const result = await query.getRawMany();
  return result.map((r) => Number(r.graduationYear)) as number[];
};

export const getAlumnusById = async (id: string) => {
  const dataSource = await getDataSource();
  const repository = dataSource.getRepository(Alumnus);
  return await repository.findOne({ where: { id }, relations: ["school"] });
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

export const updateAlumnus = async (
  id: string,
  data: Partial<Alumnus>,
  schoolId?: string,
) => {
  const dataSource = await getDataSource();
  const repository = dataSource.getRepository(Alumnus);
  const where: FindOptionsWhere<Alumnus> = { id };
  if (schoolId) where.school = { id: schoolId };

  const alumnus = await repository.findOne({ where, relations: ["school"] });
  if (!alumnus) return null;

  repository.merge(alumnus, data);
  return await repository.save(alumnus);
};

export const deleteAlumnus = async (id: string, schoolId?: string) => {
  const dataSource = await getDataSource();
  const repository = dataSource.getRepository(Alumnus);
  const where: FindOptionsWhere<Alumnus> = { id };
  if (schoolId) where.school = { id: schoolId };

  const alumnus = await repository.findOneBy(where);
  if (!alumnus) return false;

  const result = await repository.delete(id);
  return (result.affected ?? 0) > 0;
};
