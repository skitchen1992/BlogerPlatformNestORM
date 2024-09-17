import { MigrationInterface, QueryRunner } from "typeorm";

export class Comments1726592399358 implements MigrationInterface {
    name = 'Comments1726592399358'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comments" DROP COLUMN "user_login"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comments" ADD "user_login" character varying(255) NOT NULL`);
    }

}
