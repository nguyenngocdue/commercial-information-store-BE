import { IsEmail, IsOptional, IsString, Length, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @Length(1, 120)
  fullName: string;

  @IsString()
  @Length(6, 30)
  phone: string;

  @IsEmail()
  @Length(3, 150)
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

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
