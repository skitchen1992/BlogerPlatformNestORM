import { getPageCount } from '@utils/pagination';
import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PostOutputDto } from '@features/posts/api/dto/output/post.output.dto';

export class PostQuery {
  /**
   * Default value : createdAt
   */
  @IsOptional()
  @IsString()
  sortBy?: string;
  /**
   * Default value: desc
   * Available values : asc, desc
   */
  @IsOptional()
  @IsIn(['asc', 'desc'], {
    message: 'sortDirection must be either asc or desc',
  })
  sortDirection?: 'asc' | 'desc';
  /**
   * pageNumber is number of portions that should be returned
   * Default value : 1
   */
  @IsOptional()
  @IsInt()
  @Min(1, { message: 'pageNumber must be at least 1' })
  @Type(() => Number)
  pageNumber?: string;
  /**
   * pageSize is portions size that should be returned
   * Default value : 10
   */
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  pageSize?: string;
}

export class PostOutputPaginationDto {
  items: PostOutputDto[];
  totalCount: number;
  pageSize: number;
  page: number;
  pagesCount: number;
}

// MAPPERS

export const PostOutputPaginationDtoMapper = (
  posts: PostOutputDto[],
  totalCount: number,
  pageSize: number,
  page: number,
): PostOutputPaginationDto => {
  const outputDto = new PostOutputPaginationDto();

  outputDto.items = posts;
  outputDto.totalCount = totalCount;
  outputDto.pageSize = pageSize;
  outputDto.page = page;
  outputDto.pagesCount = getPageCount(totalCount, pageSize);

  return outputDto;
};
