import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';
import { ITaskUseCase } from '../../task/interfaces/task.usecase.interfaces';
import { IStorageUseCase } from '../../storage/interfaces/storage.interface';
import { Video } from '../entites/video';
import { IVideoData } from '../interfaces/video.interface';
import { IVideoUseCase } from '../interfaces/video.usecase.interface';
import { VideoProcessed } from './../entites/video.processed';
import { BusinessRuleException } from '../../../system/filtros/business-rule-exception';
import { IMessageUseCase } from '../../../application/message/interfaces/message.interface';

@Injectable()
export class VideoUseCase implements IVideoUseCase {
  constructor(
    @Inject(forwardRef(() => IVideoData))
    private persist: IVideoData,
    private message: IMessageUseCase,
    private storage: IStorageUseCase,
    private task: ITaskUseCase,
  ) {}

  async save(video: Video): Promise<Video> {
    const idVideo = `${video.file.originalname}_${uuidv4()}`;
    video.idVideo = idVideo;

    try {
      await this.storage.uploadFile(
        idVideo,
        video.file.buffer,
        video.file.mimetype,
      );
      const videoSave = await this.persist.save(video);
      await this.task.sendVideo(idVideo);
      return videoSave;
    } catch (error) {
      this.handleFailure(idVideo, error);
      throw new BusinessRuleException('Erro ao tentar salvar o vídeo');
    }
  }

  private async handleFailure(idVideo: string, error: any): Promise<void> {
    console.log(error);
    console.warn(`Erro ao salvar o vídeo: ${error.message}`);
    try {
      await this.storage.deleteFile(idVideo);
    } catch (s3Error) {
      console.warn(`Erro ao excluir o vídeo ${idVideo}:`, s3Error.message);
    }

    try {
      await this.persist.deleteVideo(idVideo);
    } catch (error) {
      console.warn(`Falha deletar o video ${idVideo}:`, error.message);
    }
  }

  async getVideosByUser(user: string): Promise<Video[]> {
    return this.persist.getVideosByUser(user);
  }

  async downloadFile(id: string): Promise<Readable> {
    return await this.storage.downloadFile(id);
  }

  async updateStatusVideoProcessed(
    videoProcessed: VideoProcessed,
  ): Promise<void> {
    this.sendMessageErroVideoProcessed(videoProcessed);
    this.persist.updateStatusVideoProcessed(videoProcessed);
  }

  private async sendMessageErroVideoProcessed(videoProcessed: VideoProcessed) {
    if (videoProcessed.status === 'erro') {
      const video = await this.persist.getVideoEntityById(videoProcessed.id);

      this.message.sendMessageErrorVideoProcessed(
        [video.userEmail],
        'Fiap: Erro ao processar vídeo',
        `Aconteceu uma falha e o vídeo ${videoProcessed.id} não foi processado:`,
      );
    }
  }
}
