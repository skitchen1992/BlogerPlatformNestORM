import { APISettings } from '@settings/api-settings';
import { EnvironmentSettings } from '@settings/env-settings';
import * as process from 'process';
import { ValidateNested, validateSync } from 'class-validator';

export type EnvironmentVariable = Record<string, string>;
export type ConfigurationType = Configuration;

export class Configuration {
  //ValidateNested для валидации вложенных параметров
  @ValidateNested()
  apiSettings: APISettings;
  @ValidateNested()
  environmentSettings: EnvironmentSettings;

  private constructor(configuration: ConfigurationType) {
    Object.assign(this, configuration);
  }

  static createConfig(envVariables: EnvironmentVariable) {
    return new this({
      apiSettings: new APISettings(envVariables),
      environmentSettings: new EnvironmentSettings(envVariables),
    });
  }
}

export function validate(envVariables: EnvironmentVariable) {
  const config = Configuration.createConfig(envVariables);
  const errors = validateSync(config, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return config;
}

export default () => {
  const envVariables = process.env as EnvironmentVariable;
  console.log(`process.env.ENV =`, envVariables.ENV);

  return Configuration.createConfig(envVariables);
};
