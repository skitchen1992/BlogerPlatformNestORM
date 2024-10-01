import { MigrationInterface, QueryRunner } from "typeorm";

export class Test11726550970831 implements MigrationInterface {
    name = 'Test11726550970831'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "tester" character varying COLLATE "C" NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "tester"`);
    }

}
