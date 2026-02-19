import "reflect-metadata";
import { DataSource } from "typeorm";
import { Alumnus, Event, JobOffering, School, User } from "./entities";

import { seedDatabase } from "./seed";

const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432", 10),
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "aloumnix",
  synchronize: process.env.NODE_ENV === "development",
  logging: process.env.NODE_ENV === "development",
  entities: [User, School, Alumnus, Event, JobOffering],
  migrations: [],
  subscribers: [],
});

let dataSourcePromise: Promise<DataSource> | null = null;

export const getDataSource = async () => {
  if (dataSourcePromise) {
    const dataSource = await dataSourcePromise;
    if (dataSource.isInitialized) {
      return dataSource;
    }
    // If it was rejected or closed, reset and try again
    dataSourcePromise = null;
  }

  dataSourcePromise = (async () => {
    const ds = await AppDataSource.initialize();
    if (process.env.NODE_ENV === "development") {
      await seedDatabase(ds);
    }
    return ds;
  })();

  return dataSourcePromise;
};
