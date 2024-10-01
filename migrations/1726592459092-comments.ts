import { MigrationInterface, QueryRunner } from "typeorm";

export class Comments1726592459092 implements MigrationInterface {
    name = 'Comments1726592459092'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comments" ADD "user_login" character varying(255) COLLATE "C" NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comments" DROP COLUMN "user_login"`);
    }

}
