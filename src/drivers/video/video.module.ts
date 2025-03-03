import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VideoController } from './video.controller';
import { VideoAdapterController } from '../../adapters/video/controller/video.adapter.controller';
import { VideoEntity } from '../../adapters/video/gateway/video.entity';
import { VideoPresenter } from '../../adapters/video/presenter/video.presenter';
import { IVideoUseCase } from '../../application/video/interfaces/video.usecase.interface';
import { VideoUseCase } from '../../application/video/useCases/video.usecase';
import { IVideoData } from '../../application/video/interfaces/video.interface';
import { VideoGateway } from '../../adapters/video/gateway/video.gateway';
import { ITaskUseCase } from '../../application/task/interfaces/task.usecase.interfaces';
import { TaskUseCase } from '../../application/task/useCases/task.usecase';
import { SESClient } from '@aws-sdk/client-ses';
import { IStorageUseCase } from '../../application/storage/interfaces/storage.interface';
import { StorageUseCase } from '../../application/storage/useCases/storage.usecase';
import { IStorageGateway } from '../../application/storage/interfaces/storage.gateway.interface';
import { IMessageUseCase } from '../../application/message/interfaces/message.interface';
import { MessageUseCase } from '../../application/message/useCases/message.usecase';
import { IMessageGateway } from '../../application/message/interfaces/message.gateway';
import { MessageGateway } from '../../adapters/message/gateway/message.gateway';
import { ITaskGateway } from '../../application/task/interfaces/task.gateway.interfaces';
import { TaskGateway } from '../../adapters/task/gateway/task.gateway';
import { StorageGateway } from '../../adapters/storage/gateway/storage.gateway';
import { TaskController } from '../../adapters/task/controller/task.adapter.controller';

@Module({
  imports: [TypeOrmModule.forFeature([VideoEntity])],
  controllers: [VideoController],
  providers: [
    TaskController,
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
    {
      provide: ITaskUseCase,
      useClass: TaskUseCase,
    },
    {
      provide: IMessageUseCase,
      useClass: MessageUseCase,
    },
    {
      provide: IStorageUseCase,
      useClass: StorageUseCase,
    },
    {
      provide: IStorageGateway,
      useClass: StorageGateway,
    },
    {
      provide: IMessageGateway,
      useClass: MessageGateway,
    },
    {
      provide: ITaskGateway,
      useClass: TaskGateway,
    },
    {
      provide: 'SES_CLIENT',
      useFactory: () => {
        return new SESClient({
          region: process.env.AWS_REGION,
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          },
        });
      },
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
