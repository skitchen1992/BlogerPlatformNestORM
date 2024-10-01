import { MigrationInterface, QueryRunner } from "typeorm";

export class Comments1726593271376 implements MigrationInterface {
    name = 'Comments1726593271376'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "likes" DROP CONSTRAINT "FK_f583e7580ba3e4c66a713b8a8fa"`);
        await queryRunner.query(`ALTER TABLE "likes" DROP COLUMN "authorId"`);
        await queryRunner.query(`ALTER TABLE "likes" ADD CONSTRAINT "FK_11f930ef5675078349464caba56" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "likes" DROP CONSTRAINT "FK_11f930ef5675078349464caba56"`);
        await queryRunner.query(`ALTER TABLE "likes" ADD "authorId" uuid`);
        await queryRunner.query(`ALTER TABLE "likes" ADD CONSTRAINT "FK_f583e7580ba3e4c66a713b8a8fa" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
