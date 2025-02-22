import { IsOptional, IsString } from 'class-validator';

export class RedirectLinkDto {
  @IsOptional()
  @IsString()
  password?: string;
}
