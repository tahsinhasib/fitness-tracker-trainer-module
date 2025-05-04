import { IsArray, IsObject, IsOptional, IsString } from 'class-validator';
export class UpdateUserProfileDto {
    // General
    @IsOptional()
    @IsString({ message: 'Name must be a string' })
    name?: string;

    @IsOptional()
    @IsString({ message: 'Bio must be a string' })
    bio?: string;

    @IsOptional()
    @IsString({ message: 'Profile picture must be an url' })
    profilePicture?: string;

    @IsOptional()
    @IsString({ message: 'Phone number must be a string' })
    phone?: string;

    @IsOptional()
    @IsString({ message: 'Location must be a string' })
    location?: string;

    @IsOptional()
    @IsObject({ message: 'Soical links must be url' })
    socialLinks?: {
        facebook?: string;
        linkedin?: string;
        instagram?: string;
        youtube?: string;
    };

    // Trainer-Specific
    @IsOptional()
    @IsString({ message: 'Specialization must be a string' })
    specialization?: string;

    @IsOptional()
    @IsString({ message: 'Experience must be a string' })
    experience?: string;

    @IsOptional()
    @IsString({ message: 'Certifications must be a string' })
    certifications?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    skills?: string[];

    @IsOptional()
    @IsObject({ message: 'Availability must be a list of objects' })
    availability?: {
        days: string[];
        timeSlots: string[];
    };
}
