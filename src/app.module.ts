import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { BatteryAuditModule } from './modules/battery-audit/battery-audit.module';
import { BatteryAudit } from './modules/battery-audit/entities/battery-audit.entity';
import { DronesModule } from './modules/drones/drones.module';
import { Drone } from './modules/drones/entities/drone.entity';
import { Medication } from './modules/medications/entities/medication.entity';
import { MedicationsModule } from './modules/medications/medications.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: ':memory:',
      entities: [Drone, Medication, BatteryAudit],
      synchronize: true,
      logging: false,
    }),
    DronesModule,
    MedicationsModule,
    BatteryAuditModule,
  ],
})
export class AppModule {}