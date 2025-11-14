import { Type } from 'class-transformer';
import { ValidateNested, ArrayMinSize, IsArray } from 'class-validator';
import { CreateMedicationDto } from '../../medications/dto/create-medication.dto';

export class LoadMedicationDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateMedicationDto)
  medications: CreateMedicationDto[];
}
