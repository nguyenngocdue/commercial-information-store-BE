import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UserRole } from '../auth/enums/role.enum';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(payload: CreateUserDto) {
    try {
      // Hash password before saving
      const hashedPassword = await bcrypt.hash(payload.password, 10);
      
      const { password, ...userData } = payload;
      
      const user = await this.prisma.user.create({ 
        data: {
          ...userData,
          password: hashedPassword,
        }
      });
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const target = error.meta?.target as string[] | undefined;
        if (target?.includes('email')) {
          throw new ConflictException('Email already exists');
        }
        throw new ConflictException('Phone already exists');
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: { vehicles: true },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { vehicles: true, orders: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, payload: UpdateUserDto) {
    try {
      return await this.prisma.user.update({
        where: { id },
        data: payload,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('User not found');
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.user.delete({ where: { id } });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('User not found');
      }
      throw error;
    }
  }

  // ============= ADMIN METHODS =============

  /**
   * Get all users with pagination and filtering (Admin only)
   */
  async findAllAdmin(page = 1, limit = 20, role?: UserRole, search?: string) {
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};

    if (role) {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          address: true,
          createdAt: true,
          updatedAt: true,
          userRoles: {
            include: {
              role: true,
            },
          },
          _count: {
            select: {
              vehicles: true,
              orders: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update user role (Admin/Manager only)
   */
  async updateUserRole(userId: string, roleDto: UpdateUserRoleDto) {
    try {
      // Find or create the role
      const role = await this.prisma.role.upsert({
        where: { name: roleDto.role },
        update: {},
        create: {
          name: roleDto.role,
          description: `Role ${roleDto.role}`,
        },
      });

      // Remove old user roles
      await this.prisma.userRole.deleteMany({
        where: { userId },
      });

      // Assign new role
      await this.prisma.userRole.create({
        data: {
          userId,
          roleId: role.id,
        },
      });

      // Return updated user with roles
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          updatedAt: true,
          userRoles: {
            include: {
              role: true,
            },
          },
        },
      });

      return user;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('User not found');
      }
      throw error;
    }
  }

  /**
   * Get user statistics (Admin/Manager only)
   */
  async getUserStats() {
    const [total, users] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.findMany({
        select: {
          userRoles: {
            include: {
              role: true,
            },
          },
        },
      }),
    ]);

    // Count users by role
    const roleStats: Record<string, number> = {};
    users.forEach((user) => {
      user.userRoles.forEach((ur) => {
        const roleName = ur.role.name;
        roleStats[roleName] = (roleStats[roleName] || 0) + 1;
      });
    });

    return {
      total,
      byRole: roleStats,
    };
  }
}
