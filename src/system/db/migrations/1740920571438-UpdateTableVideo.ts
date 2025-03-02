import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTableVideo1740920571438 implements MigrationInterface {
  name = 'UpdateTableVideo1740920571438';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "videos" DROP COLUMN "path"`);
    await queryRunner.query(
      `ALTER TABLE "videos" ADD "id_video" character varying(100) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "videos" ADD "id_video_processed" character varying(100) NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "videos" DROP COLUMN "id_video_processed"`,
    );
    await queryRunner.query(`ALTER TABLE "videos" DROP COLUMN "id_video"`);
    await queryRunner.query(
      `ALTER TABLE "videos" ADD "path" character varying(100) NOT NULL`,
    );
  }
}
