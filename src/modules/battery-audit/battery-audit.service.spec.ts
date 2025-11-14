import { Test, TestingModule } from '@nestjs/testing';
import { BatteryAuditService } from './battery-audit.service';

describe('BatteryAuditService', () => {
  let service: BatteryAuditService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BatteryAuditService],
    }).compile();

    service = module.get<BatteryAuditService>(BatteryAuditService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
