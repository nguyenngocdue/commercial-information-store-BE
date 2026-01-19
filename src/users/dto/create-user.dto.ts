import { IsEmail, IsOptional, IsString, Length } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @Length(1, 120)
  fullName: string;

  @IsOptional()
  @IsString()
  @Length(6, 30)
  phone?: string;

  @IsOptional()
  @IsEmail()
  @Length(3, 150)
  email?: string;

  @IsOptional()
  @IsString()
  @Length(3, 255)
  address?: string;

  @IsOptional()
  @IsString()
  @Length(3, 30)
  role?: string;

  @IsOptional()
  @IsString()
  @Length(1, 2000)
  notes?: string;
}
