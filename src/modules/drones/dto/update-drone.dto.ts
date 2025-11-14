import {
  IsString,
  IsEnum,
  IsInt,
  Min,
  Max,
  IsOptional,
} from 'class-validator';
import { DroneModel } from '../../../common/enums/drone-model.enum';

export class UpdateDroneDto {
  @IsOptional()
  @IsEnum(DroneModel)
  model?: DroneModel;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(500)
  weightLimit?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  batteryCapacity?: number;
}

