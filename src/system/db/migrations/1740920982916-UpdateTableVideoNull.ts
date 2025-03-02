import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTableVideoNull1740920982916 implements MigrationInterface {
    name = 'UpdateTableVideoNull1740920982916'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "videos" ALTER COLUMN "id_video" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "videos" ALTER COLUMN "id_video_processed" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "videos" ALTER COLUMN "user" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "videos" ALTER COLUMN "user_email" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "videos" ALTER COLUMN "user_email" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "videos" ALTER COLUMN "user" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "videos" ALTER COLUMN "id_video_processed" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "videos" ALTER COLUMN "id_video" SET NOT NULL`);
    }

}
