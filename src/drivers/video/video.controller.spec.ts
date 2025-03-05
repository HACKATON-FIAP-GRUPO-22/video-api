import { Test, TestingModule } from '@nestjs/testing';
import { VideoController } from './video.controller';
import { VideoAdapterController } from '../../adapters/video/controller/video.adapter.controller';
import { VideoDto } from '../../adapters/video/dto/video.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { Readable } from 'stream';

describe('VideoController', () => {
  let controller: VideoController;
  let adapterMock: jest.Mocked<VideoAdapterController>;

  beforeEach(async () => {
    adapterMock = {
      save: jest.fn(),
      getVideos: jest.fn(),
      downloadFile: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [VideoController],
      providers: [
        {
          provide: VideoAdapterController,
          useValue: adapterMock,
        },
      ],
    }).compile();

    controller = module.get<VideoController>(VideoController);
  });

  describe('uploadFile', () => {
    it('should upload file successfully', async () => {
      const file = {
        buffer: Buffer.from('file-content'),
        mimetype: 'video/mp4',
      } as Express.Multer.File;
      const req = { user: { id: 'user123', email: 'user@example.com' } };

      const videoDto = new VideoDto();
      videoDto.idVideo = 'video123';

      adapterMock.save.mockResolvedValue(videoDto);

      const result = await controller.uploadFile(file, req);

      expect(adapterMock.save).toHaveBeenCalledWith(
        file,
        'user123',
        'user@example.com',
      );
      expect(result).toEqual(videoDto);
    });

    it('should throw HttpException if upload fails', async () => {
      const file = {
        buffer: Buffer.from('file-content'),
        mimetype: 'video/mp4',
      } as Express.Multer.File;
      const req = { user: { id: 'user123', email: 'user@example.com' } };

      adapterMock.save.mockRejectedValue(new Error('Upload error'));

      await expect(controller.uploadFile(file, req)).rejects.toThrow(
        new HttpException('Upload error', HttpStatus.BAD_REQUEST),
      );
    });
  });

  describe('status', () => {
    it('should return videos for user', async () => {
      const req = { user: { id: 'user123' } };
      const videos: VideoDto[] = [
        {
          idVideo: 'video1',
          idVideoProcessed: '',
          user: '',
          status: '',
        },
        {
          idVideo: 'video2',
          idVideoProcessed: '',
          user: '',
          status: '',
        },
      ];

      adapterMock.getVideos.mockResolvedValue(videos);

      const result = await controller.status(req);

      expect(adapterMock.getVideos).toHaveBeenCalledWith('user123');
      expect(result).toEqual(videos);
    });

    it('should throw HttpException if getVideos fails', async () => {
      const req = { user: { id: 'user123' } };
      adapterMock.getVideos.mockRejectedValue(new Error('Status error'));

      await expect(controller.status(req)).rejects.toThrow(
        new HttpException('Status error', HttpStatus.BAD_REQUEST),
      );
    });
  });

  describe('downloadFile', () => {
    it('should download file', async () => {
      const id = 'video123';
      const res = {
        setHeader: jest.fn(),
        status: jest.fn(),
      } as unknown as Response;
      const req = { user: { id: 'user123', email: 'user@example.com' } };

      const fileStream = new Readable();
      fileStream.push('file content');
      fileStream.push(null);

      adapterMock.downloadFile.mockResolvedValue(fileStream);

      // Mock `pipe` diretamente, pois `fileStream.pipe(res)` é o fluxo esperado
      const pipeMock = jest.spyOn(fileStream, 'pipe').mockImplementation();

      await controller.downloadFile(id, res, req);

      // expect(adapterMock.downloadFile).toHaveBeenCalledWith(id);
      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        `attachment; filename="${id}"`,
      );
      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'application/octet-stream',
      );
      expect(pipeMock).toHaveBeenCalledWith(res);
    });
  });
});
