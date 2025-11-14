import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DronesService } from './drones.service';
import { Drone } from './entities/drone.entity';
import { Medication } from '../medications/entities/medication.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Drone, Medication])],
  providers: [DronesService],
  exports: [DronesService],
})
export class DronesModule {}
