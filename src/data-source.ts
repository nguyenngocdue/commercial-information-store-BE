import 'dotenv/config';
import { DataSource } from 'typeorm';
import { User } from './database/entities/user.entity';
import { OrderItem } from './database/entities/order-item.entity';
import { Order } from './database/entities/order.entity';
import { Part } from './database/entities/part.entity';
import { Store } from './database/entities/store.entity';
import { Vehicle } from './database/entities/vehicle.entity';

const databaseUrl = process.env.DATABASE_URL;
const isSsl = process.env.DB_SSL === 'true';

// Parse DATABASE_URL if it exists
let dbConfig: any = {};
if (databaseUrl) {
  const url = new URL(databaseUrl);
  dbConfig = {
    host: url.hostname,
    port: parseInt(url.port) || 5432,
    username: url.username,
    password: url.password,
    database: url.pathname.slice(1), // Remove leading '/'
  };
} else {
  dbConfig = {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  };
}

export default new DataSource({
  type: 'postgres',
  ...dbConfig,
  ssl: isSsl
    ? {
        rejectUnauthorized: false,
      }
    : false,
  entities: [User, Vehicle, Store, Part, Order, OrderItem],
  migrations: [__dirname + '/database/migrations/*.{ts,js}'],
  synchronize: false,
});
