import {
  DeleteMessageCommand,
  ReceiveMessageCommand,
  SendMessageCommand,
  SQSClient,
} from '@aws-sdk/client-sqs';
import { Injectable } from '@nestjs/common';
import { IQueueUseCase } from '../interfaces/queue.usecase.interfaces';
import { IVideoUseCase } from '../../../application/video/interfaces/video.usecase.interface';
import { VideoProcessed } from 'src/application/video/entites/video.processed';

@Injectable()
export class QueueUseCase implements IQueueUseCase {
  private readonly client: SQSClient;
  private maxMessage: number;

  constructor(private videoUseCase: IVideoUseCase) {
    this.maxMessage = 1;
    this.client = new SQSClient({
      region: process.env.AWS_REGION,
      endpoint: process.env.AWS_SQS_ENDPOINT,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        // sessionToken: process.env.AWS_SESSION_TOKEN,
      },
    });
  }
  onModuleInit() {
    this.listenQueue();
  }

  async listenQueue() {
    do {
      try {
        const messages = await this.getVideosForProcess();

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
            await this.deleteVideoQueue(message.ReceiptHandle);
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

  async getVideosForProcess(): Promise<any[]> {
    const command = new ReceiveMessageCommand({
      QueueUrl: process.env.QUEUE_PROCESSADOS,
      MaxNumberOfMessages: this.maxMessage,
      WaitTimeSeconds: 20,
      VisibilityTimeout: 10,
    });

    const response = await this.client.send(command);
    return response?.Messages || [];
  }

  async sendVideo(messageBody: string): Promise<void> {
    const command = new SendMessageCommand({
      QueueUrl: process.env.QUEUE_PROCESSAR,
      MessageBody: messageBody,
    });

    await this.client.send(command);
    console.log(`Mensagem enviada: ${messageBody}`);
  }

  async deleteVideoQueue(receiptHandle: string): Promise<void> {
    const command = new DeleteMessageCommand({
      QueueUrl: process.env.QUEUE_PROCESSADOS,
      ReceiptHandle: receiptHandle,
    });

    await this.client.send(command);
    console.log(`Mensagem deletada: ${receiptHandle}`);
  }
}
