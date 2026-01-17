import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1700000000000 implements MigrationInterface {
  name = 'Init1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    await queryRunner.query(`
      CREATE TABLE "stores" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar(200) NOT NULL,
        "phone" varchar(30),
        "address" varchar(255),
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "customers" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "full_name" varchar(120) NOT NULL,
        "phone" varchar(30),
        "email" varchar(150),
        "address" varchar(255),
        "notes" text,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_customers_phone" UNIQUE ("phone")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "vehicles" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "customer_id" uuid NOT NULL,
        "vin" varchar(40),
        "make" varchar(60) NOT NULL,
        "model" varchar(60) NOT NULL,
        "year" int,
        "plate_number" varchar(20),
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_vehicles_vin" UNIQUE ("vin"),
        CONSTRAINT "FK_vehicles_customer" FOREIGN KEY ("customer_id")
          REFERENCES "customers"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query('CREATE INDEX "IDX_vehicles_customer" ON "vehicles" ("customer_id")');

    await queryRunner.query(`
      CREATE TABLE "parts" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar(160) NOT NULL,
        "sku" varchar(60) NOT NULL,
        "brand" varchar(80),
        "price" numeric(12,2) NOT NULL,
        "stock" int NOT NULL DEFAULT 0,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_parts_sku" UNIQUE ("sku")
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "order_status_enum" AS ENUM ('PENDING', 'PAID', 'CANCELLED')
    `);

    await queryRunner.query(`
      CREATE TABLE "orders" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "store_id" uuid NOT NULL,
        "customer_id" uuid NOT NULL,
        "vehicle_id" uuid,
        "total_amount" numeric(12,2) NOT NULL DEFAULT 0,
        "status" "order_status_enum" NOT NULL DEFAULT 'PENDING',
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "FK_orders_store" FOREIGN KEY ("store_id")
          REFERENCES "stores"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_orders_customer" FOREIGN KEY ("customer_id")
          REFERENCES "customers"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_orders_vehicle" FOREIGN KEY ("vehicle_id")
          REFERENCES "vehicles"("id") ON DELETE SET NULL
      )
    `);
    await queryRunner.query('CREATE INDEX "IDX_orders_store" ON "orders" ("store_id")');
    await queryRunner.query('CREATE INDEX "IDX_orders_customer" ON "orders" ("customer_id")');
    await queryRunner.query('CREATE INDEX "IDX_orders_vehicle" ON "orders" ("vehicle_id")');

    await queryRunner.query(`
      CREATE TABLE "order_items" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "order_id" uuid NOT NULL,
        "part_id" uuid NOT NULL,
        "quantity" int NOT NULL,
        "unit_price" numeric(12,2) NOT NULL,
        "line_total" numeric(12,2) NOT NULL,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "FK_order_items_order" FOREIGN KEY ("order_id")
          REFERENCES "orders"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_order_items_part" FOREIGN KEY ("part_id")
          REFERENCES "parts"("id") ON DELETE RESTRICT
      )
    `);
    await queryRunner.query('CREATE INDEX "IDX_order_items_order" ON "order_items" ("order_id")');
    await queryRunner.query('CREATE INDEX "IDX_order_items_part" ON "order_items" ("part_id")');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "order_items"');
    await queryRunner.query('DROP TABLE IF EXISTS "orders"');
    await queryRunner.query('DROP TYPE IF EXISTS "order_status_enum"');
    await queryRunner.query('DROP TABLE IF EXISTS "parts"');
    await queryRunner.query('DROP TABLE IF EXISTS "vehicles"');
    await queryRunner.query('DROP TABLE IF EXISTS "customers"');
    await queryRunner.query('DROP TABLE IF EXISTS "stores"');
  }
}
