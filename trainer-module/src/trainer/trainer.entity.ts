import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../user/user.entity';

@Entity()
export class Trainer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  specialization: string;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => User)
    @JoinColumn()
    client: User;
}
