import { DataSource } from 'typeorm';
import { Drone } from '../../../modules/drones/entities/drone.entity';
import { Medication } from '../../../modules/medications/entities/medication.entity';
import { DroneModel } from '../../enums/drone-model.enum';
import { DroneState } from '../../enums/drone-state.enum';

export async function seedDatabase(dataSource: DataSource) {
  const droneRepository = dataSource.getRepository(Drone);
  const medicationRepository = dataSource.getRepository(Medication);

  console.log('🌱 Seeding database...');

  // Check if data already exists
  const existingDrones = await droneRepository.count();
  if (existingDrones > 0) {
    console.log('✓ Database already seeded');
    return;
  }

  // Create 10 drones
  const drones = [
    {
      serialNumber: 'DRONE-001',
      model: DroneModel.LIGHTWEIGHT,
      weightLimit: 200,
      batteryCapacity: 100,
      state: DroneState.IDLE,
    },
    {
      serialNumber: 'DRONE-002',
      model: DroneModel.LIGHTWEIGHT,
      weightLimit: 200,
      batteryCapacity: 80,
      state: DroneState.IDLE,
    },
    {
      serialNumber: 'DRONE-003',
      model: DroneModel.MIDDLEWEIGHT,
      weightLimit: 300,
      batteryCapacity: 90,
      state: DroneState.IDLE,
    },
    {
      serialNumber: 'DRONE-004',
      model: DroneModel.MIDDLEWEIGHT,
      weightLimit: 300,
      batteryCapacity: 75,
      state: DroneState.IDLE,
    },
    {
      serialNumber: 'DRONE-005',
      model: DroneModel.CRUISERWEIGHT,
      weightLimit: 400,
      batteryCapacity: 95,
      state: DroneState.IDLE,
    },
    {
      serialNumber: 'DRONE-006',
      model: DroneModel.CRUISERWEIGHT,
      weightLimit: 400,
      batteryCapacity: 60,
      state: DroneState.IDLE,
    },
    {
      serialNumber: 'DRONE-007',
      model: DroneModel.HEAVYWEIGHT,
      weightLimit: 500,
      batteryCapacity: 100,
      state: DroneState.IDLE,
    },
    {
      serialNumber: 'DRONE-008',
      model: DroneModel.HEAVYWEIGHT,
      weightLimit: 500,
      batteryCapacity: 85,
      state: DroneState.IDLE,
    },
    {
      serialNumber: 'DRONE-009',
      model: DroneModel.LIGHTWEIGHT,
      weightLimit: 200,
      batteryCapacity: 20, // Low battery - cannot be loaded
      state: DroneState.IDLE,
    },
    {
      serialNumber: 'DRONE-010',
      model: DroneModel.MIDDLEWEIGHT,
      weightLimit: 300,
      batteryCapacity: 50,
      state: DroneState.DELIVERING, // Currently busy
    },
  ];

  const savedDrones = await droneRepository.save(drones);
  console.log(`✓ Created ${savedDrones.length} drones`);

  // Pre-load some drones with medications for testing
  const medicationsForDrone001 = [
    {
      name: 'Aspirin-500mg',
      weight: 50,
      code: 'ASP_500',
      image: 'https://example.com/medications/aspirin.jpg',
      drone: savedDrones[0],
    },
    {
      name: 'Vitamin-C',
      weight: 30,
      code: 'VIT_C_1000',
      image: 'https://example.com/medications/vitamin-c.jpg',
      drone: savedDrones[0],
    },
  ];

  const medicationsForDrone010 = [
    {
      name: 'Insulin',
      weight: 100,
      code: 'INSULIN_100',
      image: 'https://example.com/medications/insulin.jpg',
      drone: savedDrones[9],
    },
    {
      name: 'Amoxicillin',
      weight: 75,
      code: 'AMOX_500',
      image: 'https://example.com/medications/amoxicillin.jpg',
      drone: savedDrones[9],
    },
  ];

  await medicationRepository.save([
    ...medicationsForDrone001,
    ...medicationsForDrone010,
  ]);

  // Update drone states
  savedDrones[0].state = DroneState.LOADED;
  await droneRepository.save(savedDrones[0]);

  console.log(`✓ Pre-loaded medications on DRONE-001 and DRONE-010`);
  console.log('✓ Database seeding completed!');
  console.log('\n📊 Summary:');
  console.log(`   - Total drones: ${savedDrones.length}`);
  console.log(`   - Available for loading: ${savedDrones.filter(d => d.batteryCapacity >= 25 && (d.state === DroneState.IDLE || d.state === DroneState.LOADING)).length}`);
  console.log(`   - Low battery (< 25%): ${savedDrones.filter(d => d.batteryCapacity < 25).length}`);
  console.log(`   - Currently loaded: 2`);
  console.log('');
}