import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';
import { IEmailUseCase } from '../../../application/email/interfaces/email.interface';
import { IQueueUseCase } from '../../../application/queue/interfaces/queue.usecase.interfaces';
import { IS3UseCase } from '../../../application/s3/interfaces/s3.interface';
import { Video } from '../entites/video';
import { IVideoData } from '../interfaces/video.interface';
import { IVideoUseCase } from '../interfaces/video.usecase.interface';
import { VideoProcessed } from './../entites/video.processed';

@Injectable()
export class VideoUseCase implements IVideoUseCase {
  constructor(
    @Inject(forwardRef(() => IVideoData))
    private persist: IVideoData,
    private email: IEmailUseCase,
    private s3: IS3UseCase,
    private queue: IQueueUseCase,
  ) {}

  async save(video: Video): Promise<Video> {
    const idVideoS3 = uuidv4();

    await this.s3.uploadFile(idVideoS3, video.file.buffer, video.file.mimetype);
    video.idVideo = idVideoS3;
    this.queue.sendVideo(idVideoS3);

    return this.persist.save(video);
  }

  async getVideosByUser(user: string): Promise<Video[]> {
    return this.persist.getVideosByUser(user);
  }

  async downloadFile(id: string): Promise<Readable> {
    return await this.s3.downloadFile(id);
  }

  async updateStatusVideoProcessed(
    videoProcessed: VideoProcessed,
  ): Promise<void> {
    this.sendEmailError(videoProcessed);
    this.persist.updateStatusVideoProcessed(videoProcessed);
  }

  private async sendEmailError(videoProcessed: VideoProcessed) {
    if (videoProcessed.status === 'erro') {
      const video = await this.persist.getVideoEntityById(videoProcessed.id);

      this.email.sendEmail(
        [video.userEmail],
        'Fiap: Erro ao processar vídeo',
        `Aconteceu uma falha e o vídeo ${videoProcessed.id} não foi processado:`,
      );
    }
  }
}
