import request from 'supertest';
import { testSeeder } from '../../utils/test.seeder';
import { app, dataSource, hashBuilder } from '../../jest.setup';
import { APP_PREFIX } from '@settings/apply-app-setting';
import { HttpStatus } from '@nestjs/common';
import { ID } from '../../mocks/mocks';

describe(`Endpoint (GET) - /devices`, () => {
  it('Should getUserById 2 devices', async () => {
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
      .send({
        loginOrEmail: user.login,
        password: password,
      })
      .expect(HttpStatus.OK);

    const res = await request(app.getHttpServer())
      .post(`${APP_PREFIX}/auth/login`)
      .send({
        loginOrEmail: user.login,
        password: password,
      })
      .expect(HttpStatus.OK);

    const cookie = res.headers['set-cookie'];

    const devises = await request(app.getHttpServer())
      .get(`${APP_PREFIX}/security/devices`)
      .set('Cookie', cookie)
      .expect(HttpStatus.OK);

    expect(devises.body.length).toBe(2);
  });

  it(`Should get status ${HttpStatus.UNAUTHORIZED}`, async () => {
    await request(app.getHttpServer())
      .get(`${APP_PREFIX}/security/devices`)
      .expect(HttpStatus.UNAUTHORIZED);
  });
});

describe(`Endpoint (DELETE) - /devices`, () => {
  it('Should getUserById 0 devices', async () => {
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
      .send({
        loginOrEmail: user.login,
        password,
      })
      .expect(HttpStatus.OK);

    const res = await request(app.getHttpServer())
      .post(`${APP_PREFIX}/auth/login`)
      .send({
        loginOrEmail: user.login,
        password,
      })
      .expect(HttpStatus.OK);

    const cookie = res.headers['set-cookie'];

    await request(app.getHttpServer())
      .delete(`${APP_PREFIX}/security/devices`)
      .set('Cookie', cookie)
      .expect(HttpStatus.NO_CONTENT);
  });

  it(`Should get status ${HttpStatus.UNAUTHORIZED}`, async () => {
    await request(app.getHttpServer())
      .delete(`${APP_PREFIX}/security/devices`)
      .expect(HttpStatus.UNAUTHORIZED);
  });
});

describe(`Endpoint (DELETE) - /devices/:deviceId`, () => {
  it(`Should get 0 devices ${HttpStatus.NO_CONTENT}`, async () => {
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
      .send({
        loginOrEmail: user.login,
        password,
      })
      .expect(HttpStatus.OK);

    const res = await request(app.getHttpServer())
      .post(`${APP_PREFIX}/auth/login`)
      .send({
        loginOrEmail: user.login,
        password,
      })
      .expect(HttpStatus.OK);

    const cookie = res.headers['set-cookie'];

    const devises = await request(app.getHttpServer())
      .get(`${APP_PREFIX}/security/devices`)
      .set('Cookie', cookie)
      .expect(HttpStatus.OK);

    await request(app.getHttpServer())
      .delete(`${APP_PREFIX}/security/devices/${devises.body.at(0).deviceId}`)
      .set('Cookie', cookie)
      .expect(HttpStatus.NO_CONTENT);
  });

  it(`Should get status ${HttpStatus.UNAUTHORIZED}`, async () => {
    await request(app.getHttpServer())
      .delete(`${APP_PREFIX}/security/devices`)
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it(`Should get status ${HttpStatus.FORBIDDEN}`, async () => {
    const password = 'password';

    const userList = testSeeder.createUserListDto(
      2,
      await hashBuilder.hash(password),
    );

    for (const user of userList) {
      await dataSource.query(
        `
      INSERT INTO users (login, password, email, created_at)
      VALUES ($1, $2, $3, $4)
      RETURNING id;
    `,
        [user.login, user.password, user.email, user.created_at],
      );
    }

    const res1 = await request(app.getHttpServer())
      .post(`${APP_PREFIX}/auth/login`)
      .send({
        loginOrEmail: userList[0].login,
        password,
      })
      .expect(HttpStatus.OK);

    const cookie1 = res1.headers['set-cookie'];

    const res2 = await request(app.getHttpServer())
      .post(`${APP_PREFIX}/auth/login`)
      .send({
        loginOrEmail: userList[1].login,
        password,
      })
      .expect(HttpStatus.OK);

    const cookie2 = res2.headers['set-cookie'];

    const devises1 = await request(app.getHttpServer())
      .get(`${APP_PREFIX}/security/devices`)
      .set('Cookie', cookie1)
      .expect(HttpStatus.OK);

    await request(app.getHttpServer())
      .get(`${APP_PREFIX}/security/devices`)
      .set('Cookie', cookie1)
      .expect(HttpStatus.OK);

    await request(app.getHttpServer())
      .delete(`${APP_PREFIX}/security/devices/${devises1.body.at(0).deviceId}`)
      .set('Cookie', cookie2)
      .expect(HttpStatus.FORBIDDEN);
  });

  it(`Should get status ${HttpStatus.NOT_FOUND}`, async () => {
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
      .send({
        loginOrEmail: user.login,
        password: password,
      })
      .expect(HttpStatus.OK);

    const res = await request(app.getHttpServer())
      .post(`${APP_PREFIX}/auth/login`)
      .send({
        loginOrEmail: user.login,
        password: password,
      })
      .expect(HttpStatus.OK);

    const cookie = res.headers['set-cookie'];

    await request(app.getHttpServer())
      .get(`${APP_PREFIX}/security/devices`)
      .set('Cookie', cookie)
      .expect(HttpStatus.OK);

    await request(app.getHttpServer())
      .delete(`${APP_PREFIX}/security/devices/${ID}`)
      .set('Cookie', cookie)
      .expect(HttpStatus.NOT_FOUND);
  });
});
