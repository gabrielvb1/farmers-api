import { Module } from '@nestjs/common';
import { FarmersService } from './farmers.service';
import { FarmersController } from './farmers.controller';
import { PrismaService } from '../database/prisma.service';
import { FarmerRepository } from './repository/farmer.repository';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [FarmersController],
  providers: [
    PrismaService,
    {
      provide: 'FARMER_SERVICE',
      useClass: FarmersService,
    },
    {
      provide: 'FARMER_REPOSITORY',
      useClass: FarmerRepository,
    },
  ],
  exports: ['FARMER_SERVICE'],
})
export class FarmersModule {}
