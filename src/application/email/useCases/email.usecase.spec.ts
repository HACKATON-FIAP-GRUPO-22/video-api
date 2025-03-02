import { Test, TestingModule } from '@nestjs/testing';
import { EmailUseCase } from './email.usecase'; // ajuste o caminho conforme necessário
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

describe('EmailUseCase', () => {
  let emailUseCase: EmailUseCase;
  let sesClientMock: Partial<SESClient>;

  beforeEach(async () => {
    sesClientMock = {
      send: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailUseCase,
        {
          provide: 'SES_CLIENT',
          useValue: sesClientMock,
        },
      ],
    }).compile();

    emailUseCase = module.get<EmailUseCase>(EmailUseCase);
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

      await emailUseCase.sendEmail(to, subject, body);

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
        emailUseCase.sendEmail(['recipient@example.com'], 'Subject', 'Body'),
      ).rejects.toThrow('SES Error');

      expect(sesClientMock.send).toHaveBeenCalled();
    });
  });
});
