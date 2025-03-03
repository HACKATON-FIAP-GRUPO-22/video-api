import { Test, TestingModule } from '@nestjs/testing';
import { VideoUseCase } from './video.usecase';
import { IVideoData } from '../interfaces/video.interface';
import { IStorageUseCase } from '../../storage/interfaces/storage.interface';
import { ITaskUseCase } from '../../task/interfaces/task.usecase.interfaces';
import { IMessageUseCase } from '../../message/interfaces/message.interface';
import { Video } from '../entites/video';
import { Readable } from 'stream';
import { VideoProcessed } from '../entites/video.processed';
import { BusinessRuleException } from '../../../system/filtros/business-rule-exception';

describe('VideoUseCase', () => {
  let useCase: VideoUseCase;
  let persistMock: jest.Mocked<IVideoData>;
  let storageMock: jest.Mocked<IStorageUseCase>;
  let taskMock: jest.Mocked<ITaskUseCase>;
  let messageMock: jest.Mocked<IMessageUseCase>;

  beforeEach(async () => {
    persistMock = {
      save: jest.fn(),
      convertCreateEntity: jest.fn(),
      deleteVideo: jest.fn(),
      getVideosByUser: jest.fn(),
      getVideoEntityById: jest.fn(),
      updateStatusVideoProcessed: jest.fn(),
    };

    storageMock = {
      uploadFile: jest.fn(),
      downloadFile: jest.fn(),
      deleteFile: jest.fn(),
    };

    taskMock = {
      sendVideo: jest.fn(),
      processListVideos: jest.fn(),
    };

    messageMock = {
      sendMessageErrorVideoProcessed: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VideoUseCase,
        { provide: IVideoData, useValue: persistMock },
        { provide: IStorageUseCase, useValue: storageMock },
        { provide: ITaskUseCase, useValue: taskMock },
        { provide: IMessageUseCase, useValue: messageMock },
      ],
    }).compile();

    useCase = module.get<VideoUseCase>(VideoUseCase);
  });

  describe('save', () => {
    it('should save video and send to queue', async () => {
      const fileMock = {
        originalname: 'video.mp4',
        buffer: Buffer.from('file-content'),
        mimetype: 'video/mp4',
      };

      const video = new Video();
      video.file = fileMock;

      persistMock.save.mockResolvedValue(video);

      const result = await useCase.save(video);

      expect(storageMock.uploadFile).toHaveBeenCalledWith(
        expect.stringMatching(/video\.mp4_/),
        fileMock.buffer,
        fileMock.mimetype,
      );
      expect(persistMock.save).toHaveBeenCalledWith(
        expect.objectContaining({ idVideo: expect.any(String) }),
      );
      expect(taskMock.sendVideo).toHaveBeenCalledWith(
        expect.stringMatching(/video\.mp4_/),
      );
      expect(result).toBe(video);
    });

    it('should handle failure by deleting file and video record', async () => {
      const fileMock = {
        originalname: 'video.mp4',
        buffer: Buffer.from('file-content'),
        mimetype: 'video/mp4',
      };

      const video = new Video();
      video.file = fileMock;

      storageMock.uploadFile.mockRejectedValue(new Error('Upload failed'));

      await expect(useCase.save(video)).rejects.toThrow(
        new BusinessRuleException('Erro ao tentar salvar o vídeo'),
      );

      expect(storageMock.deleteFile).toHaveBeenCalledWith(
        expect.stringMatching(/video\.mp4_/),
      );
      expect(persistMock.deleteVideo).toHaveBeenCalledWith(
        expect.stringMatching(/video\.mp4_/),
      );
    });
  });

  describe('getVideosByUser', () => {
    it('should fetch videos for a user', async () => {
      const videos = [new Video()];
      persistMock.getVideosByUser.mockResolvedValue(videos);

      const result = await useCase.getVideosByUser('user123');

      expect(persistMock.getVideosByUser).toHaveBeenCalledWith('user123');
      expect(result).toEqual(videos);
    });
  });

  describe('downloadFile', () => {
    it('should download file from storage', async () => {
      const stream = new Readable();
      storageMock.downloadFile.mockResolvedValue(stream);

      const result = await useCase.downloadFile('video.mp4');

      expect(storageMock.downloadFile).toHaveBeenCalledWith('video.mp4');
      expect(result).toBe(stream);
    });
  });

  describe('updateStatusVideoProcessed', () => {
    it('should update video status and send error message if status is "erro"', async () => {
      const videoProcessed = new VideoProcessed();
      videoProcessed.id = 'video.mp4';
      videoProcessed.status = 'erro';

      const video = new Video();
      video.userEmail = 'user@email.com';

      persistMock.getVideoEntityById.mockResolvedValue(video);

      await useCase.updateStatusVideoProcessed(videoProcessed);

      expect(persistMock.updateStatusVideoProcessed).toHaveBeenCalledWith(
        videoProcessed,
      );
      expect(messageMock.sendMessageErrorVideoProcessed).toHaveBeenCalledWith(
        ['user@email.com'],
        'Fiap: Erro ao processar vídeo',
        expect.stringContaining('video.mp4'),
      );
    });

    it('should not send error message if status is not "erro"', async () => {
      const videoProcessed = new VideoProcessed();
      videoProcessed.id = 'video.mp4';
      videoProcessed.status = 'processado';

      await useCase.updateStatusVideoProcessed(videoProcessed);

      expect(persistMock.updateStatusVideoProcessed).toHaveBeenCalledWith(
        videoProcessed,
      );
      expect(messageMock.sendMessageErrorVideoProcessed).not.toHaveBeenCalled();
    });
  });
});
