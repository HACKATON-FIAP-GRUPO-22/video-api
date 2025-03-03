import { Test, TestingModule } from '@nestjs/testing';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { MessageGateway } from './message.gateway';

describe('MessageGateway', () => {
  let messageGateway: MessageGateway;
  let sesClientMock: Partial<SESClient>;

  beforeEach(async () => {
    sesClientMock = {
      send: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageGateway,
        {
          provide: 'SES_CLIENT',
          useValue: sesClientMock,
        },
      ],
    }).compile();

    messageGateway = module.get<MessageGateway>(MessageGateway);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendEmail', () => {
    it('should send email successfully', async () => {
      process.env.AWS_SES_FROM_EMAIL = 'noreply@example.com';

      const to = ['recipient@example.com'];
      const subject = 'Test Subject';
      const body = '<h1>Test Body</h1>';

      (sesClientMock.send as jest.Mock).mockResolvedValue({});

      await messageGateway.sendMessage(to, subject, body);

      expect(sesClientMock.send).toHaveBeenCalledWith(
        expect.any(SendEmailCommand),
      );

      const sentCommand = (sesClientMock.send as jest.Mock).mock
        .calls[0][0] as SendEmailCommand;
      const input = (sentCommand as any).input;

      expect(input).toEqual({
        Destination: {
          ToAddresses: to,
        },
        Message: {
          Body: {
            Html: {
              Charset: 'UTF-8',
              Data: body,
            },
          },
          Subject: {
            Charset: 'UTF-8',
            Data: subject,
          },
        },
        Source: 'noreply@example.com',
      });
    });

    it('should throw an error if email sending fails', async () => {
      process.env.AWS_SES_FROM_EMAIL = 'noreply@example.com';

      (sesClientMock.send as jest.Mock).mockRejectedValue(
        new Error('SES Error'),
      );

      await expect(
        messageGateway.sendMessage(
          ['recipient@example.com'],
          'Subject',
          'Body',
        ),
      ).rejects.toThrow('SES Error');

      expect(sesClientMock.send).toHaveBeenCalled();
    });
  });
});
