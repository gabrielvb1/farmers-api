import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { SqsService } from './sqs.service';
import { SqsConsumer } from './sqs.consumer';
import { FarmersModule } from '../farmers/farmers.module';
import { PropertiesModule } from 'src/properties/properties.module';
import { HarvestsModule } from 'src/harvests/harvests.module';
import { CropsModule } from 'src/crops/crops.module';

@Global()
@Module({
  imports: [
    ConfigModule,
    ScheduleModule.forRoot(),
    FarmersModule,
    PropertiesModule,
    HarvestsModule,
    CropsModule,
  ],
  providers: [SqsService, SqsConsumer],
  exports: [SqsService, SqsConsumer],
})
export class SqsModule {}
