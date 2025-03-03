import { Injectable, OnModuleInit } from '@nestjs/common';
import { ITaskUseCase } from '../../../application/task/interfaces/task.usecase.interfaces';

@Injectable()
export class TaskController implements OnModuleInit {
  constructor(private useCase: ITaskUseCase) {}
  onModuleInit() {
    this.listenQueue();
  }

  async listenQueue(runOnce = false) {
    do {
      try {
        await this.useCase.processListVideos();
      } catch (error) {
        console.log(error);
      }
      if (runOnce) break;
    } while (true);
  }
}
