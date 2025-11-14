import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DronesModule } from '../drones/drones.module';
import { BatteryAudit } from './entities/battery-audit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BatteryAudit]), DronesModule],
})
export class BatteryAuditModule {}
