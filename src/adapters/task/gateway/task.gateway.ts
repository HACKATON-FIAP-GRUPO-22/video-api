import {
  DeleteMessageCommand,
  ReceiveMessageCommand,
  SendMessageCommand,
  SQSClient,
} from '@aws-sdk/client-sqs';
import { Injectable } from '@nestjs/common';
import { ITaskGateway } from '../../../application/task/interfaces/task.gateway.interfaces';

@Injectable()
export class TaskGateway implements ITaskGateway {
  private readonly client: SQSClient;
  private maxMessage: number;

  constructor() {
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

  async getVideosForProcessed(): Promise<any[]> {
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

  async deleteVideoTask(receiptHandle: string): Promise<void> {
    const command = new DeleteMessageCommand({
      QueueUrl: process.env.QUEUE_PROCESSADOS,
      ReceiptHandle: receiptHandle,
    });

    await this.client.send(command);
    console.log(`Mensagem deletada: ${receiptHandle}`);
  }
}
