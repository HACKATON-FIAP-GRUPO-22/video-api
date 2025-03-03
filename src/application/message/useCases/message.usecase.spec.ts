import { Test, TestingModule } from '@nestjs/testing';
import { MessageUseCase } from './message.usecase';
import { IMessageGateway } from '../interfaces/message.gateway';

describe('MessageUseCase', () => {
  let useCase: MessageUseCase;
  let gatewayMock: jest.Mocked<IMessageGateway>;

  beforeEach(async () => {
    gatewayMock = {
      sendMessage: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageUseCase,
        { provide: IMessageGateway, useValue: gatewayMock },
      ],
    }).compile();

    useCase = module.get<MessageUseCase>(MessageUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('sendMessageErrorVideoProcessed', () => {
    it('should call gateway to send message', async () => {
      const to = ['user@example.com'];
      const subject = 'Erro no processamento de vídeo';
      const body = 'O vídeo falhou durante o processamento';

      await useCase.sendMessageErrorVideoProcessed(to, subject, body);

      expect(gatewayMock.sendMessage).toHaveBeenCalledWith(to, subject, body);
    });

    it('should handle errors if gateway throws', async () => {
      gatewayMock.sendMessage.mockRejectedValue(new Error('Gateway error'));

      await expect(
        useCase.sendMessageErrorVideoProcessed(
          ['user@example.com'],
          'Erro no processamento',
          'Detalhes do erro',
        ),
      ).rejects.toThrowError();

      expect(gatewayMock.sendMessage).toHaveBeenCalled();
    });
  });
});
