import { QueueUseCase } from './queue.usecase';
import {
  SQSClient,
  SendMessageCommand,
  ReceiveMessageCommand,
} from '@aws-sdk/client-sqs';
import { IVideoUseCase } from 'src/application/video/interfaces/video.usecase.interface';

// Mock do SDK da AWS
jest.mock('@aws-sdk/client-sqs', () => {
  return {
    SQSClient: jest.fn().mockImplementation(() => ({
      send: jest.fn(),
    })),
    SendMessageCommand: jest.fn(),
    ReceiveMessageCommand: jest.fn(),
  };
});

describe('QueueUseCase', () => {
  let queueUseCase: QueueUseCase;
  let sqsClientMock: jest.Mocked<SQSClient>;
  let videoUseCaseMock: jest.Mocked<IVideoUseCase>;

  beforeEach(() => {
    // Mock do IVideoUseCase (não usado diretamente nesses testes, mas necessário pro construtor)
    videoUseCaseMock = {
      updateStatusVideoProcessed: jest.fn(),
    } as any;

    // Mock do SQSClient
    sqsClientMock = new SQSClient({}) as jest.Mocked<SQSClient>;
    (SQSClient as jest.Mock).mockImplementation(() => sqsClientMock);

    // Instancia a classe testada
    queueUseCase = new QueueUseCase(videoUseCaseMock);
  });

  describe('sendVideo', () => {
    it('should send video message to SQS', async () => {
      const messageBody = 'test-message-body';

      // Simula sucesso no envio
      (sqsClientMock.send as jest.Mock).mockResolvedValue({});

      await queueUseCase.sendVideo(messageBody);

      expect(SendMessageCommand).toHaveBeenCalledWith({
        QueueUrl: process.env.QUEUE_PROCESSAR,
        MessageBody: messageBody,
      });

      expect(sqsClientMock.send).toHaveBeenCalledWith(
        expect.any(SendMessageCommand),
      );
    });

    it('should log the message being sent', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const messageBody = 'test-message-body';

      (sqsClientMock.send as jest.Mock).mockResolvedValue({});

      await queueUseCase.sendVideo(messageBody);

      expect(consoleSpy).toHaveBeenCalledWith(
        `Mensagem enviada: ${messageBody}`,
      );

      consoleSpy.mockRestore();
    });
  });

  describe('getVideosForProcess', () => {
    it('should receive messages from SQS', async () => {
      const messages = [{ Body: 'test-body', ReceiptHandle: 'receipt' }];

      // Simula a resposta da fila
      (sqsClientMock.send as jest.Mock).mockResolvedValue({
        Messages: messages,
      });

      const result = await queueUseCase.getVideosForProcess();

      expect(ReceiveMessageCommand).toHaveBeenCalledWith({
        QueueUrl: process.env.QUEUE_PROCESSADOS,
        MaxNumberOfMessages: 1,
        WaitTimeSeconds: 20,
        VisibilityTimeout: 10,
      });

      expect(sqsClientMock.send).toHaveBeenCalledWith(
        expect.any(ReceiveMessageCommand),
      );
      expect(result).toEqual(messages);
    });

    it('should return empty array if no messages', async () => {
      // Simula fila vazia
      (sqsClientMock.send as jest.Mock).mockResolvedValue({
        Messages: undefined,
      });

      const result = await queueUseCase.getVideosForProcess();

      expect(result).toEqual([]);
    });
  });
});
