import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Trainer } from '../trainer/trainer.entity';
import { User } from '../user/user.entity';

@Entity()
export class WorkoutPlan {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    description: string;

    @Column()
    routine: string; // JSON or stringified structure of daily/weekly routines

    @Column()
    startDate: Date;

    @Column()
    endDate: Date;

    @ManyToOne(() => Trainer, trainer => trainer.id)
    trainer: Trainer;

    @ManyToOne(() => User, user => user.id)
    client: User;
}
