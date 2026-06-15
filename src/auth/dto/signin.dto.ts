import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SignInDto {
  @IsNotEmpty({ message: 'Email address cannot be empty.' })
  @IsEmail({}, { message: 'Please provide a valid email address.' })
  email!: string;

  @IsNotEmpty({ message: 'Password cannot be empty.' })
  @IsString({ message: 'Password must be a valid string.' })
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  password!: string;
}
