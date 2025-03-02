import { OnModuleInit } from '@nestjs/common';

export abstract class IQueueUseCase implements OnModuleInit {
  abstract sendVideo(messageBody: string): Promise<void>;
  abstract onModuleInit(): any;
}
