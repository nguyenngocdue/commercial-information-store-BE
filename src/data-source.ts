import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Customer } from './database/entities/customer.entity';
import { OrderItem } from './database/entities/order-item.entity';
import { Order } from './database/entities/order.entity';
import { Part } from './database/entities/part.entity';
import { Store } from './database/entities/store.entity';
import { Vehicle } from './database/entities/vehicle.entity';

const databaseUrl = process.env.DATABASE_URL;
const isSsl = process.env.DB_SSL === 'true';

export default new DataSource({
  type: 'postgres',
  url: databaseUrl,
  host: databaseUrl ? undefined : process.env.DB_HOST,
  port: databaseUrl ? undefined : Number(process.env.DB_PORT || 5432),
  username: databaseUrl ? undefined : process.env.DB_USER,
  password: databaseUrl ? undefined : process.env.DB_PASSWORD,
  database: databaseUrl ? undefined : process.env.DB_NAME,
  ssl: isSsl ? { rejectUnauthorized: false } : undefined,
  entities: [Customer, Vehicle, Store, Part, Order, OrderItem],
  migrations: [__dirname + '/database/migrations/*.{ts,js}'],
  synchronize: false,
});
