import { IsInt, Min } from 'class-validator';

export class RequestTrainerDto {
    @IsInt()
    @Min(1)
    trainerId: number;
}
