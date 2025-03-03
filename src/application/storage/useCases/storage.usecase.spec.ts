import { StorageUseCase } from './storage.usecase';
import { IStorageGateway } from '../interfaces/storage.gateway.interface';
import { Readable } from 'stream';

describe('StorageUseCase', () => {
  let useCase: StorageUseCase;
  let gatewayMock: jest.Mocked<IStorageGateway>;

  beforeEach(() => {
    gatewayMock = {
      uploadFile: jest.fn(),
      downloadFile: jest.fn(),
      deleteFile: jest.fn(),
    };

    useCase = new StorageUseCase(gatewayMock);
  });

  describe('uploadFile', () => {
    it('should call gateway uploadFile with correct params', async () => {
      const id = 'file-id';
      const buffer = Buffer.from('file-content');
      const mimeType = 'video/mp4';

      await useCase.uploadFile(id, buffer, mimeType);

      expect(gatewayMock.uploadFile).toHaveBeenCalledWith(id, buffer, mimeType);
    });
  });

  describe('downloadFile', () => {
    it('should call gateway downloadFile and return readable stream', async () => {
      const id = 'file-id';
      const readable = new Readable();
      gatewayMock.downloadFile.mockResolvedValue(readable);

      const result = await useCase.downloadFile(id);

      expect(gatewayMock.downloadFile).toHaveBeenCalledWith(id);
      expect(result).toBe(readable);
    });
  });

  describe('deleteFile', () => {
    it('should call gateway deleteFile with correct id', async () => {
      const id = 'file-id';

      await useCase.deleteFile(id);

      expect(gatewayMock.deleteFile).toHaveBeenCalledWith(id);
    });
  });
});
