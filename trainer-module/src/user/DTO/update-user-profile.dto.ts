export class UpdateUserProfileDto {
    // General
    name?: string;
    bio?: string;
    profilePicture?: string;
    phone?: string;
    location?: string;
    socialLinks?: {
        facebook?: string;
        linkedin?: string;
        instagram?: string;
        youtube?: string;
    };

    // Trainer-Specific
    specialization?: string;
    experience?: string;
    certifications?: string;
    skills?: string[];
    availability?: {
        days: string[];
        timeSlots: string[];
    };
}
