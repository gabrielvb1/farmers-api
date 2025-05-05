import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { FarmersModule } from './farmers/farmers.module';
import { PropertiesModule } from './properties/properties.module';
import { CropsModule } from './crops/crops.module';
import { HarvestsModule } from './harvests/harvests.module';
import { SqsModule } from './sqs/sqs.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    SqsModule,
    FarmersModule,
    PropertiesModule,
    HarvestsModule,
    CropsModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
