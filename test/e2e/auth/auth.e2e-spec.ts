import { createAuthorizationHeader } from '../../utils/test-helpers';
import {
  apiSettings,
  app,
  dataSource,
  hashBuilder,
  jwtService,
} from '../../jest.setup';
import { HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { APP_PREFIX } from '@settings/apply-app-setting';
import { testSeeder } from '../../utils/test.seeder';

describe(`Endpoint (POST) - /login`, () => {
  it(`Should get status ${HttpStatus.NO_CONTENT}`, async () => {
    const password = 'password';

    const user = testSeeder.createUserDtoHashPass(
      await hashBuilder.hash(password),
    );

    await dataSource.query(
      `
      INSERT INTO users (login, password, email, created_at)
      VALUES ($1, $2, $3, $4)
      RETURNING id;
    `,
      [user.login, user.password, user.email, user.created_at],
    );

    await request(app.getHttpServer())
      .post(`${APP_PREFIX}/auth/login`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .send({
        loginOrEmail: user.login,
        password,
      })
      .expect(HttpStatus.OK);
  });

  it(`Should get status ${HttpStatus.UNAUTHORIZED}`, async () => {
    const password = 'password';

    const user = testSeeder.createUserDtoHashPass(
      await hashBuilder.hash(password),
    );

    await dataSource.query(
      `
      INSERT INTO users (login, password, email, created_at)
      VALUES ($1, $2, $3, $4)
      RETURNING id;
    `,
      [user.login, user.password, user.email, user.created_at],
    );

    await request(app.getHttpServer())
      .post(`${APP_PREFIX}/auth/login`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .send({
        loginOrEmail: 'logi',
        password,
      })
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it(`Should get status ${HttpStatus.BAD_REQUEST}`, async () => {
    await request(app.getHttpServer())
      .post(`${APP_PREFIX}/sa/users`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .send({
        login: 'l',
        password: 'password',
        email: 'example@example.com',
      })
      .expect(HttpStatus.BAD_REQUEST);
  });
});

describe(`Endpoint (POST) - /registration`, () => {
  it(`Should get status ${HttpStatus.NO_CONTENT}`, async () => {
    await request(app.getHttpServer())
      .post(`${APP_PREFIX}/auth/registration`)
      .send({
        login: 'login',
        password: 'password',
        email: 'example@example.com',
      })
      .expect(HttpStatus.NO_CONTENT);
  });

  it(`Should get status ${HttpStatus.BAD_REQUEST}`, async () => {
    const user = testSeeder.createUserDto();

    await dataSource.query(
      `
      INSERT INTO users (login, password, email)
      VALUES ($1, $2, $3)
      RETURNING id;
    `,
      [user.login, user.password, user.email],
    );

    const res = await request(app.getHttpServer())
      .post(`${APP_PREFIX}/auth/registration`)
      .send({
        login: user.login,
        password: user.password,
        email: user.email,
      })
      .expect(HttpStatus.BAD_REQUEST);

    expect(res.body).toEqual({
      errorsMessages: [
        {
          message: 'User already exists',
          field: 'login',
        },
      ],
    });
  });
});

describe(`Endpoint (POST) - /password-recovery`, () => {
  it(`Should get status ${HttpStatus.NO_CONTENT}`, async () => {
    const user = testSeeder.createUserDto();

    await dataSource.query(
      `
      INSERT INTO users (login, password, email)
      VALUES ($1, $2, $3)
      RETURNING id;
    `,
      [user.login, user.password, user.email],
    );

    await request(app.getHttpServer())
      .post(`${APP_PREFIX}/auth/password-recovery`)
      .send({
        email: user.email,
      })
      .expect(HttpStatus.NO_CONTENT);
  });

  it(`Should get status ${HttpStatus.BAD_REQUEST}`, async () => {
    const user = testSeeder.createUserDto();

    await dataSource.query(
      `
      INSERT INTO users (login, password, email)
      VALUES ($1, $2, $3)
      RETURNING id;
    `,
      [user.login, user.password, user.email],
    );

    const res = await request(app.getHttpServer())
      .post(`${APP_PREFIX}/auth/password-recovery`)
      .send({
        email: 'mail.com',
      })
      .expect(HttpStatus.BAD_REQUEST);

    expect(res.body).toEqual({
      errorsMessages: [
        {
          message: 'Email must be a valid email address',
          field: 'email',
        },
      ],
    });
  });
});

describe(`Endpoint (POST) - /new-password`, () => {
  it(`Should get status`, async () => {
    const user = testSeeder.createUserDto();

    const userList = await dataSource.query(
      `
      INSERT INTO users (login, password, email)
      VALUES ($1, $2, $3)
      RETURNING id;
    `,
      [user.login, user.password, user.email],
    );

    const userId = userList.at(0).id;

    const confirmationCode = await jwtService.signAsync(
      { userId },
      { expiresIn: '1d', secret: apiSettings.JWT_SECRET_KEY },
    );

    await dataSource.query(
      `
      INSERT INTO recovery_code (user_id, confirmation_code, is_confirmed)
      VALUES ($1, $2, $3)
      RETURNING id;
      `,
      [userId, confirmationCode, false],
    );

    await request(app.getHttpServer())
      .post(`${APP_PREFIX}/auth/new-password`)
      .send({
        recoveryCode: confirmationCode,
        newPassword: 'password1',
      })
      .expect(HttpStatus.NO_CONTENT);
  });

  it(`Should get status ${HttpStatus.BAD_REQUEST} if userId=null `, async () => {
    const user = testSeeder.createUserDto();

    const userList = await dataSource.query(
      `
      INSERT INTO users (login, password, email)
      VALUES ($1, $2, $3)
      RETURNING id;
    `,
      [user.login, user.password, user.email],
    );

    const userId = userList.at(0).id;

    const confirmationCode = await jwtService.signAsync(
      { userId: null },
      { expiresIn: '1d', secret: apiSettings.JWT_SECRET_KEY },
    );

    await dataSource.query(
      `
      INSERT INTO recovery_code (user_id, confirmation_code, is_confirmed)
      VALUES ($1, $2, $3)
      RETURNING id;
      `,
      [userId, confirmationCode, false],
    );

    const res = await request(app.getHttpServer())
      .post(`${APP_PREFIX}/auth/new-password`)
      .send({
        recoveryCode: confirmationCode,
        newPassword: 'password1',
      })
      .expect(HttpStatus.BAD_REQUEST);

    expect(res.body).toEqual({
      errorsMessages: [
        { message: 'Recovery code not correct', field: 'recoveryCode' },
      ],
    });
  });

  it(`Should get status ${HttpStatus.BAD_REQUEST} if token expired `, async () => {
    const user = testSeeder.createUserDto();

    const userList = await dataSource.query(
      `
      INSERT INTO users (login, password, email)
      VALUES ($1, $2, $3)
      RETURNING id;
    `,
      [user.login, user.password, user.email],
    );

    const userId = userList.at(0).id;

    const confirmationCode = await jwtService.signAsync(
      { userId: null },
      { expiresIn: 0, secret: apiSettings.JWT_SECRET_KEY },
    );

    await dataSource.query(
      `
      INSERT INTO recovery_code (user_id, confirmation_code, is_confirmed)
      VALUES ($1, $2, $3)
      RETURNING id;
      `,
      [userId, confirmationCode, false],
    );

    const res = await request(app.getHttpServer())
      .post(`${APP_PREFIX}/auth/new-password`)
      .send({
        recoveryCode: confirmationCode,
        newPassword: 'password1',
      })
      .expect(HttpStatus.BAD_REQUEST);

    expect(res.body).toEqual({
      errorsMessages: [
        { message: 'Recovery code not correct', field: 'recoveryCode' },
      ],
    });
  });
});
