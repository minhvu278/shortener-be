import { IsString, IsNotEmpty, IsOptional, IsDateString, IsBoolean } from 'class-validator';

export class CreateLinkDto {
  @IsString()
  @IsNotEmpty({ message: "URL dài là bắt buộc." })
  originalUrl: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsDateString()
  @IsOptional()
  expiresAt?: Date;

  @IsBoolean()
  @IsOptional()
  generateQrCode?: boolean;

  @IsString()
  @IsOptional()
  title?: string;
}
