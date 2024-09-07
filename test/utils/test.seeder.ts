import { getCurrentISOStringDate } from '@utils/dates';
import { User } from '@features/users/domain/user.entity';
import { NewUserDto } from '@features/users/api/dto/new-user.dto';
import { NewBlogDto } from '@features/blogs/api/dto/new-blog.dto';
import { NewPostDto } from '@features/posts/api/dto/new-post.dto';
import { v4 as uuidv4 } from 'uuid';
import { NewCommentDto } from '@features/comments/api/dto/new-comment.dto';
import { NewLikeDto } from '@features/likes/api/dto/new-like.dto';
import {
  LikeStatusEnum,
  ParentTypeEnum,
} from '@features/likes/domain/likes.entity';

export const testSeeder = {
  createUserDto(): NewUserDto {
    return {
      login: 'test',
      email: 'test@gmail.com',
      password: '123456789',
    };
  },

  createUserDtoHashPass(hashPass: string): User {
    return {
      id: '',
      login: 'test',
      email: 'test@gmail.com',
      password: hashPass,
      created_at: getCurrentISOStringDate(),
    };
  },

  createUserListDto(count: number, pass?: string): User[] {
    return new Array(count).fill(null).map((item, index) => {
      return {
        id: '',
        login: `test${index}`,
        email: `test${index}@gmail.com`,
        password: pass || `123456789${index}`,
        created_at: getCurrentISOStringDate(),
      };
    });
  },

  createBlogDto(): NewBlogDto {
    return {
      name: 'Test',
      description: 'Test description',
      websiteUrl: 'https://string.com',
      isMembership: false,
    };
  },

  createBlogListDto(count: number): NewBlogDto[] {
    return new Array(count).fill(null).map((item, i): NewBlogDto => {
      return {
        name: `Test${i}`,
        description: `Test description${i}`,
        websiteUrl: `https://string${i}.com`,
        isMembership: false,
      };
    });
  },

  createPostDto(blogId: string): NewPostDto {
    return {
      title: 'Nikita',
      shortDescription: 'ShortDescription',
      content: 'Content',
      blogId,
      blogName: 'Blog name',
    };
  },

  createPostListDto(count: number, blogId: string): NewPostDto[] {
    return new Array(count).fill(null).map((item, i): NewPostDto => {
      return {
        title: `Nikita${i}`,
        shortDescription: `ShortDescription${i}`,
        content: `Content${i}`,
        blogId,
        blogName: `Blog name${i}`,
      };
    });
  },

  createDocumentsDto() {
    return {
      ip: '1',
      url: 'url',
      date: getCurrentISOStringDate(),
    };
  },

  createDocumentsListDto(count: number) {
    return new Array(count).fill(null).map(() => {
      return {
        ip: '1',
        url: 'url',
        date: getCurrentISOStringDate(),
      };
    });
  },

  createCommentDto(userId = uuidv4(), postId = uuidv4()): NewCommentDto {
    return {
      content: 'Content Content Content',
      userId,
      userLogin: 'login',
      postId,
    };
  },

  createPostLikeDto(): NewLikeDto {
    return {
      status: LikeStatusEnum.LIKE,
      authorId: uuidv4(),
      parentId: uuidv4(),
      parentType: ParentTypeEnum.POST,
    };
  },

  createPostLikeListDto(
    count: number,
    parentId: string,
    status: LikeStatusEnum,
    parentType: ParentTypeEnum,
    authorId = uuidv4(),
  ): NewLikeDto[] {
    return new Array(count).fill(null).map((): NewLikeDto => {
      return {
        status,
        authorId,
        parentId,
        parentType,
      };
    });
  },
};
