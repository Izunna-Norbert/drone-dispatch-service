import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { DronesService } from './drones.service';
import { Drone } from './entities/drone.entity';
import { Medication } from '../medications/entities/medication.entity';
import { DroneModel } from '../../common/enums/drone-model.enum';
import { DroneState } from '../../common/enums/drone-state.enum';
import { BusinessException } from '../../common/exceptions/business.exception';

describe('DronesService', () => {
  let service: DronesService;
  let droneRepository: Repository<Drone>;
  let medicationRepository: Repository<Medication>;

  const mockDrone: Partial<Drone> = {
    id: '1',
    serialNumber: 'DRONE-TEST-001',
    model: DroneModel.LIGHTWEIGHT,
    weightLimit: 200,
    batteryCapacity: 100,
    state: DroneState.IDLE,
    medications: [],
    currentLoad: 0,
    canAcceptWeight: jest.fn((weight: number) => weight <= 200),
    hasSufficientBattery: jest.fn(() => true),
  };

  const mockDroneRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockMedicationRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DronesService,
        {
          provide: getRepositoryToken(Drone),
          useValue: mockDroneRepository,
        },
        {
          provide: getRepositoryToken(Medication),
          useValue: mockMedicationRepository,
        },
      ],
    }).compile();

    service = module.get<DronesService>(DronesService);
    droneRepository = module.get<Repository<Drone>>(getRepositoryToken(Drone));
    medicationRepository = module.get<Repository<Medication>>(
      getRepositoryToken(Medication),
    );

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new drone', async () => {
      const createDto = {
        serialNumber: 'DRONE-TEST-001',
        model: DroneModel.LIGHTWEIGHT,
        weightLimit: 200,
        batteryCapacity: 100,
      };

      mockDroneRepository.findOne.mockResolvedValue(null);
      mockDroneRepository.create.mockReturnValue(mockDrone);
      mockDroneRepository.save.mockResolvedValue(mockDrone);

      const result = await service.create(createDto);

      expect(mockDroneRepository.findOne).toHaveBeenCalledWith({
        where: { serialNumber: createDto.serialNumber },
      });
      expect(mockDroneRepository.create).toHaveBeenCalledWith({
        ...createDto,
        state: DroneState.IDLE,
      });
      expect(result).toEqual(mockDrone);
    });

    it('should throw ConflictException if serial number exists', async () => {
      const createDto = {
        serialNumber: 'DRONE-TEST-001',
        model: DroneModel.LIGHTWEIGHT,
        weightLimit: 200,
        batteryCapacity: 100,
      };

      mockDroneRepository.findOne.mockResolvedValue(mockDrone);

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a drone by serial number', async () => {
      mockDroneRepository.findOne.mockResolvedValue(mockDrone);

      const result = await service.findOne('DRONE-TEST-001');

      expect(mockDroneRepository.findOne).toHaveBeenCalledWith({
        where: { serialNumber: 'DRONE-TEST-001' },
        relations: ['medications'],
      });
      expect(result).toEqual(mockDrone);
    });

    it('should throw NotFoundException if drone not found', async () => {
      mockDroneRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('NON-EXISTENT')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAvailable', () => {
    it('should return only available drones', async () => {
      const drones = [
        { ...mockDrone, batteryCapacity: 100, state: DroneState.IDLE },
        { ...mockDrone, batteryCapacity: 20, state: DroneState.IDLE }, // Low battery
        { ...mockDrone, batteryCapacity: 80, state: DroneState.DELIVERING }, // Busy
      ];

      mockDroneRepository.find.mockResolvedValue(drones);

      const result = await service.findAvailable();

      expect(result.length).toBe(1);
    });
  });

  describe('loadMedications', () => {
    it('should successfully load medications on drone', async () => {
      const loadDto = {
        medications: [
          {
            name: 'Aspirin',
            weight: 50,
            code: 'ASP_500',
            image: 'https://example.com/aspirin.jpg',
          },
        ],
      };

      const droneWithMeds = {
        ...mockDrone,
        state: DroneState.LOADED,
        medications: [{ ...loadDto.medications[0], id: '1' }],
      };

      mockDroneRepository.findOne.mockResolvedValue(mockDrone);
      mockMedicationRepository.create.mockReturnValue(loadDto.medications[0]);
      mockMedicationRepository.save.mockResolvedValue([loadDto.medications[0]]);
      mockDroneRepository.save.mockResolvedValue(droneWithMeds);

      // Mock the second findOne call after loading
      mockDroneRepository.findOne.mockResolvedValueOnce(mockDrone);
      mockDroneRepository.findOne.mockResolvedValueOnce(droneWithMeds);

      const result = await service.loadMedications('DRONE-TEST-001', loadDto);

      expect(result.state).toBe(DroneState.LOADED);
    });

    it('should throw BusinessException if battery is below 25%', async () => {
      const lowBatteryDrone = {
        ...mockDrone,
        batteryCapacity: 20,
        hasSufficientBattery: jest.fn(() => false),
      };

      mockDroneRepository.findOne.mockResolvedValue(lowBatteryDrone);

      const loadDto = {
        medications: [
          {
            name: 'Aspirin',
            weight: 50,
            code: 'ASP_500',
            image: 'https://example.com/aspirin.jpg',
          },
        ],
      };

      await expect(
        service.loadMedications('DRONE-TEST-001', loadDto),
      ).rejects.toThrow(BusinessException);
    });

    it('should throw BusinessException if weight exceeds limit', async () => {
      const loadDto = {
        medications: [
          {
            name: 'Heavy-Med',
            weight: 250,
            code: 'HEAVY_MED',
            image: 'https://example.com/heavy.jpg',
          },
        ],
      };

      const droneWithWeight = {
        ...mockDrone,
        canAcceptWeight: jest.fn(() => false),
      };

      mockDroneRepository.findOne.mockResolvedValue(droneWithWeight);

      await expect(
        service.loadMedications('DRONE-TEST-001', loadDto),
      ).rejects.toThrow(BusinessException);
    });

    it('should throw BusinessException if drone is not in valid state', async () => {
      const busyDrone = {
        ...mockDrone,
        state: DroneState.DELIVERING,
      };

      mockDroneRepository.findOne.mockResolvedValue(busyDrone);

      const loadDto = {
        medications: [
          {
            name: 'Aspirin',
            weight: 50,
            code: 'ASP_500',
            image: 'https://example.com/aspirin.jpg',
          },
        ],
      };

      await expect(
        service.loadMedications('DRONE-TEST-001', loadDto),
      ).rejects.toThrow(BusinessException);
    });
  });

  describe('getMedications', () => {
    it('should return medications for a drone', async () => {
      const droneWithMeds = {
        ...mockDrone,
        medications: [
          {
            id: '1',
            name: 'Aspirin',
            weight: 50,
            code: 'ASP_500',
            image: 'https://example.com/aspirin.jpg',
          },
        ],
        currentLoad: 50,
      };

      mockDroneRepository.findOne.mockResolvedValue(droneWithMeds);

      const result = await service.getMedications('DRONE-TEST-001');

      expect(result.medications.length).toBe(1);
      expect(result.totalWeight).toBe(50);
    });
  });

  describe('getBatteryLevel', () => {
    it('should return battery level of a drone', async () => {
      mockDroneRepository.findOne.mockResolvedValue(mockDrone);

      const result = await service.getBatteryLevel('DRONE-TEST-001');

      expect(result.batteryCapacity).toBe(100);
      expect(result.serialNumber).toBe('DRONE-TEST-001');
    });
  });
});