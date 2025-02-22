import { IsOptional, IsString, IsUrl, MaxLength, IsDateString } from 'class-validator';

export class CreateLinkDto {
  @IsUrl()
  originalUrl: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  slug?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
