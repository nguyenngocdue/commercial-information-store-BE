import { IsEnum } from 'class-validator';
import { UserRole } from '../../auth/enums/role.enum';

export class UpdateUserRoleDto {
  @IsEnum(UserRole, { message: 'Invalid role' })
  role: UserRole;
}
