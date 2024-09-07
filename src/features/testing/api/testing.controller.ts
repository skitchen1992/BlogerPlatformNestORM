import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@SkipThrottle()
@Controller('testing')
export class TestingController {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  @Delete('all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete() {
    const tables = ['users', 'blogs', 'posts'];

    for (const table of tables) {
      await this.dataSource.query(
        `TRUNCATE TABLE ${table} RESTART IDENTITY CASCADE`,
      );
    }
  }
}
