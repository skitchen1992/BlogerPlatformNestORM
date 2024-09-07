import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/modules/app.module';
import { applyAppSettings } from '@settings/apply-app-setting';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from '@settings/configuration';
import { APISettings } from '@settings/api-settings';
import { EnvironmentSettings } from '@settings/env-settings';
import { HashBuilder } from '@utils/hash-builder';
import { JwtService } from '@nestjs/jwt/dist/jwt.service';
import { DataSource } from 'typeorm';
import { SharedService } from '@infrastructure/servises/shared/shared.service';

export let app: INestApplication;
export let dataSource: DataSource;
export let apiSettings: APISettings;
export let environmentSettings: EnvironmentSettings;

export const hashBuilder = new HashBuilder();
export const jwtService = new JwtService();

let sharedService: SharedService;

beforeAll(async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  sharedService = moduleFixture.get<SharedService>(SharedService);

  jest
    .spyOn(sharedService, 'sendRegisterEmail')
    .mockImplementation(async () => {
      return Promise.resolve();
    });

  jest
    .spyOn(sharedService, 'sendRecoveryPassEmail')
    .mockImplementation(async () => {
      return Promise.resolve();
    });

  app = moduleFixture.createNestApplication();
  dataSource = moduleFixture.get<DataSource>(DataSource);

  const configService = app.get(ConfigService<ConfigurationType, true>);

  apiSettings = configService.get('apiSettings', { infer: true });
  environmentSettings = configService.get('environmentSettings', {
    infer: true,
  });

  applyAppSettings(app);
  dataSource = moduleFixture.get<DataSource>(DataSource);

  await app.init();
});

beforeEach(async () => {
  const tables = ['users', 'posts', 'blogs']; // Список всех таблиц, которые нужно очистить

  for (const table of tables) {
    await dataSource.query(`TRUNCATE TABLE ${table} RESTART IDENTITY CASCADE`);
  }
});

afterAll(async () => {
  await app.close();
  console.log('Closed successfully.');
});
