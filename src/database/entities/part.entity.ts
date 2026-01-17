import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrderItem } from './order-item.entity';

@Entity({ name: 'parts' })
export class Part {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 160 })
  name: string;

  @Column({ length: 60, unique: true })
  sku: string;

  @Column({ length: 80, nullable: true })
  brand?: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  price: string;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => OrderItem, (item) => item.part)
  orderItems: OrderItem[];
}
