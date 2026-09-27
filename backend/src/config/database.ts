import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { User } from "../entities/User";
import { Task } from "../entities/Task";
import { RefreshToken } from "../entities/RefreshToken";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_DATABASE || "task_manager",
  // synchronize:true auto-creates tables from entities. Fine for dev/assignment use;
  // in a real production app you'd use migrations instead.
  synchronize: true,
  logging: false,
  entities: [User, Task, RefreshToken],
});
