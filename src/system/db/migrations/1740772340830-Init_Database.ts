import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitDatabase1740772340830 implements MigrationInterface {
  name = 'InitDatabase1740772340830';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."videos_status_enum" AS ENUM('pendente', 'em processamento', 'pronto', 'erro')`,
    );
    await queryRunner.query(
      `CREATE TABLE "videos" ("id" SERIAL NOT NULL, "path" character varying(100) NOT NULL, "user" character varying(100) NOT NULL, "user_email" character varying(100) NOT NULL, "status" "public"."videos_status_enum" NOT NULL DEFAULT 'pendente', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e4c86c0cf95aff16e9fb8220f6b" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "videos"`);
    await queryRunner.query(`DROP TYPE "public"."videos_status_enum"`);
  }
}
