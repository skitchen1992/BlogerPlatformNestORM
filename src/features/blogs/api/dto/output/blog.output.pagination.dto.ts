import { getPageCount } from '@utils/pagination';
import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { BlogOutputDto } from '@features/blogs/api/dto/output/blog.output.dto';

export class BlogsQuery {
  /**
   * Search term for blog Name: Name should contain this term in any position
   * Default value : null
   */
  @IsOptional()
  @IsString()
  searchNameTerm?: string;
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

export class BlogOutputPaginationDto {
  items: BlogOutputDto[];
  totalCount: number;
  pageSize: number;
  page: number;
  pagesCount: number;
}

// MAPPERS

export const BlogOutputPaginationDtoMapper = (
  blogs: BlogOutputDto[],
  totalCount: number,
  pageSize: number,
  page: number,
): BlogOutputPaginationDto => {
  const outputDto = new BlogOutputPaginationDto();

  outputDto.items = blogs;
  outputDto.totalCount = totalCount;
  outputDto.pageSize = pageSize;
  outputDto.page = page;
  outputDto.pagesCount = getPageCount(totalCount, pageSize);

  return outputDto;
};
