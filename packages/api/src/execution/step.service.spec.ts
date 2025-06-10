import { Test, TestingModule } from '@nestjs/testing';
import { StepService } from './step.service';
import { HttpModule } from '@nestjs/axios';
import { BusinessConfigModule } from '@module/business-config/business-config.module';

describe('StepService', () => {
  let service: StepService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule, BusinessConfigModule],
      providers: [StepService],
    }).compile();

    service = module.get<StepService>(StepService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('executeFeIntegration', () => {
    it('should execute frontend integration', async () => {
      const params = {
        product: 'xdr-local',
        businessRepoParams: { key: { name: 'value', version: '1.0.0' } },
        baselineBranch: 'main',
        targetBranch: 'feature/test'
      };

      await expect(service.executeFeIntegration(params)).resolves.not.toThrow();
    });
  });

  describe('executeFePack', () => {
    it('should execute frontend pack', async () => {
      const params = {
        product: 'test-product',
        targetBranch: 'feature/test',
        productType: 'web'
      };

      await expect(service.executeFePack(params)).resolves.not.toThrow();
    });
  });

  describe('executeLocalIntegration', () => {
    it('should execute local integration', async () => {
      const params = {
        product: 'test-product',
        baselineBranch: 'main',
        targetBranch: 'feature/test',
        createMergeRequest: true
      };

      await expect(service.executeLocalIntegration(params)).resolves.not.toThrow();
    });
  });

  describe('executeCmpIntegration', () => {
    it('should execute CMP integration', async () => {
      const params = {
        product: 'test-product',
        baselineBranch: 'main',
        targetBranch: 'feature/test',
        createMergeRequest: true
      };

      await expect(service.executeCmpIntegration(params)).resolves.not.toThrow();
    });
  });
});
