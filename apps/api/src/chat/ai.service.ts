import { IsString, MaxLength } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @MaxLength(10000)
  content!: string;
}
