import { Module } from '@nestjs/common';

import { TestingController } from '@features/testing/api/testing.controller';

@Module({
  imports: [],
  providers: [],
  controllers: [TestingController],
  exports: [],
})
export class TestingModule {}
