import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { DroneModel } from '../../../common/enums/drone-model.enum';
import { DroneState } from '../../../common/enums/drone-state.enum';
import { Medication } from '../../medications/entities/medication.entity';

@Entity('drones')
export class Drone {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  serialNumber: string;

  @Column({
    type: 'varchar',
    enum: DroneModel,
  })
  model: DroneModel;

  @Column({ type: 'integer', default: 500 })
  weightLimit: number;

  @Column({ type: 'integer', default: 100 })
  batteryCapacity: number;

  @Column({
    type: 'varchar',
    enum: DroneState,
    default: DroneState.IDLE,
  })
  state: DroneState;

  @OneToMany(() => Medication, (medication) => medication.drone, {
    cascade: true,
    eager: true,
  })
  medications: Medication[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Virtual property to calculate current load
  get currentLoad(): number {
    if (!this.medications || this.medications.length === 0) {
      return 0;
    }
    return this.medications.reduce((sum, med) => sum + med.weight, 0);
  }

  // Check if drone can accept additional weight
  canAcceptWeight(weight: number): boolean {
    return this.currentLoad + weight <= this.weightLimit;
  }

  // Check if drone battery is sufficient for loading
  hasSufficientBattery(): boolean {
    return this.batteryCapacity >= 25;
  }
}
