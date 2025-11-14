import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BatteryAuditService } from './battery-audit.service';
import { DronesModule } from '../drones/drones.module';
import { BatteryAudit } from './entities/battery-audit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BatteryAudit]), DronesModule],
  providers: [BatteryAuditService],
})
export class BatteryAuditModule {}
