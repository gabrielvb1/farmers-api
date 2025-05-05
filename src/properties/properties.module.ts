import { Module } from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { PropertiesController } from './properties.controller';
import { PrismaService } from '../database/prisma.service';
import { PropertyRepository } from './repository/property.repository';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [PropertiesController],
  providers: [
    PrismaService,
    { provide: 'PROPERTY_SERVICE', useClass: PropertiesService },
    { provide: 'PROPERTY_REPOSITORY', useClass: PropertyRepository },
  ],
  exports: ['PROPERTY_SERVICE'],
})
export class PropertiesModule {}
