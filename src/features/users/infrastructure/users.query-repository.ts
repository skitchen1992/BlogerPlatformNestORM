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
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@features/users/domain/user.entity';

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  public async getById(userId: string): Promise<UserOutputDto | null> {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return null;
    }

    return UserOutputDtoMapper(user);
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

    // Проверка корректности направления сортировки
    const validSortDirections = ['asc', 'desc'];
    const direction = validSortDirections.includes(sortDirection)
      ? sortDirection
      : 'desc';

    // Проверка корректности поля сортировки
    const validSortFields = ['created_at', 'login', 'email'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';

    // Формирование запроса через QueryBuilder
    const queryBuilder = this.userRepository
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.emailConfirmation', 'ec')
      .leftJoinAndSelect('u.recoveryCode', 'rc');

    // Условия поиска по login и email
    if (searchLoginTerm && searchEmailTerm) {
      queryBuilder.andWhere(
        '(u.login ILIKE :searchLogin OR u.email ILIKE :searchEmail)',
        {
          searchLogin: `%${searchLoginTerm}%`,
          searchEmail: `%${searchEmailTerm}%`,
        },
      );
    } else if (searchLoginTerm) {
      queryBuilder.andWhere('u.login ILIKE :searchLogin', {
        searchLogin: `%${searchLoginTerm}%`,
      });
    } else if (searchEmailTerm) {
      queryBuilder.andWhere('u.email ILIKE :searchEmail', {
        searchEmail: `%${searchEmailTerm}%`,
      });
    }

    // Применение сортировки и пагинации
    queryBuilder
      .addOrderBy(`u.${sortField}`, direction.toUpperCase() as 'ASC' | 'DESC')
      .skip((Number(pageNumber) - 1) * Number(pageSize))
      .take(Number(pageSize));

    // Выполнение запроса и получение результатов
    const [users, totalCount] = await queryBuilder.getManyAndCount();

    // Применение мапперов для преобразования данных в DTO
    const userList = users.map((user) => UserOutputDtoMapper(user));

    return UserOutputPaginationDtoMapper(
      userList,
      totalCount,
      Number(pageSize),
      Number(pageNumber),
    );
  }
}
