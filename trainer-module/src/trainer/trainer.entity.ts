import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { User } from '../user/user.entity';

@Entity()
export class Trainer {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    specialization: string;

    @ManyToOne(() => User)
    user: User;

    @ManyToMany(() => User)
    @JoinTable()
    clients: User[];

    @ManyToMany(() => User)
    @JoinTable()
    pendingClients: User[];
    
}
