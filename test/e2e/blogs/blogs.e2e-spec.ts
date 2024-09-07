import { APP_PREFIX } from '@settings/apply-app-setting';
import { HttpStatus } from '@nestjs/common';
import request from 'supertest';
import * as data from './dataset';
import { apiSettings, app, dataSource } from '../../jest.setup';
import { testSeeder } from '../../utils/test.seeder';
import { BlogOutputDtoMapper } from '@features/blogs/api/dto/output/blog.output.dto';
import { LikeStatusEnum } from '@features/likes/domain/likes.entity';
import { PostOutputDtoMapper } from '@features/posts/api/dto/output/post.output.dto';
import { ID } from '../../mocks/mocks';
import { createAuthorizationHeader } from '../../utils/test-helpers';
import { Blog } from '@features/blogs/domain/blog.entity';
import { NewBlogDto } from '@features/blogs/api/dto/new-blog.dto';
import { Post } from '@features/posts/domain/post.entity';

describe(`Blogs (e2e) GET - /blogs`, () => {
  it('Should get empty array', async () => {
    const res = await request(app.getHttpServer())
      .get(`${APP_PREFIX}/blogs`)
      .expect(HttpStatus.OK);

    expect(res.body.items).toHaveLength(0);
    expect(1).toBe(1);
  });

  it('Should return blogs list with pagination metadata', async () => {
    const blog = testSeeder.createBlogDto();

    const blogList: Blog[] = await dataSource.query(
      `
      INSERT INTO blogs (name, description, website_url, is_membership)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `,
      [blog.name, blog.description, blog.websiteUrl, blog.isMembership],
    );

    const res = await request(app.getHttpServer())
      .get(`${APP_PREFIX}/blogs`)
      .expect(HttpStatus.OK);

    expect(res.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 1,
      items: blogList.map(BlogOutputDtoMapper),
    });
  });

  it('Should get filtered array by searchNameTerm=Nikita', async () => {
    const blogList: NewBlogDto[] = [
      {
        name: 'Nikita',
        description: 'Test description',
        websiteUrl: 'https://string.com',
        isMembership: false,
      },
      {
        name: 'Sacha',
        description: 'Test description',
        websiteUrl: 'https://string.com',
        isMembership: false,
      },
      {
        name: 'Mascha',
        description: 'Test description',
        websiteUrl: 'https://string.com',
        isMembership: false,
      },
    ];

    for (const blog of blogList) {
      await dataSource.query(
        `
      INSERT INTO blogs (name, description, website_url, is_membership)
      VALUES ($1, $2, $3, $4)
      RETURNING id;
    `,
        [blog.name, blog.description, blog.websiteUrl, blog.isMembership],
      );
    }

    const res = await request(app.getHttpServer())
      .get(`${APP_PREFIX}/blogs/?searchNameTerm=Nikita`)
      .expect(HttpStatus.OK);

    expect(res.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 1,
      items: expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          name: 'Nikita',
          description: 'Test description',
          websiteUrl: 'https://string.com',
          isMembership: false,
          createdAt: expect.any(String),
        }),
      ]),
    });
  });

  it('Should get second page', async () => {
    const blogList = testSeeder.createBlogListDto(3);

    const newBlogList: Blog[] = [];

    for (const blog of blogList) {
      const result: Blog[] = await dataSource.query(
        `
      INSERT INTO blogs (name, description, website_url, is_membership)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `,
        [blog.name, blog.description, blog.websiteUrl, blog.isMembership],
      );

      newBlogList.push(...result);
    }

    const res = await request(app.getHttpServer())
      .get(`${APP_PREFIX}/blogs?pageNumber=2&pageSize=2`)
      .expect(HttpStatus.OK);

    expect(res.body).toEqual({
      pagesCount: 2,
      page: 2,
      pageSize: 2,
      totalCount: 3,
      items: [BlogOutputDtoMapper(newBlogList[0])],
    });
  });
});

describe(`Blogs (e2e) GET - /:blogId/posts`, () => {
  it('Should get filtered array', async () => {
    const blog = testSeeder.createBlogDto();

    const blogList: Blog[] = await dataSource.query(
      `
      INSERT INTO blogs (name, description, website_url, is_membership)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `,
      [blog.name, blog.description, blog.websiteUrl, blog.isMembership],
    );

    const blogId = blogList[0].id;

    const post = testSeeder.createPostDto(blogId);

    const postList: Post[] = await dataSource.query(
      `
      INSERT INTO posts (title, short_description, content, blog_id, blog_name)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `,
      [
        post.title,
        post.shortDescription,
        post.content,
        post.blogId,
        post.blogName,
      ],
    );

    const extendedLikesInfo = {
      dislikesCount: 0,
      likesCount: 0,
      myStatus: LikeStatusEnum.NONE,
      newestLikes: [],
    };

    const res = await request(app.getHttpServer())
      .get(`${APP_PREFIX}/blogs/${blogId}/posts`)
      .expect(HttpStatus.OK);

    expect(res.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 1,
      items: postList.map((post) =>
        PostOutputDtoMapper(post, extendedLikesInfo),
      ),
    });
  });

  it(`Should get status ${HttpStatus.NOT_FOUND}`, async () => {
    await request(app.getHttpServer())
      .get(`${APP_PREFIX}/blogs/${ID}/posts`)
      .expect(HttpStatus.NOT_FOUND);
  });
});

describe(`Blogs (e2e) GET - /blogs/id`, () => {
  it('Should get blog', async () => {
    const blog = testSeeder.createBlogDto();

    const blogList: Blog[] = await dataSource.query(
      `
      INSERT INTO blogs (name, description, website_url, is_membership)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `,
      [blog.name, blog.description, blog.websiteUrl, blog.isMembership],
    );

    const blogId = blogList[0].id;

    const res = await request(app.getHttpServer())
      .get(`${APP_PREFIX}/blogs/${blogId}`)
      .expect(HttpStatus.OK);

    expect(res.body).toEqual(BlogOutputDtoMapper(blogList[0]));
  });

  it(`Should get status ${HttpStatus.NOT_FOUND}`, async () => {
    const blog = testSeeder.createBlogDto();

    await dataSource.query(
      `
      INSERT INTO blogs (name, description, website_url, is_membership)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `,
      [blog.name, blog.description, blog.websiteUrl, blog.isMembership],
    );

    await request(app.getHttpServer())
      .get(`${APP_PREFIX}/blogs/${ID}`)
      .expect(HttpStatus.NOT_FOUND);
  });
});

describe(`Blogs (e2e) POST - /blogs`, () => {
  it('Should add blog', async () => {
    const blog = testSeeder.createBlogDto();

    const res = await request(app.getHttpServer())
      .post(`${APP_PREFIX}/sa/blogs`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .send({
        name: blog.name,
        description: blog.description,
        websiteUrl: blog.websiteUrl,
      })
      .expect(HttpStatus.CREATED);

    expect(res.body).toEqual(
      expect.objectContaining({
        name: blog.name,
        description: blog.description,
        websiteUrl: blog.websiteUrl,
      }),
    );
  });

  it('Should get Error while field "name" is too long', async () => {
    const res = await request(app.getHttpServer())
      .post(`${APP_PREFIX}/sa/blogs`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .send(data.dataSetNewBlog1)
      .expect(HttpStatus.BAD_REQUEST);

    expect(res.body).toEqual(data.errorDataSet1);
  });

  it('Should get Error while field "name" is not a string', async () => {
    const res = await request(app.getHttpServer())
      .post(`${APP_PREFIX}/sa/blogs`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .send(data.dataSetNewBlog2)
      .expect(HttpStatus.BAD_REQUEST);

    expect(res.body).toEqual(data.errorDataSet2);
  });

  it('Should get Error while field "name" is empty', async () => {
    const res = await request(app.getHttpServer())
      .post(`${APP_PREFIX}/sa/blogs`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .send(data.dataSetNewBlog3)
      .expect(HttpStatus.BAD_REQUEST);

    expect(res.body).toEqual(data.errorDataSet3);
  });

  it('Should get Error while field "description" is too long', async () => {
    const res = await request(app.getHttpServer())
      .post(`${APP_PREFIX}/sa/blogs`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .send(data.dataSetNewBlog4)
      .expect(HttpStatus.BAD_REQUEST);

    expect(res.body).toEqual(data.errorDataSet4);
  });

  it('Should get Error while field "description" is not a string', async () => {
    const res = await request(app.getHttpServer())
      .post(`${APP_PREFIX}/sa/blogs`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .send(data.dataSetNewBlog5)
      .expect(HttpStatus.BAD_REQUEST);

    expect(res.body).toEqual(data.errorDataSet5);
  });

  it('Should get Error while field "description" is empty', async () => {
    const res = await request(app.getHttpServer())
      .post(`${APP_PREFIX}/sa/blogs`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .send(data.dataSetNewBlog6)
      .expect(HttpStatus.BAD_REQUEST);

    expect(res.body).toEqual(data.errorDataSet6);
  });

  it('Should get Error while field "websiteUrl" is not correct', async () => {
    const res = await request(app.getHttpServer())
      .post(`${APP_PREFIX}/sa/blogs`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .send(data.dataSetNewBlog7)
      .expect(HttpStatus.BAD_REQUEST);

    expect(res.body).toEqual(data.errorDataSet7);
  });
});

describe(`Blogs (e2e) POST - /:blogId/posts`, () => {
  it('Should add post for blog', async () => {
    const blog = testSeeder.createBlogDto();

    const blogList: Blog[] = await dataSource.query(
      `
      INSERT INTO blogs (name, description, website_url, is_membership)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `,
      [blog.name, blog.description, blog.websiteUrl, blog.isMembership],
    );

    const blogId = blogList[0].id;

    const res = await request(app.getHttpServer())
      .post(`${APP_PREFIX}/sa/blogs/${blogId}/posts`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .send({
        title: 'New title',
        shortDescription: 'New shortDescription',
        content: 'New content',
      })
      .expect(HttpStatus.CREATED);

    expect(res.body).toEqual(
      expect.objectContaining({
        title: 'New title',
        shortDescription: 'New shortDescription',
        content: 'New content',
        blogId,
      }),
    );
  });
});

describe(`Blogs (e2e) PUT - /:blogId/posts`, () => {
  it('Should update blog', async () => {
    const blog = testSeeder.createBlogDto();

    const blogList: Blog[] = await dataSource.query(
      `
      INSERT INTO blogs (name, description, website_url, is_membership)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `,
      [blog.name, blog.description, blog.websiteUrl, blog.isMembership],
    );

    const blogId = blogList[0].id;

    await request(app.getHttpServer())
      .put(`${APP_PREFIX}/sa/blogs/${blogId}`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .send(data.dataSetUpdateBlog)
      .expect(HttpStatus.NO_CONTENT);
  });

  it(`Should get error ${HttpStatus.NOT_FOUND}`, async () => {
    await request(app.getHttpServer())
      .put(`${APP_PREFIX}/sa/blogs/${ID}`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .send(data.dataSetUpdateBlog)
      .expect(HttpStatus.NOT_FOUND);
  });

  it('Should get Error while field "name" is too long', async () => {
    const blog = testSeeder.createBlogDto();

    const blogList: Blog[] = await dataSource.query(
      `
      INSERT INTO blogs (name, description, website_url, is_membership)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `,
      [blog.name, blog.description, blog.websiteUrl, blog.isMembership],
    );

    const blogId = blogList[0].id;

    const res = await request(app.getHttpServer())
      .put(`${APP_PREFIX}/sa/blogs/${blogId}`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .send(data.dataSetNewBlog1)
      .expect(HttpStatus.BAD_REQUEST);

    expect(res.body).toEqual(data.errorDataSet1);
  });

  it('Should get Error while field "name" is not a string', async () => {
    const blog = testSeeder.createBlogDto();

    const blogList: Blog[] = await dataSource.query(
      `
      INSERT INTO blogs (name, description, website_url, is_membership)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `,
      [blog.name, blog.description, blog.websiteUrl, blog.isMembership],
    );

    const blogId = blogList[0].id;

    const res = await request(app.getHttpServer())
      .put(`${APP_PREFIX}/sa/blogs/${blogId}`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .send(data.dataSetNewBlog2)
      .expect(HttpStatus.BAD_REQUEST);

    expect(res.body).toEqual(data.errorDataSet2);
  });

  it('Should get Error while field "name" is empty', async () => {
    const blog = testSeeder.createBlogDto();

    const blogList: Blog[] = await dataSource.query(
      `
      INSERT INTO blogs (name, description, website_url, is_membership)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `,
      [blog.name, blog.description, blog.websiteUrl, blog.isMembership],
    );

    const blogId = blogList[0].id;

    const res = await request(app.getHttpServer())
      .put(`${APP_PREFIX}/sa/blogs/${blogId}`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .send(data.dataSetNewBlog3)
      .expect(HttpStatus.BAD_REQUEST);

    expect(res.body).toEqual(data.errorDataSet3);
  });

  it('Should get Error while field "description" is too long', async () => {
    const blog = testSeeder.createBlogDto();

    const blogList: Blog[] = await dataSource.query(
      `
      INSERT INTO blogs (name, description, website_url, is_membership)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `,
      [blog.name, blog.description, blog.websiteUrl, blog.isMembership],
    );

    const blogId = blogList[0].id;

    const res = await request(app.getHttpServer())
      .put(`${APP_PREFIX}/sa/blogs/${blogId}`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .send(data.dataSetNewBlog4)
      .expect(HttpStatus.BAD_REQUEST);

    expect(res.body).toEqual(data.errorDataSet4);
  });

  it('Should get Error while field "description" is not a string', async () => {
    const blog = testSeeder.createBlogDto();

    const blogList: Blog[] = await dataSource.query(
      `
      INSERT INTO blogs (name, description, website_url, is_membership)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `,
      [blog.name, blog.description, blog.websiteUrl, blog.isMembership],
    );

    const blogId = blogList[0].id;

    const res = await request(app.getHttpServer())
      .put(`${APP_PREFIX}/sa/blogs/${blogId}`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .send(data.dataSetNewBlog5)
      .expect(HttpStatus.BAD_REQUEST);

    expect(res.body).toEqual(data.errorDataSet5);
  });

  it('Should get Error while field "description" is empty', async () => {
    const blog = testSeeder.createBlogDto();

    const blogList: Blog[] = await dataSource.query(
      `
      INSERT INTO blogs (name, description, website_url, is_membership)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `,
      [blog.name, blog.description, blog.websiteUrl, blog.isMembership],
    );

    const blogId = blogList[0].id;

    const res = await request(app.getHttpServer())
      .put(`${APP_PREFIX}/sa/blogs/${blogId}`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .send(data.dataSetNewBlog6)
      .expect(HttpStatus.BAD_REQUEST);

    expect(res.body).toEqual(data.errorDataSet6);
  });

  it('Should get Error while field "websiteUrl" is not correct', async () => {
    const blog = testSeeder.createBlogDto();

    const blogList: Blog[] = await dataSource.query(
      `
      INSERT INTO blogs (name, description, website_url, is_membership)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `,
      [blog.name, blog.description, 'websa', blog.isMembership],
    );

    const blogId = blogList[0].id;

    const res = await request(app.getHttpServer())
      .put(`${APP_PREFIX}/sa/blogs/${blogId}`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .send(data.dataSetNewBlog7)
      .expect(HttpStatus.BAD_REQUEST);

    expect(res.body).toEqual(data.errorDataSet7);
  });
});

describe(`Blogs (e2e) DELETE - /:blogId`, () => {
  it('Should deleteBlogById blog', async () => {
    const blog = testSeeder.createBlogDto();

    const blogList: Blog[] = await dataSource.query(
      `
      INSERT INTO blogs (name, description, website_url, is_membership)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `,
      [blog.name, blog.description, blog.websiteUrl, blog.isMembership],
    );

    const blogId = blogList[0].id;

    await request(app.getHttpServer())
      .delete(`${APP_PREFIX}/sa/blogs/${blogId}`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .expect(HttpStatus.NO_CONTENT);
  });

  it(`Should get error ${HttpStatus.NOT_FOUND}`, async () => {
    await request(app.getHttpServer())
      .delete(`${APP_PREFIX}/blogs/${ID}`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .expect(HttpStatus.NOT_FOUND);
  });
});
