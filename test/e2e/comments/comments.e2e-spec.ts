import { APP_PREFIX } from '@settings/apply-app-setting';
import { HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { apiSettings, app, dataSource } from '../../jest.setup';
import { testSeeder } from '../../utils/test.seeder';
import { ID } from '../../mocks/mocks';
import {
  createAuthorizationHeader,
  createBearerAuthorizationHeader,
} from '../../utils/test-helpers';
import { LikeStatusEnum } from '@features/likes/domain/likes.entity';
import { Blog } from '@features/blogs/domain/blog.entity';
import { Post } from '@features/posts/domain/post.entity';
import { Comment } from '@features/comments/domain/comment.entity';

describe(`Endpoint (GET) - /:commentId`, () => {
  it('Should get comment', async () => {
    const user = testSeeder.createUserDto();

    await request(app.getHttpServer())
      .post(`${APP_PREFIX}/sa/users`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .send({
        login: user.login,
        password: user.password,
        email: user.email,
      })
      .expect(HttpStatus.CREATED);

    const userList = await dataSource.query(
      ` 
    select * from users u
    where login = $1
    `,
      [user.login],
    );

    await request(app.getHttpServer()).post(`${APP_PREFIX}/auth/login`).send({
      loginOrEmail: user.login,
      password: user.password,
    });

    const userId = userList[0].id;

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

    const postList = testSeeder.createPostListDto(3, blogId);

    const newPostList: Post[] = [];

    for (const post of postList) {
      const result: Post[] = await dataSource.query(
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

      newPostList.push(...result);
    }

    const postId = newPostList[0].id;

    const newComment = testSeeder.createCommentDto(userId, postId);

    const result: Comment[] = await dataSource.query(
      `
      INSERT INTO comments (content, user_id, user_login, post_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `,
      [
        newComment.content,
        newComment.userId,
        newComment.userLogin,
        newComment.postId,
      ],
    );
    const commentId = result[0].id;

    await request(app.getHttpServer())
      .get(`${APP_PREFIX}/comments/${commentId}`)
      .expect(HttpStatus.OK);
  });

  it(`Should get comment with ${LikeStatusEnum.NONE} status`, async () => {
    const user = testSeeder.createUserDto();

    await request(app.getHttpServer())
      .post(`${APP_PREFIX}/sa/users`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .send({
        login: user.login,
        password: user.password,
        email: user.email,
      })
      .expect(HttpStatus.CREATED);

    const userList = await dataSource.query(
      ` 
    select * from users u
    where login = $1
    `,
      [user.login],
    );

    const userId = userList[0].id;

    const token = await request(app.getHttpServer())
      .post(`${APP_PREFIX}/auth/login`)
      .send({
        loginOrEmail: user.login,
        password: user.password,
      });

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

    const postList = testSeeder.createPostListDto(3, blogId);

    const newPostList: Post[] = [];

    for (const post of postList) {
      const result: Post[] = await dataSource.query(
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

      newPostList.push(...result);
    }

    const postId = newPostList[0].id;

    const newComment = testSeeder.createCommentDto(userId, postId);

    const result: Comment[] = await dataSource.query(
      `
      INSERT INTO comments (content, user_id, user_login, post_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `,
      [
        newComment.content,
        newComment.userId,
        newComment.userLogin,
        newComment.postId,
      ],
    );

    const commentId = result[0].id;

    await request(app.getHttpServer())
      .put(`${APP_PREFIX}/comments/${commentId}/like-status`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .send({
        likeStatus: LikeStatusEnum.LIKE,
      })
      .expect(HttpStatus.NO_CONTENT);

    await request(app.getHttpServer())
      .get(`${APP_PREFIX}/comments/${commentId}`)
      .expect(HttpStatus.OK);
  });

  it(`Should get ${HttpStatus.NOT_FOUND}`, async () => {
    await request(app.getHttpServer())
      .get(`${APP_PREFIX}/comments/${ID}`)
      .expect(HttpStatus.NOT_FOUND);
  });
});

describe(`Endpoint (PUT) - /comments`, () => {
  it('Should updatePassword comment', async () => {
    const login = 'testLogin';
    const password = 'string';

    await request(app.getHttpServer())
      .post(`${APP_PREFIX}/sa/users`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .send({
        login,
        password,
        email: 'example@example.com',
      })
      .expect(HttpStatus.CREATED);

    const token = await request(app.getHttpServer())
      .post(`${APP_PREFIX}/auth/login`)
      .send({
        loginOrEmail: login,
        password,
      });

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

    const postList = testSeeder.createPostListDto(3, blogId);

    const newPostList: Post[] = [];

    for (const post of postList) {
      const result: Post[] = await dataSource.query(
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

      newPostList.push(...result);
    }

    const postId = newPostList[0].id;

    const comment = await request(app.getHttpServer())
      .post(`${APP_PREFIX}/posts/${postId}/comments`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .send({
        content: 'content content content',
      })
      .expect(HttpStatus.CREATED);

    await request(app.getHttpServer())
      .put(`${APP_PREFIX}/comments/${comment.body.id.toString()}`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .send({
        content: 'content content content content',
      })
      .expect(HttpStatus.NO_CONTENT);

    const res = await request(app.getHttpServer())
      .get(`${APP_PREFIX}/comments/${comment.body.id.toString()}`)
      .expect(HttpStatus.OK);

    expect(res.body).toEqual(
      expect.objectContaining({
        content: 'content content content content',
      }),
    );
  });

  it(`Should get ${HttpStatus.BAD_REQUEST}`, async () => {
    const login = 'testLogin';
    const password = 'string';

    await request(app.getHttpServer())
      .post(`${APP_PREFIX}/sa/users`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .send({
        login,
        password,
        email: 'example@example.com',
      })
      .expect(HttpStatus.CREATED);

    const userList = await dataSource.query(
      `
    select * from users u
    where login = $1
    `,
      [login],
    );

    const userId = userList[0].id;

    const token = await request(app.getHttpServer())
      .post(`${APP_PREFIX}/auth/login`)
      .send({
        loginOrEmail: login,
        password,
      });

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

    const postList = testSeeder.createPostListDto(3, blogId);

    const newPostList: Post[] = [];

    for (const post of postList) {
      const result: Post[] = await dataSource.query(
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

      newPostList.push(...result);
    }

    const postId = newPostList[0].id;

    const newComment = testSeeder.createCommentDto(userId, postId);

    const result: Comment[] = await dataSource.query(
      `
      INSERT INTO comments (content, user_id, user_login, post_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `,
      [
        newComment.content,
        newComment.userId,
        newComment.userLogin,
        newComment.postId,
      ],
    );

    const commentId = result[0].id;

    const res = await request(app.getHttpServer())
      .put(`${APP_PREFIX}/comments/${commentId}`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .send({
        content: 'co',
      })
      .expect(HttpStatus.BAD_REQUEST);

    expect(res.body).toEqual({
      errorsMessages: [
        {
          field: 'content',
          message: 'Content must be between 20 and 300 characters',
        },
      ],
    });
  });

  it(`Should get ${HttpStatus.UNAUTHORIZED}`, async () => {
    const login = 'testLogin';
    const password = 'string';

    await request(app.getHttpServer())
      .post(`${APP_PREFIX}/sa/users`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .send({
        login,
        password,
        email: 'example@example.com',
      })
      .expect(HttpStatus.CREATED);

    const token = await request(app.getHttpServer())
      .post(`${APP_PREFIX}/auth/login`)
      .send({
        loginOrEmail: login,
        password,
      });

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

    const postList = testSeeder.createPostListDto(3, blogId);

    const newPostList: Post[] = [];

    for (const post of postList) {
      const result: Post[] = await dataSource.query(
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

      newPostList.push(...result);
    }

    const postId = newPostList[0].id;

    const comment = await request(app.getHttpServer())
      .post(`${APP_PREFIX}/posts/${postId}/comments`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .send({
        content: 'content content content',
      })
      .expect(HttpStatus.CREATED);

    await request(app.getHttpServer())
      .put(`${APP_PREFIX}/comments/${comment.body.id.toString()}`)
      .send({
        content: 'co content content content',
      })
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it(`Should get ${HttpStatus.NOT_FOUND}`, async () => {
    const login = 'testLogin';
    const password = 'string';

    await request(app.getHttpServer())
      .post(`${APP_PREFIX}/sa/users`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .send({
        login,
        password,
        email: 'example@example.com',
      })
      .expect(HttpStatus.CREATED);

    const token = await request(app.getHttpServer())
      .post(`${APP_PREFIX}/auth/login`)
      .send({
        loginOrEmail: login,
        password,
      });

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

    const postList = testSeeder.createPostListDto(3, blogId);

    const newPostList: Post[] = [];

    for (const post of postList) {
      const result: Post[] = await dataSource.query(
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

      newPostList.push(...result);
    }

    const postId = newPostList[0].id;

    await request(app.getHttpServer())
      .post(`${APP_PREFIX}/posts/${postId}/comments`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .send({
        content: 'content content content',
      })
      .expect(HttpStatus.CREATED);

    await request(app.getHttpServer())
      .put(`${APP_PREFIX}/comments/${ID}`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .send({
        content: 'co content content content',
      })
      .expect(HttpStatus.NOT_FOUND);
  });

  it(`Should get ${HttpStatus.FORBIDDEN}`, async () => {
    const login = 'testLogin';
    const password = 'string';

    const login2 = 'testLogin2';
    const password2 = 'string2';

    await request(app.getHttpServer())
      .post(`${APP_PREFIX}/sa/users`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .send({
        login,
        password,
        email: 'example@example.com',
      })
      .expect(HttpStatus.CREATED);

    await request(app.getHttpServer())
      .post(`${APP_PREFIX}/sa/users`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .send({
        login: login2,
        password: password2,
        email: 'exame@example.com',
      })
      .expect(HttpStatus.CREATED);

    const token = await request(app.getHttpServer())
      .post(`${APP_PREFIX}/auth/login`)
      .send({
        loginOrEmail: login,
        password,
      });

    const token2 = await request(app.getHttpServer())
      .post(`${APP_PREFIX}/auth/login`)
      .send({
        loginOrEmail: login2,
        password: password2,
      });

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

    const postList = testSeeder.createPostListDto(3, blogId);

    const newPostList: Post[] = [];

    for (const post of postList) {
      const result: Post[] = await dataSource.query(
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

      newPostList.push(...result);
    }

    const postId = newPostList[0].id;

    const comment = await request(app.getHttpServer())
      .post(`${APP_PREFIX}/posts/${postId}/comments`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .send({
        content: 'content content content',
      })
      .expect(HttpStatus.CREATED);

    await request(app.getHttpServer())
      .put(`${APP_PREFIX}/comments/${comment.body.id.toString()}`)
      .set(createBearerAuthorizationHeader(token2.body.accessToken))
      .send({
        content: 'co content content content',
      })
      .expect(HttpStatus.FORBIDDEN);
  });
});

describe(`Endpoint (DELETE) -/comments`, () => {
  it('Should deleteBlogById comment', async () => {
    const login = 'testLogin';
    const password = 'string';

    await request(app.getHttpServer())
      .post(`${APP_PREFIX}/sa/users`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .send({
        login,
        password,
        email: 'example@example.com',
      })
      .expect(HttpStatus.CREATED);

    const token = await request(app.getHttpServer())
      .post(`${APP_PREFIX}/auth/login`)
      .send({
        loginOrEmail: login,
        password,
      });

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

    const postList = testSeeder.createPostListDto(3, blogId);

    const newPostList: Post[] = [];

    for (const post of postList) {
      const result: Post[] = await dataSource.query(
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

      newPostList.push(...result);
    }

    const postId = newPostList[0].id;

    const comment = await request(app.getHttpServer())
      .post(`${APP_PREFIX}/posts/${postId}/comments`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .send({
        content: 'content content content',
      })
      .expect(HttpStatus.CREATED);

    await request(app.getHttpServer())
      .put(`${APP_PREFIX}/comments/${comment.body.id.toString()}`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .send({
        content: 'content content content content',
      })
      .expect(HttpStatus.NO_CONTENT);

    await request(app.getHttpServer())
      .delete(`${APP_PREFIX}/comments/${comment.body.id.toString()}`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .expect(HttpStatus.NO_CONTENT);
  });

  it(`Should getUserById ${HttpStatus.UNAUTHORIZED}`, async () => {
    const login = 'testLogin';
    const password = 'string';

    await request(app.getHttpServer())
      .post(`${APP_PREFIX}/sa/users`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .send({
        login,
        password,
        email: 'example@example.com',
      })
      .expect(HttpStatus.CREATED);

    const token = await request(app.getHttpServer())
      .post(`${APP_PREFIX}/auth/login`)
      .send({
        loginOrEmail: login,
        password,
      });

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

    const postList = testSeeder.createPostListDto(3, blogId);

    const newPostList: Post[] = [];

    for (const post of postList) {
      const result: Post[] = await dataSource.query(
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

      newPostList.push(...result);
    }

    const postId = newPostList[0].id;

    const comment = await request(app.getHttpServer())
      .post(`${APP_PREFIX}/posts/${postId}/comments`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .send({
        content: 'content content content',
      })
      .expect(HttpStatus.CREATED);

    await request(app.getHttpServer())
      .delete(`${APP_PREFIX}/comments/${comment.body.id.toString()}`)
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it(`Should getUserById ${HttpStatus.NOT_FOUND}`, async () => {
    const login = 'testLogin';
    const password = 'string';

    await request(app.getHttpServer())
      .post(`${APP_PREFIX}/sa/users`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .send({
        login,
        password,
        email: 'example@example.com',
      })
      .expect(HttpStatus.CREATED);

    const token = await request(app.getHttpServer())
      .post(`${APP_PREFIX}/auth/login`)
      .send({
        loginOrEmail: login,
        password,
      });

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

    const postList = testSeeder.createPostListDto(3, blogId);

    const newPostList: Post[] = [];

    for (const post of postList) {
      const result: Post[] = await dataSource.query(
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

      newPostList.push(...result);
    }

    const postId = newPostList[0].id;

    await request(app.getHttpServer())
      .post(`${APP_PREFIX}/posts/${postId}/comments`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .send({
        content: 'content content content',
      })
      .expect(HttpStatus.CREATED);

    await request(app.getHttpServer())
      .delete(`${APP_PREFIX}/comments/${ID}`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .send({
        content: 'co content content content',
      })
      .expect(HttpStatus.NOT_FOUND);
  });

  it(`Should getUserById ${HttpStatus.FORBIDDEN}`, async () => {
    const login = 'testLogin';
    const password = 'string';

    const login2 = 'testLogin2';
    const password2 = 'string2';

    await request(app.getHttpServer())
      .post(`${APP_PREFIX}/sa/users`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .send({
        login,
        password,
        email: 'example@example.com',
      })
      .expect(HttpStatus.CREATED);

    await request(app.getHttpServer())
      .post(`${APP_PREFIX}/sa/users`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .send({
        login: login2,
        password: password2,
        email: 'exame@example.com',
      })
      .expect(HttpStatus.CREATED);

    const token = await request(app.getHttpServer())
      .post(`${APP_PREFIX}/auth/login`)
      .send({
        loginOrEmail: login,
        password,
      });

    const token2 = await request(app.getHttpServer())
      .post(`${APP_PREFIX}/auth/login`)
      .send({
        loginOrEmail: login2,
        password: password2,
      });

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

    const postList = testSeeder.createPostListDto(3, blogId);

    const newPostList: Post[] = [];

    for (const post of postList) {
      const result: Post[] = await dataSource.query(
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

      newPostList.push(...result);
    }

    const postId = newPostList[0].id;

    const comment = await request(app.getHttpServer())
      .post(`${APP_PREFIX}/posts/${postId}/comments`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .send({
        content: 'content content content',
      })
      .expect(HttpStatus.CREATED);

    await request(app.getHttpServer())
      .delete(`${APP_PREFIX}/comments/${comment.body.id.toString()}`)
      .set(createBearerAuthorizationHeader(token2.body.accessToken))
      .send({
        content: 'co content content content',
      })
      .expect(HttpStatus.FORBIDDEN);
  });
});

describe(`Endpoint (PUT) - /:commentId/like-status`, () => {
  it('Should create like', async () => {
    const login = 'testLogin';
    const password = 'string';

    await request(app.getHttpServer())
      .post(`${APP_PREFIX}/sa/users`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .send({
        login,
        password,
        email: 'example@example.com',
      })
      .expect(HttpStatus.CREATED);

    const token = await request(app.getHttpServer())
      .post(`${APP_PREFIX}/auth/login`)
      .send({
        loginOrEmail: login,
        password,
      });

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

    const postList = testSeeder.createPostListDto(3, blogId);

    const newPostList: Post[] = [];

    for (const post of postList) {
      const result: Post[] = await dataSource.query(
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

      newPostList.push(...result);
    }

    const postId = newPostList[0].id;

    const userList = await dataSource.query(
      `
    select * from users u
    where login = $1
    `,
      [login],
    );

    const userId = userList[0].id;

    const newComment = testSeeder.createCommentDto(userId, postId);

    const result: Comment[] = await dataSource.query(
      `
      INSERT INTO comments (content, user_id, user_login, post_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `,
      [
        newComment.content,
        newComment.userId,
        newComment.userLogin,
        newComment.postId,
      ],
    );

    const commentId = result[0].id;

    await request(app.getHttpServer())
      .put(`${APP_PREFIX}/comments/${commentId}/like-status`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .send({
        likeStatus: LikeStatusEnum.LIKE,
      })
      .expect(HttpStatus.NO_CONTENT);

    const res = await request(app.getHttpServer())
      .get(`${APP_PREFIX}/comments/${commentId}`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .expect(HttpStatus.OK);

    expect(res.body).toEqual(
      expect.objectContaining({
        likesInfo: {
          dislikesCount: 0,
          likesCount: 1,
          myStatus: LikeStatusEnum.LIKE,
        },
      }),
    );
  });

  it('Should change Like to Dislike', async () => {
    const login = 'testLogin';
    const password = 'string';

    await request(app.getHttpServer())
      .post(`${APP_PREFIX}/sa/users`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .send({
        login,
        password,
        email: 'example@example.com',
      })
      .expect(HttpStatus.CREATED);

    const token = await request(app.getHttpServer())
      .post(`${APP_PREFIX}/auth/login`)
      .send({
        loginOrEmail: login,
        password,
      });

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

    const postList = testSeeder.createPostListDto(3, blogId);

    const newPostList: Post[] = [];

    for (const post of postList) {
      const result: Post[] = await dataSource.query(
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

      newPostList.push(...result);
    }

    const postId = newPostList[0].id;

    const userList = await dataSource.query(
      `
    select * from users u
    where login = $1
    `,
      [login],
    );

    const userId = userList[0].id;

    const newComment = testSeeder.createCommentDto(userId, postId);

    const result: Comment[] = await dataSource.query(
      `
      INSERT INTO comments (content, user_id, user_login, post_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `,
      [
        newComment.content,
        newComment.userId,
        newComment.userLogin,
        newComment.postId,
      ],
    );

    const commentId = result[0].id;

    await request(app.getHttpServer())
      .put(`${APP_PREFIX}/comments/${commentId}/like-status`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .send({
        likeStatus: LikeStatusEnum.LIKE,
      })
      .expect(HttpStatus.NO_CONTENT);

    await request(app.getHttpServer())
      .put(`${APP_PREFIX}/comments/${commentId}/like-status`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .send({
        likeStatus: LikeStatusEnum.DISLIKE,
      })
      .expect(HttpStatus.NO_CONTENT);

    const res = await request(app.getHttpServer())
      .get(`${APP_PREFIX}/comments/${commentId}`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .expect(HttpStatus.OK);

    expect(res.body).toEqual(
      expect.objectContaining({
        likesInfo: {
          dislikesCount: 1,
          likesCount: 0,
          myStatus: LikeStatusEnum.DISLIKE,
        },
      }),
    );
  });

  it('Should change Like to None', async () => {
    const login = 'testLogin';
    const password = 'string';

    await request(app.getHttpServer())
      .post(`${APP_PREFIX}/sa/users`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .send({
        login,
        password,
        email: 'example@example.com',
      })
      .expect(HttpStatus.CREATED);

    const token = await request(app.getHttpServer())
      .post(`${APP_PREFIX}/auth/login`)
      .send({
        loginOrEmail: login,
        password,
      });

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

    const postList = testSeeder.createPostListDto(3, blogId);

    const newPostList: Post[] = [];

    for (const post of postList) {
      const result: Post[] = await dataSource.query(
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

      newPostList.push(...result);
    }

    const postId = newPostList[0].id;

    const userList = await dataSource.query(
      `
    select * from users u
    where login = $1
    `,
      [login],
    );

    const userId = userList[0].id;

    const newComment = testSeeder.createCommentDto(userId, postId);

    const result: Comment[] = await dataSource.query(
      `
      INSERT INTO comments (content, user_id, user_login, post_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `,
      [
        newComment.content,
        newComment.userId,
        newComment.userLogin,
        newComment.postId,
      ],
    );

    const commentId = result[0].id;

    await request(app.getHttpServer())
      .put(`${APP_PREFIX}/comments/${commentId}/like-status`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .send({
        likeStatus: LikeStatusEnum.LIKE,
      })
      .expect(HttpStatus.NO_CONTENT);

    await request(app.getHttpServer())
      .put(`${APP_PREFIX}/comments/${commentId}/like-status`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .send({
        likeStatus: LikeStatusEnum.NONE,
      })
      .expect(HttpStatus.NO_CONTENT);

    const res = await request(app.getHttpServer())
      .get(`${APP_PREFIX}/comments/${commentId}`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .expect(HttpStatus.OK);

    expect(res.body).toEqual(
      expect.objectContaining({
        likesInfo: {
          dislikesCount: 0,
          likesCount: 0,
          myStatus: LikeStatusEnum.NONE,
        },
      }),
    );
  });

  it('Should change Like to Like', async () => {
    const login = 'testLogin';
    const password = 'string';

    await request(app.getHttpServer())
      .post(`${APP_PREFIX}/sa/users`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .send({
        login,
        password,
        email: 'example@example.com',
      })
      .expect(HttpStatus.CREATED);

    const token = await request(app.getHttpServer())
      .post(`${APP_PREFIX}/auth/login`)
      .send({
        loginOrEmail: login,
        password,
      });

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

    const postList = testSeeder.createPostListDto(3, blogId);

    const newPostList: Post[] = [];

    for (const post of postList) {
      const result: Post[] = await dataSource.query(
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

      newPostList.push(...result);
    }

    const postId = newPostList[0].id;

    const userList = await dataSource.query(
      `
    select * from users u
    where login = $1
    `,
      [login],
    );

    const userId = userList[0].id;

    const newComment = testSeeder.createCommentDto(userId, postId);

    const result: Comment[] = await dataSource.query(
      `
      INSERT INTO comments (content, user_id, user_login, post_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `,
      [
        newComment.content,
        newComment.userId,
        newComment.userLogin,
        newComment.postId,
      ],
    );

    const commentId = result[0].id;

    await request(app.getHttpServer())
      .put(`${APP_PREFIX}/comments/${commentId}/like-status`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .send({
        likeStatus: LikeStatusEnum.LIKE,
      })
      .expect(HttpStatus.NO_CONTENT);

    await request(app.getHttpServer())
      .put(`${APP_PREFIX}/comments/${commentId}/like-status`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .send({
        likeStatus: LikeStatusEnum.LIKE,
      })
      .expect(HttpStatus.NO_CONTENT);

    const res = await request(app.getHttpServer())
      .get(`${APP_PREFIX}/comments/${commentId}`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .expect(HttpStatus.OK);

    expect(res.body).toEqual(
      expect.objectContaining({
        likesInfo: {
          dislikesCount: 0,
          likesCount: 1,
          myStatus: LikeStatusEnum.LIKE,
        },
      }),
    );
  });

  it(`Should getUserById ${HttpStatus.BAD_REQUEST}`, async () => {
    const login = 'testLogin';
    const password = 'string';

    await request(app.getHttpServer())
      .post(`${APP_PREFIX}/sa/users`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .send({
        login,
        password,
        email: 'example@example.com',
      })
      .expect(HttpStatus.CREATED);

    const token = await request(app.getHttpServer())
      .post(`${APP_PREFIX}/auth/login`)
      .send({
        loginOrEmail: login,
        password,
      });

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

    const postList = testSeeder.createPostListDto(3, blogId);

    const newPostList: Post[] = [];

    for (const post of postList) {
      const result: Post[] = await dataSource.query(
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

      newPostList.push(...result);
    }

    const postId = newPostList[0].id;

    const userList = await dataSource.query(
      `
    select * from users u
    where login = $1
    `,
      [login],
    );

    const userId = userList[0].id;

    const newComment = testSeeder.createCommentDto(userId, postId);

    const result: Comment[] = await dataSource.query(
      `
      INSERT INTO comments (content, user_id, user_login, post_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `,
      [
        newComment.content,
        newComment.userId,
        newComment.userLogin,
        newComment.postId,
      ],
    );

    const commentId = result[0].id;

    await request(app.getHttpServer())
      .put(`${APP_PREFIX}/comments/${commentId}/like-status`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .send({
        likeStatus: '',
      })
      .expect(HttpStatus.BAD_REQUEST);
  });

  it(`Should getUserById ${HttpStatus.UNAUTHORIZED}`, async () => {
    const login = 'testLogin';
    const password = 'string';

    await request(app.getHttpServer())
      .post(`${APP_PREFIX}/sa/users`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .send({
        login,
        password,
        email: 'example@example.com',
      })
      .expect(HttpStatus.CREATED);

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

    const postList = testSeeder.createPostListDto(3, blogId);

    const newPostList: Post[] = [];

    for (const post of postList) {
      const result: Post[] = await dataSource.query(
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

      newPostList.push(...result);
    }

    const postId = newPostList[0].id;

    const userList = await dataSource.query(
      `
    select * from users u
    where login = $1
    `,
      [login],
    );

    const userId = userList[0].id;

    const newComment = testSeeder.createCommentDto(userId, postId);

    const result: Comment[] = await dataSource.query(
      `
      INSERT INTO comments (content, user_id, user_login, post_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `,
      [
        newComment.content,
        newComment.userId,
        newComment.userLogin,
        newComment.postId,
      ],
    );

    const commentId = result[0].id;

    await request(app.getHttpServer())
      .put(`${APP_PREFIX}/comments/${commentId}/like-status`)
      .set(createBearerAuthorizationHeader(''))
      .send({
        likeStatus: '',
      })
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it(`Should getUserById ${HttpStatus.NOT_FOUND}`, async () => {
    const login = 'testLogin';
    const password = 'string';

    await request(app.getHttpServer())
      .post(`${APP_PREFIX}/sa/users`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .send({
        login,
        password,
        email: 'example@example.com',
      })
      .expect(HttpStatus.CREATED);

    const token = await request(app.getHttpServer())
      .post(`${APP_PREFIX}/auth/login`)
      .send({
        loginOrEmail: login,
        password,
      });

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

    const postList = testSeeder.createPostListDto(3, blogId);

    const newPostList: Post[] = [];

    for (const post of postList) {
      const result: Post[] = await dataSource.query(
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

      newPostList.push(...result);
    }

    const postId = newPostList[0].id;

    const userList = await dataSource.query(
      `
    select * from users u
    where login = $1
    `,
      [login],
    );

    const userId = userList[0].id;

    const newComment = testSeeder.createCommentDto(userId, postId);

    await dataSource.query(
      `
      INSERT INTO comments (content, user_id, user_login, post_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `,
      [
        newComment.content,
        newComment.userId,
        newComment.userLogin,
        newComment.postId,
      ],
    );

    await request(app.getHttpServer())
      .put(`${APP_PREFIX}/comments/${ID}/like-status`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .send({
        likeStatus: LikeStatusEnum.LIKE,
      })
      .expect(HttpStatus.NOT_FOUND);
  });
});
