import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateChatDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  title?: string;

  @IsString()
  @IsOptional()
  @MaxLength(4000)
  initialMessage?: string;
}
