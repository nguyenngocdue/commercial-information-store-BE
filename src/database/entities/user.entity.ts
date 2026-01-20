import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { UserRole } from './user-role.entity';
import { Vehicle } from './vehicle.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'full_name', length: 120 })
  fullName: string;

  @Column({ length: 30, nullable: true, unique: true })
  phone?: string;

  @Column({ length: 150, nullable: true })
  email?: string;

  @Column({ length: 255, nullable: true })
  address?: string;

  @Column({ length: 30, default: 'user' })
  role: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Vehicle, (vehicle) => vehicle.user)
  vehicles: Vehicle[];

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => UserRole, (userRole) => userRole.user)
  userRoles: UserRole[];
}
