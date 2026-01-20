import { IsInt, IsOptional, IsString, IsUUID, Length, Max, Min } from 'class-validator';

export class CreateVehicleDto {
  @IsUUID()
  userId: string;

  @IsOptional()
  @IsString()
  @Length(3, 40)
  vin?: string;

  @IsString()
  @Length(1, 60)
  make: string;

  @IsString()
  @Length(1, 60)
  model: string;

  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(2100)
  year?: number;

  @IsOptional()
  @IsString()
  @Length(2, 20)
  plateNumber?: string;
}
