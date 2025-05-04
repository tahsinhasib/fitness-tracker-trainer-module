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
}
