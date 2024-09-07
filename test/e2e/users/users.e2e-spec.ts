import request from 'supertest';
import { createAuthorizationHeader } from '../../utils/test-helpers';
import { apiSettings, app, dataSource } from '../../jest.setup';
import { HttpStatus } from '@nestjs/common';
import { testSeeder } from '../../utils/test.seeder';
import { getCurrentISOStringDate } from '@utils/dates';
import * as data from './dataset';
import { APP_PREFIX } from '@settings/apply-app-setting';
import { ID } from '../../mocks/mocks';

describe('Users (e2e) GET', () => {
  it('Should return users list with pagination metadata', async () => {
    const user = testSeeder.createUserDto();

    await dataSource.query(
      `
      INSERT INTO users (login, password, email)
      VALUES ($1, $2, $3)
      RETURNING id;
    `,
      [user.login, user.password, user.email],
    );

    const response = await request(app.getHttpServer())
      .get(`${APP_PREFIX}/sa/users`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .expect(HttpStatus.OK);

    expect(response.body).toEqual({
      items: [
        expect.objectContaining({
          id: expect.any(String),
          login: user.login,
          email: user.email,
          createdAt: expect.any(String),
        }),
      ],
      totalCount: 1,
      pageSize: 10,
      page: 1,
      pagesCount: 1,
    });
  });

  it('Should return users list with pagination metadata second page', async () => {
    const userList = testSeeder.createUserListDto(3);

    for (const user of userList) {
      await dataSource.query(
        `
      INSERT INTO users (login, password, email)
      VALUES ($1, $2, $3)
      RETURNING id;
    `,
        [user.login, user.password, user.email],
      );
    }

    const response = await request(app.getHttpServer())
      .get(`${APP_PREFIX}/sa/users/?pageSize=1&pageNumber=2`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .expect(HttpStatus.OK);

    expect(response.body).toEqual({
      items: [
        expect.objectContaining({
          id: expect.any(String),
          login: userList[1].login,
          email: userList[1].email,
          createdAt: expect.any(String),
        }),
      ],
      totalCount: 3,
      pageSize: 1,
      page: 2,
      pagesCount: 3,
    });
  });

  it('Should find user by login', async () => {
    const userList = testSeeder.createUserListDto(3);

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

    const response = await request(app.getHttpServer())
      .get(`${APP_PREFIX}/sa/users/?searchLoginTerm=test0`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .expect(HttpStatus.OK);

    expect(response.body).toEqual({
      items: [
        expect.objectContaining({
          id: expect.any(String),
          login: userList[0].login,
          email: userList[0].email,
          createdAt: expect.any(String),
        }),
      ],
      totalCount: 1,
      pageSize: 10,
      page: 1,
      pagesCount: 1,
    });
  });

  it('Should find user by email', async () => {
    const userList = testSeeder.createUserListDto(3);

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

    const response = await request(app.getHttpServer())
      .get(`${APP_PREFIX}/sa/users/?searchEmailTerm=test0@gmail.com`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .expect(HttpStatus.OK);

    expect(response.body).toEqual({
      items: [
        expect.objectContaining({
          id: expect.any(String),
          login: userList[0].login,
          email: userList[0].email,
          createdAt: expect.any(String),
        }),
      ],
      totalCount: 1,
      pageSize: 10,
      page: 1,
      pagesCount: 1,
    });
  });

  it('Should getUserById array by filters', async () => {
    const userList = [
      { login: 'user01', password: 'string', email: 'email1p@gg.cm' },
      { login: 'user02', password: 'string', email: 'email1p@gg.com' },
      { login: 'user05', password: 'string', email: 'email1p@gg.coi' },
      { login: 'user03', password: 'string', email: 'email1p@gg.cou' },
      { login: 'log01', password: 'string', email: 'emai@gg.com' },
      { login: 'log02', password: 'string', email: 'email2p@g.com' },
      { login: 'loSer', password: 'string', email: 'email2p@gg.om' },
      { login: 'uer15', password: 'string', email: 'emarrr1@gg.com' },
      { login: 'usr-1-01', password: 'string', email: 'email3@gg.com' },
    ];

    for (const user of userList) {
      await dataSource.query(
        `
      INSERT INTO users (login, password, email, created_at)
      VALUES ($1, $2, $3, $4)
      RETURNING id;
    `,
        [user.login, user.password, user.email, getCurrentISOStringDate()],
      );
    }

    const response = await request(app.getHttpServer())
      .get(
        `${APP_PREFIX}/sa/users/?pageSize=15&pageNumber=1&searchLoginTerm=seR&searchEmailTerm=.com&sortDirection=asc&sortBy=login`,
      )
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .expect(HttpStatus.OK);

    expect(response.body.items).toEqual([
      {
        id: expect.any(String),
        login: 'loSer',
        email: 'email2p@gg.om',
        createdAt: expect.any(String),
      },
      {
        id: expect.any(String),
        login: 'log01',
        email: 'emai@gg.com',
        createdAt: expect.any(String),
      },
      {
        id: expect.any(String),
        login: 'log02',
        email: 'email2p@g.com',
        createdAt: expect.any(String),
      },
      {
        id: expect.any(String),
        login: 'uer15',
        email: 'emarrr1@gg.com',
        createdAt: expect.any(String),
      },
      {
        id: expect.any(String),
        login: 'user01',
        email: 'email1p@gg.cm',
        createdAt: expect.any(String),
      },
      {
        id: expect.any(String),
        login: 'user02',
        email: 'email1p@gg.com',
        createdAt: expect.any(String),
      },
      {
        id: expect.any(String),
        login: 'user03',
        email: 'email1p@gg.cou',
        createdAt: expect.any(String),
      },
      {
        id: expect.any(String),
        login: 'user05',
        email: 'email1p@gg.coi',
        createdAt: expect.any(String),
      },
      {
        id: expect.any(String),
        login: 'usr-1-01',
        email: 'email3@gg.com',
        createdAt: expect.any(String),
      },
    ]);
  });
});

describe('Users (e2e) POST', () => {
  it('Should add user', async () => {
    const user = testSeeder.createUserDto();

    const response = await request(app.getHttpServer())
      .post(`${APP_PREFIX}/sa/users`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .send(user)
      .expect(HttpStatus.CREATED);

    expect(response.body).toEqual({
      id: expect.any(String),
      login: user.login,
      email: user.email,
      createdAt: expect.any(String),
    });
  });

  it('Should getBlogById Error while field "login" is too short', async () => {
    const response = await request(app.getHttpServer())
      .post(`${APP_PREFIX}/sa/users`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .send(data.dataSetNewUser1)
      .expect(HttpStatus.BAD_REQUEST);

    expect(response.body).toEqual(data.errorDataSet1);
  });

  it('Should getBlogById Error while field "password" is too long', async () => {
    const response = await request(app.getHttpServer())
      .post(`${APP_PREFIX}/sa/users`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .send(data.dataSetNewUser2)
      .expect(HttpStatus.BAD_REQUEST);

    expect(response.body).toEqual(data.errorDataSet2);
  });

  it('Should getBlogById Error while field "password" is too long', async () => {
    const response = await request(app.getHttpServer())
      .post(`${APP_PREFIX}/sa/users`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .send(data.dataSetNewUser3)
      .expect(HttpStatus.BAD_REQUEST);

    expect(response.body).toEqual(data.errorDataSet3);
  });
});

describe('Users (e2e) DELETE', () => {
  it('Should deleteBlogById user', async () => {
    const user = testSeeder.createUserDto();

    const result = await dataSource.query(
      `
      INSERT INTO users (login, password, email, created_at)
      VALUES ($1, $2, $3, $4)
      RETURNING id;
    `,
      [user.login, user.password, user.email, new Date()],
    );

    const userId = result[0].id;

    await request(app.getHttpServer())
      .delete(`${APP_PREFIX}/sa/users/${userId}`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .expect(HttpStatus.NO_CONTENT);
  });

  it(`Should get error ${HttpStatus.NOT_FOUND}`, async () => {
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
      .delete(`${APP_PREFIX}/sa/users/${ID}`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .expect(HttpStatus.NOT_FOUND);
  });
});
