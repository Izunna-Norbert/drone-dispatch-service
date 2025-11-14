import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Drone } from '../../drones/entities/drone.entity';

@Entity('medications')
export class Medication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'integer' })
  weight: number;

  @Column({ type: 'varchar', length: 255 })
  code: string;

  @Column({ type: 'text' })
  image: string;

  @ManyToOne(() => Drone, (drone) => drone.medications, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'droneId' })
  drone: Drone;

  @Column({ type: 'varchar', nullable: true })
  droneId: string;

  @CreateDateColumn()
  createdAt: Date;
}
