import { IsDateString, IsBoolean } from 'class-validator';

// Used to mark attendance for a specific session date
export class MarkAttendanceDto {
    @IsDateString()
    sessionDate: string;

    @IsBoolean()
    attended: boolean;
}
