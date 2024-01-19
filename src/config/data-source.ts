import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../entity/User';
import { Config } from '.';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: Config.DB_HOST,
  port: Number(Config.DB_PORT),
  username: Config.DB_USERNAME,
  password: Config.DB_PASSWORD,
  database: Config.DB_NAME,
  //DON't USE THIS synchronize in production -> it makes new tables as soon you write some entities which is not suitable for production env.
  synchronize: false,
  logging: false,
  entities: [User],
  migrations: [],
  subscribers: [],
});
