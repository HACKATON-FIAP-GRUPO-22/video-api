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
import { IQueueUseCase } from '../../application/queue/interfaces/queue.usecase.interfaces';
import { QueueUseCase } from '../../application/queue/useCases/queue.usecase';
import { IEmailUseCase } from 'src/application/email/interfaces/email.interface';
import { EmailUseCase } from 'src/application/email/useCases/email.usecase';
import { SESClient } from '@aws-sdk/client-ses';
import { IS3UseCase } from 'src/application/s3/interfaces/s3.interface';
import { S3UseCase } from 'src/application/s3/useCases/s3.usecase';

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
    {
      provide: IQueueUseCase,
      useClass: QueueUseCase,
    },
    {
      provide: IEmailUseCase,
      useClass: EmailUseCase,
    },
    {
      provide: IS3UseCase,
      useClass: S3UseCase,
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
