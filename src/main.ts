import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { applyAppSettings } from '@settings/apply-app-setting';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from '@settings/configuration';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  applyAppSettings(app);

  const configService = app.get(ConfigService<ConfigurationType, true>);
  const apiSettings = configService.get('apiSettings', { infer: true });
  const environmentSettings = configService.get('environmentSettings', {
    infer: true,
  });

  await app.listen(apiSettings.PORT, () => {
    console.log('App starting listen port: ', apiSettings.PORT);
    console.log('ENV: ', environmentSettings.getEnv());
  });
}

bootstrap();
