import { Injectable } from '@nestjs/common';
import {
  UserOutputDto,
  UserOutputDtoMapper,
} from '../api/dto/output/user.output.dto';
import {
  UsersQuery,
  UserOutputPaginationDto,
  UserOutputPaginationDtoMapper,
} from '@features/users/api/dto/output/user.output.pagination.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  public async getById(userId: string): Promise<UserOutputDto | null> {
    const user = await this.dataSource.query(
      `
SELECT  u.id, 
        u.login, 
        u.password, 
        u.email, 
        u.created_at,
        rc.is_confirmed AS recovery_is_confirmed,
        rc.confirmation_code AS recovery_confirmation_code,
        ec.is_confirmed AS email_is_confirmed,
        ec.confirmation_code AS email_confirmation_code,
        ec.expiration_date AS email_expiration_date FROM users u 
LEFT join email_confirmations ec ON u.id = ec.user_id 
LEFT join recovery_code rc ON u.id = rc.user_id
where u.id = $1
    `,
      [userId],
    );

    if (!Boolean(user.length)) {
      return null;
    }

    return UserOutputDtoMapper(user.at(0));
  }

  public async getAll(query: UsersQuery): Promise<UserOutputPaginationDto> {
    const {
      searchLoginTerm,
      searchEmailTerm,
      sortBy = 'createdAt',
      sortDirection = 'desc',
      pageNumber = 1,
      pageSize = 10,
    } = query;

    const validSortDirections = ['asc', 'desc'];
    const direction = validSortDirections.includes(sortDirection)
      ? sortDirection
      : 'desc';

    const validSortFields = ['created_at', 'login', 'email'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';

    let whereConditions = '';
    const queryParams: any[] = [];

    if (searchLoginTerm && searchEmailTerm) {
      whereConditions = `
      (u.login ~* $1 OR u.email ~* $2)
    `;
      queryParams.push(`.*${searchLoginTerm}.*`, `.*${searchEmailTerm}.*`);
    } else if (searchLoginTerm) {
      whereConditions = `u.login ~* $1`;
      queryParams.push(`.*${searchLoginTerm}.*`);
    } else if (searchEmailTerm) {
      whereConditions = `u.email ~* $1`;
      queryParams.push(`.*${searchEmailTerm}.*`);
    } else {
      whereConditions = 'TRUE'; // No search criteria, fetch all
    }

    // Добавляем COLLATE только для login и email
    const collateClause =
      sortField === 'login' || sortField === 'email' ? 'COLLATE "C"' : '';

    const users = await this.dataSource.query(
      `
    SELECT
        u.id,
        u.login,
        u.password,
        u.email,
        u.created_at,
        rc.is_confirmed AS recovery_is_confirmed,
        rc.confirmation_code AS recovery_confirmation_code,
        ec.is_confirmed AS email_is_confirmed,
        ec.confirmation_code AS email_confirmation_code,
        ec.expiration_date AS email_expiration_date
    FROM
        users u
    LEFT JOIN
        email_confirmations ec ON u.id = ec.user_id
    LEFT JOIN
        recovery_code rc ON u.id = rc.user_id
    WHERE
        ${whereConditions}
    ORDER BY
        ${sortField} ${collateClause} ${direction}
    LIMIT $${queryParams.length + 1}
    OFFSET $${queryParams.length + 2} * ($${queryParams.length + 3} - 1);
    `,
      [
        ...queryParams,
        pageSize, // LIMIT
        pageSize, // OFFSET calculation
        pageNumber, // used for OFFSET
      ],
    );

    const totalCount = await this.dataSource.query(
      `
    SELECT COUNT(*)::int AS count
    FROM users u
    WHERE
        ${whereConditions}
    `,
      queryParams,
    );

    const userList = users.map((user) => UserOutputDtoMapper(user));

    return UserOutputPaginationDtoMapper(
      userList,
      totalCount.at(0).count,
      Number(pageSize),
      Number(pageNumber),
    );
  }
}
