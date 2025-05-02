import { IsInt, IsString, IsDateString, MinLength } from 'class-validator';

export class CreateWorkoutPlanDto {
    @IsInt()
    clientId: number;

    @IsString()
    @MinLength(3)
    title: string;

    @IsString()
    description: string;

    @IsString()
    routine: string; // JSON or string describing weekly schedule

    @IsDateString()
    startDate: string;

    @IsDateString()
    endDate: string;
}
