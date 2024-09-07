import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from '@infrastructure/exception-filters/http-exception-filter';
import { useContainer } from 'class-validator';
import { AppModule } from '../modules/app.module';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from '@settings/configuration';
import cookieParser from 'cookie-parser';

// Префикс нашего приложения (http://site.com/api)
export const APP_PREFIX = '/api';

// Используем данную функцию в main.ts и в e2e тестах
export const applyAppSettings = (app: INestApplication) => {
  // Для внедрения зависимостей в validator constrain
  // { fallbackOnErrors: true } требуется, поскольку Nest генерирует
  //исключения когда DI не имеет необходимого класс
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.use(cookieParser());

  // Применение глобальных Interceptors
  // app.useGlobalInterceptors()

  // Применение глобальных Guards
  //  app.useGlobalGuards(new BasicAuthGuard());

  // Применить middleware глобально
  // app.use(LoggerMiddlewareFunc);

  setEnableCors(app);

  setAppProxy(app);

  // Установка префикса
  setAppPrefix(app);

  // Конфигурация swagger документации
  setSwagger(app);

  // Применение глобальных pipes
  setAppPipes(app);

  // Применение глобальных exceptions filters
  setAppExceptionsFilters(app);
};

const setEnableCors = (app: INestApplication) => {
  app.enableCors();
};

const setAppProxy = (app: INestApplication) => {
  const expressApp = app.getHttpAdapter().getInstance();

  expressApp.set('trust proxy', true);
};

const setAppPrefix = (app: INestApplication) => {
  // Устанавливается для разворачивания front-end и back-end на одном домене
  // https://site.com - front-end
  // https://site.com/api - backend-end
  app.setGlobalPrefix(APP_PREFIX);
};

const setSwagger = (app: INestApplication) => {
  const configService = app.get(ConfigService<ConfigurationType, true>);
  const environmentSettings = configService.get('environmentSettings', {
    infer: true,
  });

  if (environmentSettings.isProduction()) {
    const swaggerPath = APP_PREFIX + '/swagger-doc';

    const config = new DocumentBuilder()
      .setTitle('BLOGGER API')
      .addBearerAuth()
      .setVersion('1.0')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(swaggerPath, app, document, {
      customSiteTitle: 'Blogger Swagger',
    });
  }
};

const setAppPipes = (app: INestApplication) => {
  app.useGlobalPipes(
    new ValidationPipe({
      // Для работы трансформации входящих данных
      transform: true,
      // Выдавать первую ошибку для каждого поля
      stopAtFirstError: true,
      // Перехватываем ошибку, кастомизируем её и выкидываем 400 с собранными данными
      exceptionFactory: (errors) => {
        const customErrors: { key: string; message: string }[] = [];

        errors.forEach((e) => {
          if (e.constraints) {
            const constraintKeys = Object.keys(e.constraints);

            constraintKeys.forEach((cKey) => {
              const msg = e.constraints?.[cKey];

              customErrors.push({ key: e.property, message: msg || 'Error' });
            });
          }
        });

        // Error 400
        throw new BadRequestException(customErrors);
      },
    }),
  );
};

const setAppExceptionsFilters = (app: INestApplication) => {
  app.useGlobalFilters(new HttpExceptionFilter());
};
