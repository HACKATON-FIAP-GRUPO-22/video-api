import {
  DeleteMessageCommand,
  ReceiveMessageCommand,
  SendMessageCommand,
  SQSClient,
} from '@aws-sdk/client-sqs';
import { TaskGateway } from './task.gateway';

jest.mock('@aws-sdk/client-sqs');

describe('TaskGateway', () => {
  let gateway: TaskGateway;
  let sqsClientMock: jest.Mocked<SQSClient>;

  beforeEach(() => {
    sqsClientMock = new SQSClient({}) as jest.Mocked<SQSClient>;
    (SQSClient as jest.Mock).mockImplementation(() => sqsClientMock);

    process.env.AWS_REGION = 'us-east-1';
    process.env.AWS_SQS_ENDPOINT = 'http://localhost:4566';
    process.env.AWS_ACCESS_KEY_ID = 'test';
    process.env.AWS_SECRET_ACCESS_KEY = 'test';
    process.env.QUEUE_PROCESSAR = 'queue-processar-url';
    process.env.QUEUE_PROCESSADOS = 'queue-processados-url';

    gateway = new TaskGateway();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getVideosForProcessed', () => {
    it('should receive messages from SQS', async () => {
      const messages = [
        {
          Body: JSON.stringify({ id: 'video123' }),
          ReceiptHandle: 'receipt-handle-123',
        },
      ];

      sqsClientMock.send = jest.fn().mockResolvedValue({ Messages: messages });

      const result = await gateway.getVideosForProcessed();

      expect(sqsClientMock.send).toHaveBeenCalledWith(
        expect.any(ReceiveMessageCommand),
      );
      expect(result).toEqual(messages);
    });

    it('should return empty array if no messages are received', async () => {
      sqsClientMock.send = jest.fn().mockResolvedValue({ Messages: undefined });

      const result = await gateway.getVideosForProcessed();

      expect(result).toEqual([]);
    });
  });

  describe('sendVideo', () => {
    it('should send video message to SQS', async () => {
      const messageBody = 'test-message-body';

      (sqsClientMock.send as jest.Mock).mockResolvedValue({});

      await gateway.sendVideo(messageBody);

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

      await gateway.sendVideo(messageBody);

      expect(consoleSpy).toHaveBeenCalledWith(
        `Mensagem enviada: ${messageBody}`,
      );

      consoleSpy.mockRestore();
    });
  });

  describe('deleteVideoTask', () => {
    it('should delete video message from SQS', async () => {
      const receiptHandle = 'test-receipt-handle';

      (sqsClientMock.send as jest.Mock).mockResolvedValue({});

      await gateway.deleteVideoTask(receiptHandle);

      expect(DeleteMessageCommand).toHaveBeenCalledWith({
        QueueUrl: process.env.QUEUE_PROCESSADOS,
        ReceiptHandle: receiptHandle,
      });

      expect(sqsClientMock.send).toHaveBeenCalledWith(
        expect.any(DeleteMessageCommand),
      );
    });

    it('should log the deleted message', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const receiptHandle = 'test-receipt-handle';

      (sqsClientMock.send as jest.Mock).mockResolvedValue({});

      await gateway.deleteVideoTask(receiptHandle);

      expect(consoleSpy).toHaveBeenCalledWith(
        `Mensagem deletada: ${receiptHandle}`,
      );

      consoleSpy.mockRestore();
    });
  });
});
