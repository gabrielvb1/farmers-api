import { Module, forwardRef } from '@nestjs/common';
import { CropsService } from './crops.service';
import { CropsController } from './crops.controller';
import { PrismaService } from '../database/prisma.service';
import { CropRepository } from './repository/crop-repository';
import { HarvestsModule } from '../harvests/harvests.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [forwardRef(() => HarvestsModule), ConfigModule],
  controllers: [CropsController],
  providers: [
    PrismaService,
    {
      provide: 'CROP_SERVICE',
      useClass: CropsService,
    },
    {
      provide: 'CROP_REPOSITORY',
      useClass: CropRepository,
    },
  ],
  exports: ['CROP_SERVICE', 'CROP_REPOSITORY'],
})
export class CropsModule {}
