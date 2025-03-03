import { ITaskUseCase } from '../../../application/task/interfaces/task.usecase.interfaces';
import { TaskController } from './task.adapter.controller';

describe('TaskController', () => {
  let controller: TaskController;
  let useCaseMock: jest.Mocked<ITaskUseCase>;

  beforeEach(() => {
    useCaseMock = {
      processListVideos: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<ITaskUseCase>;

    controller = new TaskController(useCaseMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('onModuleInit', () => {
    it('should call listenQueue', async () => {
      jest.spyOn(controller, 'listenQueue').mockImplementation();
      controller.onModuleInit();
      expect(controller.listenQueue).toHaveBeenCalled();
    });
  });

  describe('listenQueue', () => {
    it('should call processListVideos once in a testable mode', async () => {
      await controller.listenQueue(true); // Passa a flag para rodar só uma vez
      expect(useCaseMock.processListVideos).toHaveBeenCalledTimes(1);
    });

    it('should log error if processListVideos throws', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      useCaseMock.processListVideos.mockRejectedValueOnce(
        new Error('Test Error'),
      );

      await controller.listenQueue(true);

      expect(consoleSpy).toHaveBeenCalledWith(new Error('Test Error'));
      consoleSpy.mockRestore();
    });
  });
});
