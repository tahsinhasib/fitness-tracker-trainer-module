import { IsNumber, IsOptional, IsString, IsDateString } from 'class-validator';

export class CreateClientMetricDto {
    @IsNumber()
    weight: number;

    @IsOptional()
    @IsNumber()
    height?: number;

    @IsNumber()
    heartRate: number;

    @IsString()
    bloodPressure: string;

    @IsNumber()
    caloriesBurned: number;

    @IsOptional()
    @IsString()
    notes?: string;

    @IsDateString()
    timestamp: string;
}
