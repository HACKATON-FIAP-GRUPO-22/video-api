import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VideoController } from './video.controller';
import { VideoAdapterController } from 'src/adapters/video/controller/video.adapter.controller';
import { VideoEntity } from '../../adapters/video/gateway/video.entity';
import { VideoPresenter } from '../../adapters/video/presenter/video.presenter';
import { IVideoUseCase } from '../../application/video/interfaces/video.usecase.interface';
import { VideoUseCase } from '../../application/video/useCases/video.usecase';
import { IVideoData } from '../../application/video/interfaces/video.interface';
import { VideoGateway } from '../../adapters/video/gateway/video.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([VideoEntity])],
  controllers: [VideoController],
  providers: [
    {
      provide: VideoAdapterController,
      useClass: VideoAdapterController,
    },
    {
      provide: VideoPresenter,
      useClass: VideoPresenter,
    },
    {
      provide: IVideoUseCase,
      useClass: VideoUseCase,
    },
    {
      provide: IVideoData,
      useClass: VideoGateway,
    },
  ],
  exports: [
    {
      provide: IVideoUseCase,
      useClass: VideoUseCase,
    },
  ],
})
export class VideoModule {}
