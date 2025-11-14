import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Drone } from './entities/drone.entity';
import { Medication } from '../medications/entities/medication.entity';
import { CreateDroneDto } from './dto/create-drone.dto';
import { LoadMedicationDto } from './dto/load-medication.dto';
import { DroneState } from '../../common/enums/drone-state.enum';
import { BusinessException } from '../../common/exceptions/business.exception';

@Injectable()
export class DronesService {
  constructor(
    @InjectRepository(Drone)
    private readonly droneRepository: Repository<Drone>,
    @InjectRepository(Medication)
    private readonly medicationRepository: Repository<Medication>,
  ) {}

  async create(createDroneDto: CreateDroneDto): Promise<Drone> {
    // Check if serial number already exists
    const existing = await this.droneRepository.findOne({
      where: { serialNumber: createDroneDto.serialNumber },
    });

    if (existing) {
      throw new ConflictException(
        `Drone with serial number ${createDroneDto.serialNumber} already exists`,
      );
    }

    const drone = this.droneRepository.create({
      ...createDroneDto,
      state: DroneState.IDLE,
    });

    return this.droneRepository.save(drone);
  }

  async findAll(): Promise<Drone[]> {
    return this.droneRepository.find({
      relations: ['medications'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(serialNumber: string): Promise<Drone> {
    const drone = await this.droneRepository.findOne({
      where: { serialNumber },
      relations: ['medications'],
    });

    if (!drone) {
      throw new NotFoundException(
        `Drone with serial number ${serialNumber} not found`,
      );
    }

    return drone;
  }

  async findAvailable(): Promise<Drone[]> {
    const drones = await this.droneRepository.find({
      relations: ['medications'],
    });

    // Filter drones that are available for loading
    return drones.filter(
      (drone) =>
        (drone.state === DroneState.IDLE ||
          drone.state === DroneState.LOADING) &&
        drone.batteryCapacity >= 25 &&
        drone.currentLoad < drone.weightLimit,
    );
  }

  async loadMedications(
    serialNumber: string,
    loadMedicationDto: LoadMedicationDto,
  ): Promise<Drone> {
    const drone = await this.findOne(serialNumber);

    // Validate battery level
    if (!drone.hasSufficientBattery()) {
      throw new BusinessException(
        `Cannot load drone ${serialNumber}: battery level is ${drone.batteryCapacity}% (minimum 25% required)`,
      );
    }

    // Validate state
    if (drone.state !== DroneState.IDLE && drone.state !== DroneState.LOADING) {
      throw new BusinessException(
        `Cannot load drone ${serialNumber}: drone is currently ${drone.state}`,
      );
    }

    // Calculate total weight of new medications
    const totalNewWeight = loadMedicationDto.medications.reduce(
      (sum, med) => sum + med.weight,
      0,
    );

    // Validate weight capacity
    if (!drone.canAcceptWeight(totalNewWeight)) {
      throw new BusinessException(
        `Cannot load drone ${serialNumber}: total weight ${drone.currentLoad + totalNewWeight}gr exceeds limit ${drone.weightLimit}gr`,
      );
    }

    // Change state to LOADING
    drone.state = DroneState.LOADING;
    await this.droneRepository.save(drone);

    // Create medication entities
    const medications = loadMedicationDto.medications.map((medDto) => {
      return this.medicationRepository.create({
        ...medDto,
        drone: drone,
      });
    });

    // Save medications
    await this.medicationRepository.save(medications);

    // Update drone state to LOADED
    drone.state = DroneState.LOADED;
    await this.droneRepository.save(drone);

    // Return updated drone with medications
    return this.findOne(serialNumber);
  }

  async getMedications(serialNumber: string): Promise<{
    serialNumber: string;
    medications: Medication[];
    totalWeight: number;
  }> {
    const drone = await this.findOne(serialNumber);

    return {
      serialNumber: drone.serialNumber,
      medications: drone.medications || [],
      totalWeight: drone.currentLoad,
    };
  }

  async getBatteryLevel(serialNumber: string): Promise<{
    serialNumber: string;
    batteryCapacity: number;
    state: DroneState;
  }> {
    const drone = await this.findOne(serialNumber);

    return {
      serialNumber: drone.serialNumber,
      batteryCapacity: drone.batteryCapacity,
      state: drone.state,
    };
  }

  async getAllForBatteryAudit(): Promise<Drone[]> {
    return this.droneRepository.find();
  }
}
