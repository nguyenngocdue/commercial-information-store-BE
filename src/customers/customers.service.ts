import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../database/entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customersRepository: Repository<Customer>,
  ) {}

  async create(payload: CreateCustomerDto): Promise<Customer> {
    const customer = this.customersRepository.create(payload);
    return this.customersRepository.save(customer);
  }

  async findAll(): Promise<Customer[]> {
    return this.customersRepository.find({
      order: { createdAt: 'DESC' },
      relations: ['vehicles'],
    });
  }

  async findOne(id: string): Promise<Customer> {
    const customer = await this.customersRepository.findOne({
      where: { id },
      relations: ['vehicles', 'orders'],
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async update(id: string, payload: UpdateCustomerDto): Promise<Customer> {
    await this.customersRepository.update({ id }, payload);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.customersRepository.delete({ id });
    if (!result.affected) {
      throw new NotFoundException('Customer not found');
    }
  }
}
