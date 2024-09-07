import { UserOutputDto } from '@features/users/api/dto/output/user.output.dto';
import { getPageCount } from '@utils/pagination';
import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UsersQuery {
  /**
   * Search term for user Login: Login should contain this term in any position
   * Default value : null
   */
  @IsOptional()
  @IsString()
  searchLoginTerm?: string;
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
  /**
   * Search term for user Email: Email should contains this term in any position
   * Default value : null
   */
  @IsOptional()
  @IsString()
  searchEmailTerm?: string;
}

export class UserOutputPaginationDto {
  items: UserOutputDto[];
  totalCount: number;
  pageSize: number;
  page: number;
  pagesCount: number;
}

// MAPPERS

export const UserOutputPaginationDtoMapper = (
  users: UserOutputDto[],
  totalCount: number,
  pageSize: number,
  page: number,
): UserOutputPaginationDto => {
  const outputDto = new UserOutputPaginationDto();

  outputDto.items = users;
  outputDto.totalCount = totalCount;
  outputDto.pageSize = pageSize;
  outputDto.page = page;
  outputDto.pagesCount = getPageCount(totalCount, pageSize);

  return outputDto;
};
