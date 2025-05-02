import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../user/user.entity';

@Entity()
export class ClientMetric {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, user => user.id)
    user: User;

    @Column('float')
    weight: number;

    @Column('float', { nullable: true })
    height: number;

    @Column('int')
    heartRate: number;

    @Column()
    bloodPressure: string;

    @Column('int')
    caloriesBurned: number;

    @Column('text', { nullable: true })
    notes: string;

    @Column()
    timestamp: Date;
}
