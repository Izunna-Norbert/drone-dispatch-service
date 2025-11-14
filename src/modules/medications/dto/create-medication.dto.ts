import {
  IsString,
  IsInt,
  Min,
  Matches,
  IsUrl,
  IsNotEmpty,
} from 'class-validator';

export class CreateMedicationDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'Name can only contain letters, numbers, hyphens, and underscores',
  })
  name: string;

  @IsInt()
  @Min(1)
  weight: number;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z0-9_]+$/, {
    message:
      'Code can only contain uppercase letters, numbers, and underscores',
  })
  code: string;

  @IsUrl()
  @IsNotEmpty()
  image: string;
}
