import { IsDateString, IsBoolean } from 'class-validator';

export class MarkAttendanceDto {
  @IsDateString()
  sessionDate: string;

  @IsBoolean()
  attended: boolean;
}
