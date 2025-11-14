import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DronesService } from './drones.service';
import { CreateDroneDto } from './dto/create-drone.dto';
import { UpdateDroneDto } from './dto/update-drone.dto';
import { LoadMedicationDto } from './dto/load-medication.dto';

@Controller('api/drones')
export class DronesController {
  constructor(private readonly dronesService: DronesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDroneDto: CreateDroneDto) {
    return this.dronesService.create(createDroneDto);
  }

  @Get()
  findAll() {
    return this.dronesService.findAll();
  }

  @Get('available')
  findAvailable() {
    return this.dronesService.findAvailable();
  }

  @Get(':serialNumber')
  findOne(@Param('serialNumber') serialNumber: string) {
    return this.dronesService.findOne(serialNumber);
  }

  @Put(':serialNumber')
  update(
    @Param('serialNumber') serialNumber: string,
    @Body() updateDroneDto: UpdateDroneDto,
  ) {
    return this.dronesService.update(serialNumber, updateDroneDto);
  }

  @Post(':serialNumber/load')
  @HttpCode(HttpStatus.OK)
  async loadMedications(
    @Param('serialNumber') serialNumber: string,
    @Body() loadMedicationDto: LoadMedicationDto,
  ) {
    const drone = await this.dronesService.loadMedications(
      serialNumber,
      loadMedicationDto,
    );

    return {
      message: 'Drone loaded successfully',
      drone,
    };
  }

  @Get(':serialNumber/medications')
  getMedications(@Param('serialNumber') serialNumber: string) {
    return this.dronesService.getMedications(serialNumber);
  }

  @Get(':serialNumber/battery')
  getBatteryLevel(@Param('serialNumber') serialNumber: string) {
    return this.dronesService.getBatteryLevel(serialNumber);
  }
}
