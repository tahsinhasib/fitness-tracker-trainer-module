import { IsEmail, isEmail, IsString } from "class-validator";
import { Message } from '../../chat/message.entity';

export class RequestResetDto {

    @IsEmail()
    email: string;
  }
  
  export class ResetPasswordDto {

    @IsString()
    token: string;

    @IsString()
    newPassword: string;
  }
  