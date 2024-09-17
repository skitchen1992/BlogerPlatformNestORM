import { DataSource } from 'typeorm';

export default new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'password',
  database: 'postgresNew',
  migrations: ['migrations/*.ts'],
  entities: ['src/**/*.entity.ts'],
  synchronize: false,
});
