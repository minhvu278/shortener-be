import { IsNotEmpty, IsOptional, IsString, IsUrl, Matches, MaxLength } from 'class-validator';

export class CreateLinkDto {
  @IsUrl({}, { message: 'originalUrl phải là một URL hợp lệ' })
  @IsNotEmpty({ message: 'originalUrl không được để trống' })
  originalUrl: string;

  @IsOptional()
  @IsString()
  @MaxLength(20, { message: 'Slug tối đa 20 ký tự' })
  @Matches(/^[a-zA-Z0-9-_]+$/, { message: 'Slug chỉ chứa chữ cái, số, dấu - và _' })
  customSlug?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  expiresAt?: Date;
}
