import { Test, TestingModule } from '@nestjs/testing';
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { StorageGateway } from './storage.gateway';

jest.mock('@aws-sdk/client-s3');

describe('StorageGateway', () => {
  let s3UseCase: StorageGateway;
  let s3ClientMock: jest.Mocked<S3Client>;

  beforeEach(async () => {
    process.env.AWS_REGION = 'us-east-1';
    process.env.AWS_ACCESS_KEY_ID = 'test-access-key';
    process.env.AWS_SECRET_ACCESS_KEY = 'test-secret-key';
    process.env.AWS_S3_BUCKET_NAME = 'test-bucket';

    (S3Client as jest.Mock).mockImplementation(() => ({
      send: jest.fn(),
    }));

    const module: TestingModule = await Test.createTestingModule({
      providers: [StorageGateway],
    }).compile();

    s3UseCase = module.get<StorageGateway>(StorageGateway);

    // Pegando o mock real do S3Client dentro da StorageGateway
    s3ClientMock = s3UseCase['s3'] as jest.Mocked<S3Client>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadFile', () => {
    it('should upload file to S3', async () => {
      const fileBuffer = Buffer.from('file content');
      const mimeType = 'video/mp4';
      const fileId = 'file-id.mp4';

      (s3ClientMock.send as jest.Mock).mockResolvedValue({});

      await s3UseCase.uploadFile(fileId, fileBuffer, mimeType);

      expect(s3ClientMock.send).toHaveBeenCalledWith(
        expect.any(PutObjectCommand),
      );

      // Pegamos o comando passado para `send()`
      const sentCommand = (s3ClientMock.send as jest.Mock).mock
        .calls[0][0] as PutObjectCommand;

      // Criamos o comando esperado, para comparar o input diretamente
      const expectedCommand = new PutObjectCommand({
        Bucket: 'test-bucket',
        Key: fileId,
        Body: fileBuffer,
        ContentType: mimeType,
      });

      expect(sentCommand.input).toEqual(expectedCommand.input);
    });
  });

  describe('downloadFile', () => {
    it('should download file from S3', async () => {
      const fileId = 'file-id.mp4';
      const fileStream = new Readable();
      fileStream.push('file content');
      fileStream.push(null);

      (s3ClientMock.send as jest.Mock).mockResolvedValue({
        Body: fileStream,
      });

      const result = await s3UseCase.downloadFile(fileId);

      expect(s3ClientMock.send).toHaveBeenCalledWith(
        expect.any(GetObjectCommand),
      );

      // Pegamos o comando passado para `send()`
      const sentCommand = (s3ClientMock.send as jest.Mock).mock
        .calls[0][0] as GetObjectCommand;

      // Para acessar o input corretamente, você pode simular que `GetObjectCommand` é instanciado diretamente no teste:
      const expectedCommand = new GetObjectCommand({
        Bucket: 'test-bucket',
        Key: fileId,
      });

      // Comparando os parâmetros passados diretamente, porque a instância de comando mockada pode perder a forma original
      expect(sentCommand.input).toEqual(expectedCommand.input);

      expect(result).toBe(fileStream);
    });
  });
});
