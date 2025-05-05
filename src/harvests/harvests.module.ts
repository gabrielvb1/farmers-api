import { Module } from '@nestjs/common';
import { HarvestsService } from './harvests.service';
import { HarvestsController } from './harvests.controller';
import { PrismaService } from '../database/prisma.service';
import { HarvestRepository } from './repository/harvest.repository';
import { PropertyRepository } from '../properties/repository/property.repository';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [HarvestsController],
  providers: [
    PrismaService,
    { provide: 'HARVEST_SERVICE', useClass: HarvestsService },
    { provide: 'HARVEST_REPOSITORY', useClass: HarvestRepository },
    { provide: 'PROPERTY_REPOSITORY', useClass: PropertyRepository },
  ],
  exports: ['HARVEST_SERVICE', 'HARVEST_REPOSITORY'],
})
export class HarvestsModule {}
