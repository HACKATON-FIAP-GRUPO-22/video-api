import { Injectable } from '@nestjs/common';
import { VideoProcessed } from 'src/application/video/entites/video.processed';
import { IVideoUseCase } from '../../video/interfaces/video.usecase.interface';
import { ITaskGateway } from '../interfaces/task.gateway.interfaces';
import { ITaskUseCase } from '../interfaces/task.usecase.interfaces';

@Injectable()
export class TaskUseCase implements ITaskUseCase {
  constructor(
    private videoUseCase: IVideoUseCase,
    private gateway: ITaskGateway,
  ) {}

  async processListVideos() {
    do {
      try {
        const messages = await this.gateway.getVideosForProcessed();

        if (messages && messages.length > 0) {
          for (const message of messages) {
            console.log(
              'MessageConnectService: mensagem recebida ',
              message.Body,
            );

            try {
              const video: VideoProcessed = { ...JSON.parse(message.Body) };
              await this.videoUseCase.updateStatusVideoProcessed(video);
            } catch (error) {
              console.error(
                'MessageConnectService: Erro ao processar mensagem:',
                error,
              );
            }
            await this.gateway.deleteVideoTask(message.ReceiptHandle);
          }
        }
      } catch (error) {
        console.error(
          'MessageConnectService: Erro ao receber mensagens:',
          error,
        );
      }
    } while (true);
  }

  async sendVideo(messageBody: string): Promise<void> {
    this.gateway.sendVideo(messageBody);
  }
}
