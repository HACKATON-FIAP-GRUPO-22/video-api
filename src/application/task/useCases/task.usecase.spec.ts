/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { IVideoUseCase } from '../../video/interfaces/video.usecase.interface';
import { ITaskGateway } from '../interfaces/task.gateway.interfaces';
import { TaskUseCase } from './task.usecase';

describe('TaskUseCase', () => {
  let useCase: TaskUseCase;
  let videoUseCaseMock: jest.Mocked<IVideoUseCase>;
  let gatewayMock: jest.Mocked<ITaskGateway>;

  beforeEach(async () => {
    videoUseCaseMock = {
      updateStatusVideoProcessed: jest.fn(),
    } as any;

    gatewayMock = {
      getVideosForProcessed: jest.fn(),
      deleteVideoTask: jest.fn(),
      sendVideo: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskUseCase,
        { provide: IVideoUseCase, useValue: videoUseCaseMock },
        { provide: ITaskGateway, useValue: gatewayMock },
      ],
    }).compile();

    useCase = module.get<TaskUseCase>(TaskUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('sendVideo', () => {
    it('should call gateway to send video message', async () => {
      const messageBody = JSON.stringify({ idVideo: 'video123' });

      await useCase.sendVideo(messageBody);

      expect(gatewayMock.sendVideo).toHaveBeenCalledWith(messageBody);
    });
  });
});
