import { IsInt, IsString } from "class-validator";

export class CreateMessageDto {

    @IsInt({ message: 'senderId must be an integer' })
    receiverId: number;

    @IsString({ message: 'contents must be string' })
    content: string;
  }
  