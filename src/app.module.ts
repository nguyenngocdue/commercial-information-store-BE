import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './database/entities/user.entity';
import { OrderItem } from './database/entities/order-item.entity';
import { Order } from './database/entities/order.entity';
import { Part } from './database/entities/part.entity';
import { Permission } from './database/entities/permission.entity';
import { RolePermission } from './database/entities/role-permission.entity';
import { Role } from './database/entities/role.entity';
import { Store } from './database/entities/store.entity';
import { UserRole } from './database/entities/user-role.entity';
import { Vehicle } from './database/entities/vehicle.entity';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
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
          entities: [
            User,
            Vehicle,
            Store,
            Part,
            Order,
            OrderItem,
            Role,
            Permission,
            UserRole,
            RolePermission,
          ],
          migrations: [__dirname + '/database/migrations/*.{ts,js}'],
          synchronize: false,
          logging: config.get('DB_LOGGING') === 'true',
        };
      },
    }),
    UsersModule,
    VehiclesModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
