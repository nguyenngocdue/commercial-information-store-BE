import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersModule } from './customers/customers.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Customer } from './database/entities/customer.entity';
import { OrderItem } from './database/entities/order-item.entity';
import { Order } from './database/entities/order.entity';
import { Part } from './database/entities/part.entity';
import { Store } from './database/entities/store.entity';
import { Vehicle } from './database/entities/vehicle.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const databaseUrl = config.get<string>('DATABASE_URL');
        const isSsl = config.get<string>('DB_SSL') === 'true';

        return {
          type: 'postgres',
          url: databaseUrl,
          host: databaseUrl ? undefined : config.get('DB_HOST'),
          port: databaseUrl ? undefined : Number(config.get('DB_PORT', 5432)),
          username: databaseUrl ? undefined : config.get('DB_USER'),
          password: databaseUrl ? undefined : config.get('DB_PASSWORD'),
          database: databaseUrl ? undefined : config.get('DB_NAME'),
          ssl: isSsl ? { rejectUnauthorized: false } : undefined,
          entities: [Customer, Vehicle, Store, Part, Order, OrderItem],
          migrations: [__dirname + '/database/migrations/*.{ts,js}'],
          synchronize: false,
          logging: config.get('DB_LOGGING') === 'true',
        };
      },
    }),
    CustomersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
