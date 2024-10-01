import { MigrationInterface, QueryRunner } from "typeorm";

export class Test11726551048943 implements MigrationInterface {
    name = 'Test11726551048943'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "tester"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "tester" character varying COLLATE "C" NOT NULL`);
    }

}
