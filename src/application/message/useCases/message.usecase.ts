import { Injectable } from '@nestjs/common';
import { IMessageGateway } from '../interfaces/message.gateway';
import { IMessageUseCase } from '../interfaces/message.interface';

@Injectable()
export class MessageUseCase implements IMessageUseCase {
  constructor(private gateway: IMessageGateway) {}

  async sendMessageErrorVideoProcessed(
    to: string[],
    subject: string,
    body: string,
  ): Promise<void> {
    await this.gateway.sendMessage(to, subject, body);
  }
}
