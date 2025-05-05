import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../user/user.entity';

@Entity()
export class Message {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User)
    sender: User;

    @ManyToOne(() => User)
    receiver: User;

    @Column()
    content: string;

    @CreateDateColumn()
    timestamp: Date;

    @Column({ default: false })
    isReminder: boolean;
}
