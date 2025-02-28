import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdaptersModule } from './adapters/adapters.module';
import { ApplicationModule } from './application/application.module';
import { PostgresConfigService } from './system/config/postgres.config.service';
import { FilterExceptionGlobal } from './system/filtros/filter-exception-global';

@Module({
  imports: [
    ApplicationModule,
    AdaptersModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useClass: PostgresConfigService,
      inject: [PostgresConfigService],
    }),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: FilterExceptionGlobal,
    },
  ],
})
export class AppModule {}
