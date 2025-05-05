import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../user/user.entity';

@Entity()
export class Attendance {
    
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User)
    client: User;

    @Column()
    sessionDate: Date;

    @Column({ default: true })
    attended: boolean;

    @CreateDateColumn()
    markedAt: Date;
}
