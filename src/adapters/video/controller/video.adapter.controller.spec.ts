import { Test, TestingModule } from '@nestjs/testing';
import { IVideoUseCase } from '../../../application/video/interfaces/video.usecase.interface';
import { IVideoData } from '../../../application/video/interfaces/video.interface';
import { VideoPresenter } from '../presenter/video.presenter';
import { VideoDto } from '../dto/video.dto';
import { Readable } from 'stream';
import { VideoAdapterController } from './video.adapter.controller';

describe('VideoAdapterController', () => {
  let controller: VideoAdapterController;

  // Mocks
  let useCaseMock: Partial<IVideoUseCase>;
  let gatewayMock: Partial<IVideoData>;
  let presenterMock: Partial<VideoPresenter>;

  beforeEach(async () => {
    useCaseMock = {
      save: jest.fn(),
      getVideosByUser: jest.fn(),
      downloadFile: jest.fn(),
    };

    gatewayMock = {
      convertCreateEntity: jest.fn(),
    };

    presenterMock = {
      convertEntityToResponseDto: jest.fn(),
      convertArrayEntityToArrayResponseDto: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VideoAdapterController,
        { provide: IVideoUseCase, useValue: useCaseMock },
        { provide: IVideoData, useValue: gatewayMock },
        { provide: VideoPresenter, useValue: presenterMock },
      ],
    }).compile();

    controller = module.get<VideoAdapterController>(VideoAdapterController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('save', () => {
    it('should save a video and return the DTO', async () => {
      const file = { originalname: 'video.mp4', buffer: Buffer.from('test') };
      const userName = 'John Doe';
      const userEmail = 'john@example.com';

      const videoEntity = { id: '123', name: 'video.mp4', userName, userEmail };
      const videoDto: VideoDto = {
        idVideo: '123',
        user: userName,
        idVideoProcessed: '',
      };

      (gatewayMock.convertCreateEntity as jest.Mock).mockReturnValue(
        videoEntity,
      );
      (useCaseMock.save as jest.Mock).mockResolvedValue(videoEntity);
      (presenterMock.convertEntityToResponseDto as jest.Mock).mockReturnValue(
        videoDto,
      );

      const result = await controller.save(file, userName, userEmail);

      expect(gatewayMock.convertCreateEntity).toHaveBeenCalledWith(
        file,
        userName,
        userEmail,
      );
      expect(useCaseMock.save).toHaveBeenCalledWith(videoEntity);
      expect(presenterMock.convertEntityToResponseDto).toHaveBeenCalledWith(
        videoEntity,
      );
      expect(result).toEqual(videoDto);
    });
  });

  describe('getVideos', () => {
    it('should return a list of videos DTOs', async () => {
      const videos = [
        { id: '1', name: 'video1.mp4' },
        { id: '2', name: 'video2.mp4' },
      ];
      const videoDtos = [
        { id: '1', name: 'video1.mp4' },
        { id: '2', name: 'video2.mp4' },
      ];

      (useCaseMock.getVideosByUser as jest.Mock).mockResolvedValue(videos);
      (
        presenterMock.convertArrayEntityToArrayResponseDto as jest.Mock
      ).mockReturnValue(videoDtos);

      const result = await controller.getVideos('user123');

      expect(useCaseMock.getVideosByUser).toHaveBeenCalledWith('user123');
      expect(
        presenterMock.convertArrayEntityToArrayResponseDto,
      ).toHaveBeenCalledWith(videos);
      expect(result).toEqual(videoDtos);
    });
  });

  describe('downloadFile', () => {
    it('should return a readable stream', async () => {
      const readableStream = new Readable();
      readableStream.push('file-content');
      readableStream.push(null);

      (useCaseMock.downloadFile as jest.Mock).mockReturnValue(readableStream);

      const result = await controller.downloadFile('video123');

      expect(useCaseMock.downloadFile).toHaveBeenCalledWith('video123');
      expect(result).toBe(readableStream);
    });
  });
});
