import { In } from "typeorm";
import { getDataSource } from "../db/data-source";
import { Event } from "../db/entities";

export interface EventFilters {
  name?: string;
  location?: string;
  schoolId?: string;
  fromDate?: Date;
  page?: number;
  limit?: number;
  currentAlumnusId?: string;
}

export const getEvents = async (filters: EventFilters = {}) => {
  const dataSource = await getDataSource();
  const repository = dataSource.getRepository(Event);

  const {
    name,
    location,
    schoolId,
    fromDate,
    page = 1,
    limit = 10,
    currentAlumnusId,
  } = filters;
  const skip = (page - 1) * limit;

  const query = repository
    .createQueryBuilder("event")
    .leftJoinAndSelect("event.school", "school")
    .loadRelationCountAndMap("event.participantCount", "event.participants")
    .skip(skip)
    .take(limit)
    .orderBy("event.datetime", "ASC");

  if (name) query.andWhere("event.name ILIKE :name", { name: `%${name}%` });
  if (location)
    query.andWhere("event.location ILIKE :location", {
      location: `%${location}%`,
    });
  if (schoolId) query.andWhere("school.id = :schoolId", { schoolId });
  if (fromDate) query.andWhere("event.datetime >= :fromDate", { fromDate });

  if (currentAlumnusId) {
    query.leftJoin(
      "event.participants",
      "currentParticipant",
      "currentParticipant.id = :alumnusId",
      { alumnusId: currentAlumnusId },
    );
    query.addSelect("currentParticipant.id", "isParticipating");
  }

  const { entities, raw } = await query.getRawAndEntities();
  const total = await query.getCount();

  return {
    items: entities.map((item, index) => {
      // Find the corresponding raw result to get the isParticipating flag
      const rawResult = raw[index];
      const isParticipating = currentAlumnusId
        ? !!rawResult.isParticipating
        : false;

      return {
        ...item,
        // @ts-expect-error - injected by loadRelationCountAndMap
        participantCount: item.participantCount || 0,
        isParticipating,
      };
    }),
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

export const getEventById = async (id: string, alumnusId?: string) => {
  const dataSource = await getDataSource();
  const repository = dataSource.getRepository(Event);

  const query = repository
    .createQueryBuilder("event")
    .leftJoinAndSelect("event.school", "school")
    .loadRelationCountAndMap("event.participantCount", "event.participants")
    .where("event.id = :id", { id });

  const event = await query.getOne();
  if (!event) return null;

  let isParticipating = false;
  if (alumnusId) {
    const count = await dataSource
      .getRepository(Event)
      .createQueryBuilder("event")
      .innerJoin("event.participants", "participant")
      .where("event.id = :id", { id })
      .andWhere("participant.id = :alumnusId", { alumnusId })
      .getCount();
    isParticipating = count > 0;
  }

  return {
    ...event,
    // @ts-expect-error
    participantCount: event.participantCount || 0,
    isParticipating,
  };
};

export const updateEvent = async (
  id: string,
  data: Partial<Omit<Event, "school">>,
) => {
  const dataSource = await getDataSource();
  const repository = dataSource.getRepository(Event);
  await repository.update(id, data);
  return await getEventById(id);
};

export const deleteEvent = async (id: string) => {
  const dataSource = await getDataSource();
  const repository = dataSource.getRepository(Event);
  await repository.delete(id);
};

export const deleteEvents = async (ids: string[]) => {
  const dataSource = await getDataSource();
  const repository = dataSource.getRepository(Event);
  await repository.delete({ id: In(ids) });
};

export const getEventsByIds = async (ids: string[]) => {
  const dataSource = await getDataSource();
  const repository = dataSource.getRepository(Event);
  return await repository.find({
    where: { id: In(ids) },
    relations: ["school"],
  });
};

export const joinEvent = async (eventId: string, alumnusId: string) => {
  const dataSource = await getDataSource();
  await dataSource
    .createQueryBuilder()
    .relation(Event, "participants")
    .of(eventId)
    .add(alumnusId);
  return true;
};

export const leaveEvent = async (eventId: string, alumnusId: string) => {
  const dataSource = await getDataSource();
  await dataSource
    .createQueryBuilder()
    .relation(Event, "participants")
    .of(eventId)
    .remove(alumnusId);
  return true;
};

export const isAlumnusParticipating = async (
  eventId: string,
  alumnusId: string,
) => {
  const dataSource = await getDataSource();
  const count = await dataSource
    .getRepository(Event)
    .createQueryBuilder("event")
    .innerJoin("event.participants", "participant")
    .where("event.id = :eventId", { eventId })
    .andWhere("participant.id = :alumnusId", { alumnusId })
    .getCount();
  return count > 0;
};
