import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1741257178970 implements MigrationInterface {
    name = 'InitialMigration1741257178970'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "click" ("id" SERIAL NOT NULL, "ipAdress" character varying NOT NULL, "userAgent" character varying NOT NULL, "clickedAt" TIMESTAMP NOT NULL DEFAULT now(), "linkId" integer, CONSTRAINT "PK_4c018a5603e0d5e63fe022b0d97" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "link" ("id" SERIAL NOT NULL, "originalUrl" character varying NOT NULL, "title" character varying, "shortCode" character varying, "slug" character varying, "password" character varying, "expiresAt" TIMESTAMP, "qrCode" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "UQ_2206f315a07973a6b30317dafa0" UNIQUE ("shortCode"), CONSTRAINT "UQ_677e4ae10dfc2c255daa2979e67" UNIQUE ("slug"), CONSTRAINT "PK_26206fb7186da72fbb9eaa3fac9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_677e4ae10dfc2c255daa2979e6" ON "link" ("slug") `);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "plan" "public"."user_plan_enum" NOT NULL DEFAULT 'free', "username" character varying NOT NULL, "role" "public"."user_role_enum" NOT NULL DEFAULT 'user', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "click" ADD CONSTRAINT "FK_13f4beaa9faba6df2eb290243d5" FOREIGN KEY ("linkId") REFERENCES "link"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "link" ADD CONSTRAINT "FK_14a562b14bb83fc8ba73d30d3e0" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "link" DROP CONSTRAINT "FK_14a562b14bb83fc8ba73d30d3e0"`);
        await queryRunner.query(`ALTER TABLE "click" DROP CONSTRAINT "FK_13f4beaa9faba6df2eb290243d5"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_677e4ae10dfc2c255daa2979e6"`);
        await queryRunner.query(`DROP TABLE "link"`);
        await queryRunner.query(`DROP TABLE "click"`);
    }

}
