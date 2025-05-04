import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

export enum Role {
    USER = 'user',
    TRAINER = 'trainer',
    NUTRITIONIST = 'nutritionist',
    ADMIN = 'admin',
}

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({
        type: 'enum',
        enum: Role,
        default: Role.USER,
    })
    role: Role;

    @Column({ nullable: true })
    resetToken?: string;

    @Column({ type: 'timestamp', nullable: true })
    resetTokenExpiry?: Date;

    // --- General Profile Fields ---
    @Column({ nullable: true })
    bio?: string;

    @Column({ nullable: true })
    profilePicture?: string;

    @Column({ nullable: true })
    phone?: string;

    @Column({ nullable: true })
    location?: string;

    @Column('json', { nullable: true })
    socialLinks?: {
        facebook?: string;
        twitter?: string;
        linkedin?: string;
    };

    // --- Trainer-Specific Profile Fields ---
    @Column({ nullable: true })
    specialization?: string;

    @Column({ nullable: true })
    experience?: string;

    @Column({ nullable: true })
    certifications?: string;

    @Column('simple-array', { nullable: true })
    skills?: string[];

    @Column('json', { nullable: true })
    availability?: {
        days: string[];
        timeSlots: string[];
    };
}
