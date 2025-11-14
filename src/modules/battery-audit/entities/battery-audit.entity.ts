import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('battery_audits')
@Index(['droneSerialNumber', 'createdAt'])
export class BatteryAudit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  droneSerialNumber: string;

  @Column({ type: 'integer' })
  batteryLevel: number;

  @Column({ type: 'varchar', length: 50 })
  state: string;

  @CreateDateColumn()
  createdAt: Date;
}
