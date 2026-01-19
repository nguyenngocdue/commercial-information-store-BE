import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameCustomersToUsers1700000000001
  implements MigrationInterface
{
  name = 'RenameCustomersToUsers1700000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "customers" RENAME TO "users"');
    await queryRunner.query(
      'ALTER TABLE "users" RENAME CONSTRAINT "UQ_customers_phone" TO "UQ_users_phone"',
    );

    await queryRunner.query(
      'ALTER TABLE "vehicles" RENAME COLUMN "customer_id" TO "user_id"',
    );
    await queryRunner.query(
      'ALTER TABLE "orders" RENAME COLUMN "customer_id" TO "user_id"',
    );

    await queryRunner.query(
      'ALTER INDEX "IDX_vehicles_customer" RENAME TO "IDX_vehicles_user"',
    );
    await queryRunner.query(
      'ALTER INDEX "IDX_orders_customer" RENAME TO "IDX_orders_user"',
    );

    await queryRunner.query(
      'ALTER TABLE "vehicles" RENAME CONSTRAINT "FK_vehicles_customer" TO "FK_vehicles_user"',
    );
    await queryRunner.query(
      'ALTER TABLE "orders" RENAME CONSTRAINT "FK_orders_customer" TO "FK_orders_user"',
    );

    await queryRunner.query(
      'ALTER TABLE "users" ADD COLUMN "role" varchar(30) NOT NULL DEFAULT \'user\'',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "users" DROP COLUMN "role"');

    await queryRunner.query(
      'ALTER TABLE "orders" RENAME CONSTRAINT "FK_orders_user" TO "FK_orders_customer"',
    );
    await queryRunner.query(
      'ALTER TABLE "vehicles" RENAME CONSTRAINT "FK_vehicles_user" TO "FK_vehicles_customer"',
    );

    await queryRunner.query(
      'ALTER INDEX "IDX_orders_user" RENAME TO "IDX_orders_customer"',
    );
    await queryRunner.query(
      'ALTER INDEX "IDX_vehicles_user" RENAME TO "IDX_vehicles_customer"',
    );

    await queryRunner.query(
      'ALTER TABLE "orders" RENAME COLUMN "user_id" TO "customer_id"',
    );
    await queryRunner.query(
      'ALTER TABLE "vehicles" RENAME COLUMN "user_id" TO "customer_id"',
    );

    await queryRunner.query(
      'ALTER TABLE "users" RENAME CONSTRAINT "UQ_users_phone" TO "UQ_customers_phone"',
    );
    await queryRunner.query('ALTER TABLE "users" RENAME TO "customers"');
  }
}
