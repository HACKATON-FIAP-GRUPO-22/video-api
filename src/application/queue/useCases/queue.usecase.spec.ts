import { ReceiveMessageCommand, SQSClient } from '@aws-sdk/client-sqs';
import { IVideoUseCase } from '../../../application/video/interfaces/video.usecase.interface';
import { QueueUseCase } from './queue.usecase';

jest.mock('@aws-sdk/client-sqs', () => {
  return {
    SQSClient: jest.fn().mockImplementation(() => ({
      send: jest.fn(),
    })),
    SendMessageCommand: jest.fn(),
    DeleteMessageCommand: jest.fn(),
    ReceiveMessageCommand: jest.fn(),
  };
});

describe('QueueUseCase', () => {
  let queueUseCase: QueueUseCase;
  let sqsClientMock: jest.Mocked<SQSClient>;
  let videoUseCaseMock: jest.Mocked<IVideoUseCase>;

  beforeEach(() => {
    videoUseCaseMock = {
      updateStatusVideoProcessed: jest.fn(),
    } as any;

    sqsClientMock = new SQSClient({}) as jest.Mocked<SQSClient>;

    (SQSClient as jest.Mock).mockImplementation(() => sqsClientMock);

    queueUseCase = new QueueUseCase(videoUseCaseMock);
  });

  describe('getVideosForProcess', () => {
    it('should receive messages from SQS', async () => {
      const messages = [{ Body: 'test-body', ReceiptHandle: 'receipt' }];

      (sqsClientMock.send as jest.Mock).mockResolvedValue({
        Messages: messages,
      });

      const result = await queueUseCase.getVideosForProcess();

      expect(sqsClientMock.send).toHaveBeenCalledWith(
        expect.any(ReceiveMessageCommand),
      );
      expect(result).toEqual(messages);
    });

    it('should return empty array if no messages', async () => {
      (sqsClientMock.send as jest.Mock).mockResolvedValue({
        Messages: undefined,
      });

      const result = await queueUseCase.getVideosForProcess();

      expect(result).toEqual([]);
    });
  });
});
