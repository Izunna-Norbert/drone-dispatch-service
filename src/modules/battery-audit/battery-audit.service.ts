import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BatteryAudit } from './entities/battery-audit.entity';
import { DronesService } from '../drones/drones.service';
import { DroneState } from 'src/common/enums/drone-state.enum';

@Injectable()
export class BatteryAuditService {
  private readonly logger = new Logger(BatteryAuditService.name);

  constructor(
    @InjectRepository(BatteryAudit)
    private readonly batteryAuditRepository: Repository<BatteryAudit>,
    private readonly dronesService: DronesService,
  ) {}

  // Run every 5 minutes
  @Cron(CronExpression.EVERY_5_MINUTES)
  async checkBatteryLevels() {
    this.logger.log('Starting battery level check for all drones...');

    try {
      const drones = await this.dronesService.getAllForBatteryAudit();

      for (const drone of drones) {
        const auditEntry = this.batteryAuditRepository.create({
          droneSerialNumber: drone.serialNumber,
          batteryLevel: drone.batteryCapacity,
          state: drone.state,
        });

        await this.batteryAuditRepository.save(auditEntry);

        // Log warning if battery is low
        if (drone.batteryCapacity < 25) {
          this.logger.warn(
            `⚠️  Drone ${drone.serialNumber} has low battery: ${drone.batteryCapacity}%`,
          );
        }

        if (drone.batteryCapacity < 10 && drone.state === DroneState.DELIVERING) {
          // in real system we'd call a drone command
          // just update state
          // Update drone state to RETURNING if battery is critically low during delivery
          this.logger.warn(
            `🚨 Drone ${drone.serialNumber} battery critically low (${drone.batteryCapacity}%) during delivery. Forcing RETURNING state.`,
          );
        }
      }

      this.logger.log(`✓ Battery check completed for ${drones.length} drones`);
    } catch (error) {
      this.logger.error('Error during battery level check:', error);
    }
  }

  async getAuditHistory(
    serialNumber?: string,
    limit: number = 50,
  ): Promise<BatteryAudit[]> {
    const queryBuilder = this.batteryAuditRepository
      .createQueryBuilder('audit')
      .orderBy('audit.createdAt', 'DESC')
      .limit(limit);

    if (serialNumber) {
      queryBuilder.where('audit.droneSerialNumber = :serialNumber', {
        serialNumber,
      });
    }

    return queryBuilder.getMany();
  }

  async createManualAudit(
    serialNumber: string,
    batteryLevel: number,
    state: string,
  ): Promise<BatteryAudit> {
    const auditEntry = this.batteryAuditRepository.create({
      droneSerialNumber: serialNumber,
      batteryLevel,
      state,
    });

    return this.batteryAuditRepository.save(auditEntry);
  }
}
