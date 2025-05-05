import { IsInt } from "class-validator";

export class AddClientDto {
    @IsInt({ message: 'trainerId must be an integer' })
    trainerId: number;

    @IsInt({ message: 'clientId must be an integer' })
    clientId: number;
}
  