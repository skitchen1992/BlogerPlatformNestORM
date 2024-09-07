import { EnvironmentVariable } from '@settings/configuration';
import { IsEnum } from 'class-validator';

export enum EnvironmentsEnum {
  DEVELOPMENT = 'DEVELOPMENT',
  STAGING = 'STAGING',
  PRODUCTION = 'PRODUCTION',
  TESTING = 'TESTING',
}

export class EnvironmentSettings {
  constructor(private readonly envVariables: EnvironmentVariable) {}

  @IsEnum(EnvironmentsEnum)
  private env: string = this.envVariables.ENV;

  getEnv() {
    return this.env;
  }

  isProduction() {
    return this.env === 'PRODUCTION';
  }

  isStaging() {
    return this.env === 'STAGING';
  }

  isDevelopment() {
    return this.env === 'DEVELOPMENT';
  }

  isTesting() {
    return this.env === 'TESTING';
  }
}
