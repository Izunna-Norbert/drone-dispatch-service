import { DroneModel } from '../../../common/enums/drone-model.enum';
import { DroneState } from '../../../common/enums/drone-state.enum';

export class DroneResponseDto {
  id: string;
  serialNumber: string;
  model: DroneModel;
  weightLimit: number;
  batteryCapacity: number;
  state: DroneState;
  currentLoad: number;
  medications?: any[];
  createdAt: Date;
}
