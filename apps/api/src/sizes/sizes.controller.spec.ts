import { Test, TestingModule } from '@nestjs/testing';
import { SizeController } from './sizes.controller';
import { SizeService } from './sizes.service';

describe('SizeController', () => {
  let controller: SizeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SizeController],
      providers: [SizeService],
    }).compile();

    controller = module.get<SizeController>(SizeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
