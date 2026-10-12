import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: 'username is required' })
  @MaxLength(64)
  username: string;

  @IsString()
  @IsNotEmpty({ message: 'password is required' })
  @MaxLength(128)
  password: string;
}

export class LoginResponseDto {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: string;
}
