import {
  IsString,
  IsEnum,
  IsInt,
  Min,
  Max,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';
import { DroneModel } from '../../../common/enums/drone-model.enum';

export class CreateDroneDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  serialNumber: string;

  @IsEnum(DroneModel)
  model: DroneModel;

  @IsInt()
  @Min(1)
  @Max(500)
  weightLimit: number;

  @IsInt()
  @Min(0)
  @Max(100)
  batteryCapacity: number;
}
