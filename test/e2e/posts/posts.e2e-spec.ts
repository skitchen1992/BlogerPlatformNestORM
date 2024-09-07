import { APP_PREFIX } from '@settings/apply-app-setting';
import request from 'supertest';
import { apiSettings, app, dataSource } from '../../jest.setup';
import { HttpStatus } from '@nestjs/common';
import { testSeeder } from '../../utils/test.seeder';
import {
  Like,
  LikeStatusEnum,
  ParentTypeEnum,
} from '@features/likes/domain/likes.entity';
import {
  createAuthorizationHeader,
  createBearerAuthorizationHeader,
} from '../../utils/test-helpers';
import * as data from './dataset';
import {
  ExtendedLikesInfo,
  PostOutputDtoMapper,
} from '@features/posts/api/dto/output/post.output.dto';
import { ID } from '../../mocks/mocks';
import { Blog } from '@features/blogs/domain/blog.entity';
import { Post } from '@features/posts/domain/post.entity';
import { Comment } from '@features/comments/domain/comment.entity';

describe(`Endpoint (GET) - /posts`, () => {
  it('Should get empty array', async () => {
    const res = await request(app.getHttpServer())
      .get(`${APP_PREFIX}/posts`)
      .expect(HttpStatus.OK);

    expect(res.body.items.length).toBe(0);
  });

  it('Should get not empty array', async () => {
    const user = testSeeder.createUserDto();

    const userList = await dataSource.query(
      `
      INSERT INTO users (login, password, email)
      VALUES ($1, $2, $3)
      RETURNING *;
    `,
      [user.login, user.password, user.email],
    );

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

    const authorId = userList[0].id;

    const likesList: Like[] = await dataSource.query(
      `
      INSERT INTO likes (status, author_id, parent_id, parent_type)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `,
      [LikeStatusEnum.LIKE, authorId, postList[0].id, ParentTypeEnum.POST],
    );

    const extendedLikesInfo: ExtendedLikesInfo = {
      dislikesCount: 0,
      likesCount: 1,
      myStatus: LikeStatusEnum.NONE,
      newestLikes: [
        {
          addedAt: likesList[0].created_at.toISOString(),
          login: userList[0].login,
          userId: authorId,
        },
      ],
    };

    const res = await request(app.getHttpServer())
      .get(`${APP_PREFIX}/posts`)
      .expect(HttpStatus.OK);

    expect(res.body.items.length).toBe(1);

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

  it('Should get second page', async () => {
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

    const extendedLikesInfo = {
      dislikesCount: 0,
      likesCount: 0,
      myStatus: LikeStatusEnum.NONE,
      newestLikes: [],
    };

    const res = await request(app.getHttpServer())
      .get(`${APP_PREFIX}/posts?pageNumber=2&pageSize=2`)
      .expect(HttpStatus.OK);

    expect(res.body).toEqual({
      pagesCount: 2,
      page: 2,
      pageSize: 2,
      totalCount: 3,
      items: [PostOutputDtoMapper(newPostList[0], extendedLikesInfo)],
    });
  });
});

describe(`Endpoint (GET) by ID - /posts/:id`, () => {
  it('Should get a post', async () => {
    const user = testSeeder.createUserDto();

    const userList = await dataSource.query(
      `
      INSERT INTO users (login, password, email)
      VALUES ($1, $2, $3)
      RETURNING *;
    `,
      [user.login, user.password, user.email],
    );

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

    const authorId = userList[0].id;
    const postId = newPostList[0].id;

    const likesList: Like[] = await dataSource.query(
      `
      INSERT INTO likes (status, author_id, parent_id, parent_type)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `,
      [LikeStatusEnum.LIKE, authorId, newPostList[0].id, ParentTypeEnum.POST],
    );

    const extendedLikesInfo: ExtendedLikesInfo = {
      dislikesCount: 0,
      likesCount: 1,
      myStatus: LikeStatusEnum.NONE,
      newestLikes: [
        {
          addedAt: likesList[0].created_at.toISOString(),
          login: userList[0].login,
          userId: authorId,
        },
      ],
    };

    const res = await request(app.getHttpServer())
      .get(`${APP_PREFIX}/posts/${postId}`)
      .expect(HttpStatus.OK);

    expect(res.body).toEqual(
      PostOutputDtoMapper(newPostList[0], extendedLikesInfo),
    );
  });

  it(`Should get status ${HttpStatus.NOT_FOUND}`, async () => {
    await request(app.getHttpServer())
      .get(`${APP_PREFIX}/posts/${ID}`)
      .expect(HttpStatus.NOT_FOUND);
  });
});

describe(`Endpoint (POST) - /posts`, () => {
  it('Should add post', async () => {
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
    const blogName = blogList[0].name;

    const res = await request(app.getHttpServer())
      .post(`${APP_PREFIX}/posts`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .send({ ...data.dataSetNewPost0, blogId })
      .expect(HttpStatus.CREATED);

    expect(res.body).toEqual(
      expect.objectContaining({ ...data.dataSetNewPost0, blogId, blogName }),
    );
  });

  it('Should get error while blog not found', async () => {
    const res = await request(app.getHttpServer())
      .post(`${APP_PREFIX}/posts`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .send(data.dataSetNewPost0)
      .expect(HttpStatus.BAD_REQUEST);

    expect(res.body).toEqual(data.errorDataSet0);
  });

  it('Should get Error while field "title" is too long', async () => {
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
      .post(`${APP_PREFIX}/posts`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .send({ ...data.dataSetNewPost1, blogId: blogId })
      .expect(HttpStatus.BAD_REQUEST);

    expect(res.body).toEqual(data.errorDataSet1);
  });

  it('Should get Error while field "title" is not a string', async () => {
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
      .post(`${APP_PREFIX}/posts`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .send({ ...data.dataSetNewPost2, blogId: blogId })
      .expect(HttpStatus.BAD_REQUEST);

    expect(res.body).toEqual(data.errorDataSet2);
  });

  it('Should get Error while field "title" is empty', async () => {
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
      .post(`${APP_PREFIX}/posts`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .send({ ...data.dataSetNewPost3, blogId: blogId })
      .expect(HttpStatus.BAD_REQUEST);

    expect(res.body).toEqual(data.errorDataSet11);
  });

  it('Should get Error while field "shortDescription" is too long', async () => {
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
      .post(`${APP_PREFIX}/posts`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .send({ ...data.dataSetNewPost4, blogId: blogId })
      .expect(HttpStatus.BAD_REQUEST);

    expect(res.body).toEqual(data.errorDataSet12);
  });

  it('Should getUserById Error while field "shortDescription" is not a string', async () => {
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
      .post(`${APP_PREFIX}/posts`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .send({ ...data.dataSetNewPost5, blogId: blogId })
      .expect(HttpStatus.BAD_REQUEST);

    expect(res.body).toEqual(data.errorDataSet13);
  });

  it('Should getUserById Error while field "description" is empty', async () => {
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
      .post(`${APP_PREFIX}/posts`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .send({ ...data.dataSetNewPost6, blogId: blogId })
      .expect(HttpStatus.BAD_REQUEST);

    expect(res.body).toEqual(data.errorDataSet6);
  });

  it('Should getUserById Error while field "content" is too long', async () => {
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
      .post(`${APP_PREFIX}/posts`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .send({ ...data.dataSetNewPost7, blogId: blogId })
      .expect(HttpStatus.BAD_REQUEST);

    expect(res.body).toEqual(data.errorDataSet7);
  });

  it('Should getUserById Error while field "content" is not a string', async () => {
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
      .post(`${APP_PREFIX}/posts`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .send({ ...data.dataSetNewPost8, blogId: blogId })
      .expect(HttpStatus.BAD_REQUEST);

    expect(res.body).toEqual(data.errorDataSet8);
  });

  it('Should getUserById Error while field "content" is empty', async () => {
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
      .post(`${APP_PREFIX}/posts`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .send({ ...data.dataSetNewPost9, blogId: blogId })
      .expect(HttpStatus.BAD_REQUEST);

    expect(res.body).toEqual(data.errorDataSet14);
  });
});

describe(`Endpoint (PUT) - /posts/:id`, () => {
  it('Should updatePassword post', async () => {
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
      .put(`${APP_PREFIX}/posts/${postId}`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .send({ ...data.dataSetUpdatePost, blogId })
      .expect(HttpStatus.NO_CONTENT);
  });

  it('Should getUserById Error while field "title" is too long', async () => {
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

    const res = await request(app.getHttpServer())
      .put(`${APP_PREFIX}/posts/${postId}`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .send({ ...data.dataSetNewPost1, blogId })
      .expect(HttpStatus.BAD_REQUEST);

    expect(res.body).toEqual(data.errorDataSet1);
  });

  it('Should getUserById Error while field "title" is not a string', async () => {
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

    const res = await request(app.getHttpServer())
      .put(`${APP_PREFIX}/posts/${postId}`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .send({ ...data.dataSetNewPost2, blogId })
      .expect(HttpStatus.BAD_REQUEST);

    expect(res.body).toEqual(data.errorDataSet15);
  });

  it('Should getUserById Error while field "title" is empty', async () => {
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

    const res = await request(app.getHttpServer())
      .put(`${APP_PREFIX}/posts/${postId}`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .send({ ...data.dataSetNewPost3, blogId })
      .expect(HttpStatus.BAD_REQUEST);

    expect(res.body).toEqual(data.errorDataSet3);
  });

  it('Should getUserById Error while field "shortDescription" is too long', async () => {
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

    const res = await request(app.getHttpServer())
      .put(`${APP_PREFIX}/posts/${postId}`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .send({ ...data.dataSetNewPost4, blogId })
      .expect(HttpStatus.BAD_REQUEST);

    expect(res.body).toEqual(data.errorDataSet16);
  });

  it('Should getUserById Error while field "shortDescription" is not a string', async () => {
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

    const res = await request(app.getHttpServer())
      .put(`${APP_PREFIX}/posts/${postId}`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .send({ ...data.dataSetNewPost5, blogId })
      .expect(HttpStatus.BAD_REQUEST);

    expect(res.body).toEqual(data.errorDataSet5);
  });

  it('Should getUserById Error while field "description" is empty', async () => {
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

    const res = await request(app.getHttpServer())
      .put(`${APP_PREFIX}/posts/${postId}`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .send({ ...data.dataSetNewPost6, blogId })
      .expect(HttpStatus.BAD_REQUEST);

    expect(res.body).toEqual(data.errorDataSet17);
  });

  it('Should getUserById Error while field "content" is too long', async () => {
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

    const res = await request(app.getHttpServer())
      .put(`${APP_PREFIX}/posts/${postId}`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .send({ ...data.dataSetNewPost7, blogId })
      .expect(HttpStatus.BAD_REQUEST);

    expect(res.body).toEqual(data.errorDataSet7);
  });

  it('Should getUserById Error while field "content" is not a string', async () => {
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

    const res = await request(app.getHttpServer())
      .put(`${APP_PREFIX}/posts/${postId}`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .send({ ...data.dataSetNewPost8, blogId })
      .expect(HttpStatus.BAD_REQUEST);

    expect(res.body).toEqual(data.errorDataSet18);
  });

  it('Should getUserById Error while field "content" is empty', async () => {
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

    const res = await request(app.getHttpServer())
      .put(`${APP_PREFIX}/posts/${postId}`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .send({ ...data.dataSetNewPost9, blogId })
      .expect(HttpStatus.BAD_REQUEST);

    expect(res.body).toEqual(data.errorDataSet9);
  });

  it('Should getUserById Error while we add too many fields specified', async () => {
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
      .put(`${APP_PREFIX}/posts/${postId}`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .send({ ...data.dataSetNewPost10, blogId })
      .expect(HttpStatus.NO_CONTENT);
  });
});

describe(`Endpoint (DELETE) - /posts/:id`, () => {
  it('Should deleteBlogById post', async () => {
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
      .delete(`${APP_PREFIX}/posts/${postId}`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .expect(HttpStatus.NO_CONTENT);
  });

  it(`Should getUserById error ${HttpStatus.NOT_FOUND}`, async () => {
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

    await request(app.getHttpServer())
      .delete(`${APP_PREFIX}/posts/${ID}`)
      .set(
        createAuthorizationHeader(
          apiSettings.ADMIN_AUTH_USERNAME,
          apiSettings.ADMIN_AUTH_PASSWORD,
        ),
      )
      .expect(HttpStatus.NOT_FOUND);
  });
});

describe(`Endpoint (POST) - /:postId/comments`, () => {
  it('Should get created comment', async () => {
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

    const res = await request(app.getHttpServer())
      .post(`${APP_PREFIX}/posts/${postId}/comments`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .send({
        content: 'content content content',
      })
      .expect(HttpStatus.CREATED);

    expect(res.body).toEqual(
      expect.objectContaining({
        content: 'content content content',
        commentatorInfo: expect.objectContaining({ userLogin: login }),
        likesInfo: { likesCount: 0, dislikesCount: 0, myStatus: 'None' },
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

    await request(app.getHttpServer())
      .post(`${APP_PREFIX}/posts/${postId}/comments`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .send({
        content: 'c',
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

    await request(app.getHttpServer()).post(`${APP_PREFIX}/auth/login`).send({
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
      .post(`${APP_PREFIX}/posts/${postId.toString()}/comments`)
      .send({
        content: 'c',
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

    await request(app.getHttpServer())
      .post(`${APP_PREFIX}/posts/${ID}/comments`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .send({
        content: 'content content content',
      })
      .expect(HttpStatus.NOT_FOUND);
  });
});

describe(`Endpoint (GET) - /:postId/comments`, () => {
  it('Should getUserById empty array comment', async () => {
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

    const res = await request(app.getHttpServer())
      .get(`${APP_PREFIX}/posts/${postId}/comments`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .expect(HttpStatus.OK);

    expect(res.body).toEqual({
      pagesCount: 0,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: [],
    });
  });

  it('Should getUserById not empty array comment', async () => {
    const { login, password, email } = testSeeder.createUserDto();

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
        email,
      })
      .expect(HttpStatus.CREATED);

    const token = await request(app.getHttpServer())
      .post(`${APP_PREFIX}/auth/login`)
      .send({
        loginOrEmail: login,
        password,
      })
      .expect(HttpStatus.OK);
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

    const res = await request(app.getHttpServer())
      .get(`${APP_PREFIX}/posts/${postId}/comments`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .send({
        content: 'content content content',
      })
      .expect(HttpStatus.OK);

    expect(res.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 1,
      items: [
        expect.objectContaining({
          content: 'content content content',
          commentatorInfo: expect.objectContaining({ userLogin: login }),
          likesInfo: {
            dislikesCount: 0,
            likesCount: 0,
            myStatus: 'None',
          },
        }),
      ],
    });
  });

  it('Should getUserById comments with likes', async () => {
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

    const res = await request(app.getHttpServer())
      .get(`${APP_PREFIX}/posts/${postId}/comments`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .send({
        content: 'content content content',
      })
      .expect(HttpStatus.OK);

    expect(res.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 1,
      items: [
        expect.objectContaining({
          content: 'content content content',
          commentatorInfo: expect.objectContaining({ userLogin: login }),
          likesInfo: {
            dislikesCount: 0,
            likesCount: 0,
            myStatus: 'None',
          },
        }),
      ],
    });
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
      .get(`${APP_PREFIX}/posts/${ID}/comments`)
      .expect(HttpStatus.NOT_FOUND);
  });
});

describe(`Endpoint (PUT) - /:postId/like-status`, () => {
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

    await request(app.getHttpServer())
      .put(`${APP_PREFIX}/posts/${postId}/like-status`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .send({
        likeStatus: LikeStatusEnum.LIKE,
      })
      .expect(HttpStatus.NO_CONTENT);

    const res = await request(app.getHttpServer())
      .get(`${APP_PREFIX}/posts/${postId}`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .expect(HttpStatus.OK);

    expect(res.body).toEqual(
      expect.objectContaining({
        extendedLikesInfo: {
          dislikesCount: 0,
          likesCount: 1,
          myStatus: 'Like',
          newestLikes: [
            expect.objectContaining({
              login: 'testLogin',
            }),
          ],
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

    await request(app.getHttpServer())
      .put(`${APP_PREFIX}/posts/${postId}/like-status`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .send({
        likeStatus: LikeStatusEnum.LIKE,
      })
      .expect(HttpStatus.NO_CONTENT);

    await request(app.getHttpServer())
      .put(`${APP_PREFIX}/posts/${postId}/like-status`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .send({
        likeStatus: LikeStatusEnum.DISLIKE,
      })
      .expect(HttpStatus.NO_CONTENT);

    const res = await request(app.getHttpServer())
      .get(`${APP_PREFIX}/posts/${postId}`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .expect(HttpStatus.OK);

    expect(res.body).toEqual(
      expect.objectContaining({
        extendedLikesInfo: {
          dislikesCount: 1,
          likesCount: 0,
          myStatus: 'Dislike',
          newestLikes: [],
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

    await request(app.getHttpServer())
      .put(`${APP_PREFIX}/posts/${postId}/like-status`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .send({
        likeStatus: LikeStatusEnum.LIKE,
      })
      .expect(HttpStatus.NO_CONTENT);

    await request(app.getHttpServer())
      .put(`${APP_PREFIX}/posts/${postId}/like-status`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .send({
        likeStatus: LikeStatusEnum.NONE,
      })
      .expect(HttpStatus.NO_CONTENT);

    const res = await request(app.getHttpServer())
      .get(`${APP_PREFIX}/posts/${postId}`)
      .set(createBearerAuthorizationHeader(token.body.accessToken))
      .expect(HttpStatus.OK);

    expect(res.body).toEqual(
      expect.objectContaining({
        extendedLikesInfo: {
          dislikesCount: 0,
          likesCount: 0,
          myStatus: LikeStatusEnum.NONE,
          newestLikes: [],
        },
      }),
    );
  });

  it('Should change Like to Like', async () => {
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

    const token = await request(app.getHttpServer())
      .post(`${APP_PREFIX}/auth/login`)
      .send({
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

    const comment = testSeeder.createCommentDto(userId, postId);

    const result: Comment[] = await dataSource.query(
      `
      INSERT INTO comments (content, user_id, user_login, post_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `,
      [comment.content, comment.userId, comment.userLogin, comment.postId],
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

    const token = await request(app.getHttpServer())
      .post(`${APP_PREFIX}/auth/login`)
      .send({
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

    const comment = testSeeder.createCommentDto(userId, postId);

    const result: Comment[] = await dataSource.query(
      `
      INSERT INTO comments (content, user_id, user_login, post_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `,
      [comment.content, comment.userId, comment.userLogin, comment.postId],
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

    const comment = testSeeder.createCommentDto(userId, postId);

    const result: Comment[] = await dataSource.query(
      `
      INSERT INTO comments (content, user_id, user_login, post_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `,
      [comment.content, comment.userId, comment.userLogin, comment.postId],
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

    const token = await request(app.getHttpServer())
      .post(`${APP_PREFIX}/auth/login`)
      .send({
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

    const comment = testSeeder.createCommentDto(userId, postId);

    await dataSource.query(
      `
      INSERT INTO comments (content, user_id, user_login, post_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `,
      [comment.content, comment.userId, comment.userLogin, comment.postId],
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
