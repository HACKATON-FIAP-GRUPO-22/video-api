import { Test, TestingModule } from '@nestjs/testing';
import { Readable } from 'stream';
import { IEmailUseCase } from '../../../application/email/interfaces/email.interface';
import { IQueueUseCase } from '../../../application/queue/interfaces/queue.usecase.interfaces';
import { IS3UseCase } from '../../../application/s3/interfaces/s3.interface';
import { Video } from '../entites/video';
import { VideoProcessed } from '../entites/video.processed';
import { IVideoData } from '../interfaces/video.interface';
import { VideoUseCase } from './video.usecase'; // ajuste o caminho

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('mocked-uuid'),
}));

describe('VideoUseCase', () => {
  let useCase: VideoUseCase;

  // Mocks
  let persistMock: jest.Mocked<IVideoData>;
  let emailMock: jest.Mocked<IEmailUseCase>;
  let s3Mock: jest.Mocked<IS3UseCase>;
  let queueMock: jest.Mocked<IQueueUseCase>;

  beforeEach(async () => {
    persistMock = {
      save: jest.fn(),
      getVideosByUser: jest.fn(),
      getVideoEntityById: jest.fn(),
      convertCreateEntity: jest.fn(),
      updateStatusVideoProcessed: jest.fn(),
    };

    emailMock = {
      sendEmail: jest.fn(),
    };

    s3Mock = {
      uploadFile: jest.fn(),
      downloadFile: jest.fn(),
    };

    queueMock = {
      sendVideo: jest.fn(),
      onModuleInit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VideoUseCase,
        { provide: IVideoData, useValue: persistMock },
        { provide: IEmailUseCase, useValue: emailMock },
        { provide: IS3UseCase, useValue: s3Mock },
        { provide: IQueueUseCase, useValue: queueMock },
      ],
    }).compile();

    useCase = module.get<VideoUseCase>(VideoUseCase);
  });

  describe('save', () => {
    it('should upload file, send to queue and persist video', async () => {
      const video = new Video();
      video.file = { buffer: Buffer.from('file'), mimetype: 'video/mp4' };

      persistMock.save.mockResolvedValue(video);

      const result = await useCase.save(video);

      expect(s3Mock.uploadFile).toHaveBeenCalledWith(
        'mocked-uuid',
        video.file.buffer,
        video.file.mimetype,
      );
      expect(queueMock.sendVideo).toHaveBeenCalledWith('mocked-uuid');
      expect(persistMock.save).toHaveBeenCalledWith(video);

      expect(result).toEqual(video);
    });
  });

  describe('getVideosByUser', () => {
    it('should get videos by user', async () => {
      const videos = [new Video()];
      persistMock.getVideosByUser.mockResolvedValue(videos);

      const result = await useCase.getVideosByUser('user123');

      expect(persistMock.getVideosByUser).toHaveBeenCalledWith('user123');
      expect(result).toEqual(videos);
    });
  });

  describe('downloadFile', () => {
    it('should call S3 to download file', async () => {
      const stream = new Readable();
      s3Mock.downloadFile.mockResolvedValue(stream);

      const result = await useCase.downloadFile('video-id');

      expect(s3Mock.downloadFile).toHaveBeenCalledWith('video-id');
      expect(result).toBe(stream);
    });
  });

  describe('updateStatusVideoProcessed', () => {
    it('should call update and send email if status is "erro"', async () => {
      const videoProcessed: VideoProcessed = {
        id: 'video-id',
        status: 'erro',
        idVideoProcessed: 'processed-id',
      };

      const video = new Video();
      video.userEmail = 'user@example.com';
      persistMock.getVideoEntityById.mockResolvedValue(video);

      await useCase.updateStatusVideoProcessed(videoProcessed);

      expect(persistMock.updateStatusVideoProcessed).toHaveBeenCalledWith(
        videoProcessed,
      );
      expect(emailMock.sendEmail).toHaveBeenCalledWith(
        ['user@example.com'],
        'Fiap: Erro ao processar vídeo',
        'Aconteceu uma falha e o vídeo video-id não foi processado:',
      );
    });

    it('should not send email if status is not "erro"', async () => {
      const videoProcessed: VideoProcessed = {
        id: 'video-id',
        status: 'processado',
        idVideoProcessed: 'processed-id',
      };

      await useCase.updateStatusVideoProcessed(videoProcessed);

      expect(emailMock.sendEmail).not.toHaveBeenCalled();
      expect(persistMock.updateStatusVideoProcessed).toHaveBeenCalledWith(
        videoProcessed,
      );
    });
  });
});
