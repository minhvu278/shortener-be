import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateQrCodeDto {
  @IsString()
  originalUrl: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsBoolean()
  @IsOptional()
  createShortLink?: boolean;
}
