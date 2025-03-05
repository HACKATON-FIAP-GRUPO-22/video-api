import { Test, TestingModule } from '@nestjs/testing';
import { IVideoUseCase } from '../../video/interfaces/video.usecase.interface';
import { ITaskGateway } from '../interfaces/task.gateway.interfaces';
import { TaskUseCase } from './task.usecase';

describe('TaskUseCase', () => {
  let taskUseCase: TaskUseCase;
  let videoUseCaseMock: jest.Mocked<IVideoUseCase>;
  let taskGatewayMock: jest.Mocked<ITaskGateway>;

  beforeEach(async () => {
    videoUseCaseMock = {
      updateStatusVideoProcessed: jest.fn(),
    } as unknown as jest.Mocked<IVideoUseCase>;

    taskGatewayMock = {
      getVideosForProcessed: jest.fn(),
      deleteVideoTask: jest.fn(),
      sendVideo: jest.fn(),
    } as jest.Mocked<ITaskGateway>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskUseCase,
        { provide: IVideoUseCase, useValue: videoUseCaseMock },
        { provide: ITaskGateway, useValue: taskGatewayMock },
      ],
    }).compile();

    taskUseCase = module.get<TaskUseCase>(TaskUseCase);
  });

  it('deve ser definido', () => {
    expect(taskUseCase).toBeDefined();
  });

  describe('processListVideos', () => {
    it('deve processar mensagens da fila e chamar updateStatusVideoProcessed', async () => {
      const mockMessage = {
        Body: JSON.stringify({
          id: 'video123',
          status: 'pronto',
          idVideoProcessed: 'processed123',
        }),
        ReceiptHandle: 'abc123',
      };

      taskGatewayMock.getVideosForProcessed.mockResolvedValue([mockMessage]);

      await taskUseCase.processListVideos();

      expect(taskGatewayMock.getVideosForProcessed).toHaveBeenCalled();

      expect(videoUseCaseMock.updateStatusVideoProcessed).toHaveBeenCalledWith({
        id: 'video123',
        status: 'pronto',
        idVideoProcessed: 'processed123',
      });

      expect(taskGatewayMock.deleteVideoTask).toHaveBeenCalledWith('abc123');
    });

    it('deve ignorar se não houver mensagens na fila', async () => {
      taskGatewayMock.getVideosForProcessed.mockResolvedValue([]);

      await taskUseCase.processListVideos();

      expect(
        videoUseCaseMock.updateStatusVideoProcessed,
      ).not.toHaveBeenCalled();
      expect(taskGatewayMock.deleteVideoTask).not.toHaveBeenCalled();
    });

    it('deve logar erro se updateStatusVideoProcessed falhar', async () => {
      const mockMessage = {
        Body: JSON.stringify({
          id: 'video123',
          status: 'pronto',
          idVideoProcessed: 'processed123',
        }),
        ReceiptHandle: 'abc123',
      };

      taskGatewayMock.getVideosForProcessed.mockResolvedValue([mockMessage]);

      const errorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      videoUseCaseMock.updateStatusVideoProcessed.mockRejectedValue(
        new Error('Erro ao processar'),
      );

      await taskUseCase.processListVideos();

      expect(errorSpy).toHaveBeenCalledWith(
        'TaskUseCase: Erro ao processar mensagem:',
        expect.any(Error),
      );

      expect(taskGatewayMock.deleteVideoTask).toHaveBeenCalledWith('abc123');

      errorSpy.mockRestore();
    });
  });

  describe('sendVideo', () => {
    it('deve enviar uma mensagem para a fila', async () => {
      const message = 'Mensagem de Teste';

      await taskUseCase.sendVideo(message);

      expect(taskGatewayMock.sendVideo).toHaveBeenCalledWith(message);
    });
  });
});
