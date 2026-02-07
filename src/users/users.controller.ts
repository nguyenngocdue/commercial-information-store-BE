import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { UserRole } from '../auth/enums/role.enum';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() payload: CreateUserDto) {
    return this.usersService.create(payload);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() payload: UpdateUserDto) {
    return this.usersService.update(id, payload);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.usersService.remove(id);
    return { deleted: true };
  }

  // ============= ADMIN ENDPOINTS =============

  /**
   * Get all users - Requires view_users permission
   */
  @Get('admin/all')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('view_users')
  findAllAdmin(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('role') role?: UserRole,
    @Query('search') search?: string,
  ) {
    return this.usersService.findAllAdmin(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      role,
      search,
    );
  }

  /**
   * Get user statistics - Requires view_users permission
   */
  @Get('admin/stats')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('view_users')
  getUserStats() {
    return this.usersService.getUserStats();
  }

  /**
   * Update user role - Requires manage_users permission
   */
  @Patch('admin/:id/role')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('manage_users')
  updateUserRole(
    @Param('id') id: string,
    @Body() roleDto: UpdateUserRoleDto,
  ) {
    return this.usersService.updateUserRole(id, roleDto);
  }
}
