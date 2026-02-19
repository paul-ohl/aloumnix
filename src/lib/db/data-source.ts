import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entities/User";

const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432", 10),
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "aloumnix",
  synchronize: process.env.NODE_ENV === "development",
  logging: process.env.NODE_ENV === "development",
  entities: [User],
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

  dataSourcePromise = AppDataSource.initialize();
  return dataSourcePromise;
};
