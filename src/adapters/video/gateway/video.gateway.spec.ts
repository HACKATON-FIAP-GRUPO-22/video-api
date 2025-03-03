import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { VideoGateway } from './video.gateway'; // ajuste o caminho conforme necessário
import { VideoEntity } from './video.entity';
import { Video } from '../../../application/video/entites/video';
import { VideoProcessed } from '../../../application/video/entites/video.processed';
import { BusinessRuleException } from '../../..//system/filtros/business-rule-exception';
import { getEnumFromString } from '../../../application/video/entites/video.status';

describe('VideoGateway', () => {
  let gateway: VideoGateway;
  let repositoryMock: Partial<Repository<VideoEntity>>;

  beforeEach(async () => {
    repositoryMock = {
      save: jest.fn(),
      find: jest.fn(),
      findOneBy: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VideoGateway,
        {
          provide: 'VideoEntityRepository', // ou getRepositoryToken(VideoEntity) se estiver usando TypeOrmModule
          useValue: repositoryMock,
        },
      ],
    }).compile();

    gateway = module.get<VideoGateway>(VideoGateway);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('save', () => {
    it('should save and return a video', async () => {
      const video = new Video();
      video.idVideo = '123';

      const videoEntity = new VideoEntity();
      videoEntity.idVideo = '123';

      (repositoryMock.save as jest.Mock).mockResolvedValue(videoEntity);

      const result = await gateway.save(video);

      expect(repositoryMock.save).toHaveBeenCalledWith(expect.any(VideoEntity));
      expect(result.idVideo).toEqual('123');
    });
  });

  describe('getVideosByUser', () => {
    it('should return videos for a user', async () => {
      const videoEntity = new VideoEntity();
      videoEntity.idVideo = '123';
      videoEntity.user = 'user1';

      (repositoryMock.find as jest.Mock).mockResolvedValue([videoEntity]);

      const result = await gateway.getVideosByUser('user1');

      expect(repositoryMock.find).toHaveBeenCalledWith({
        where: { user: 'user1' },
      });
      expect(result).toHaveLength(1);
      expect(result[0].idVideo).toEqual('123');
    });
  });

  describe('getVideoById', () => {
    it('should return video entity by id', async () => {
      const videoEntity = new VideoEntity();
      videoEntity.idVideo = '123';

      (repositoryMock.findOneBy as jest.Mock).mockResolvedValue(videoEntity);

      const result = await gateway.getVideoById('123');

      expect(repositoryMock.findOneBy).toHaveBeenCalledWith({ idVideo: '123' });
      expect(result).toBe(videoEntity);
    });

    it('should throw BusinessRuleException if video not found', async () => {
      (repositoryMock.findOneBy as jest.Mock).mockResolvedValue(null);

      await expect(gateway.getVideoById('123')).rejects.toThrow(
        new BusinessRuleException('Vídeo não localizado'),
      );
    });
  });

  describe('getVideoEntityById', () => {
    it('should return video domain object by id', async () => {
      const videoEntity = new VideoEntity();
      videoEntity.idVideo = '123';
      videoEntity.status = 'pendente';

      (repositoryMock.findOneBy as jest.Mock).mockResolvedValue(videoEntity);

      const result = await gateway.getVideoEntityById('123');

      expect(result.idVideo).toBe('123');
      expect(result.status).toBe(getEnumFromString('pendente'));
    });
  });

  describe('updateStatusVideoProcessed', () => {
    it('should update video status', async () => {
      const videoProcessed = new VideoProcessed();
      videoProcessed.id = '123';
      videoProcessed.status = 'pronto';
      videoProcessed.idVideoProcessed = 'VID_PROCESSED_123';

      const videoEntity = new VideoEntity();
      videoEntity.idVideo = '123';

      (repositoryMock.findOneBy as jest.Mock).mockResolvedValue(videoEntity);

      await gateway.updateStatusVideoProcessed(videoProcessed);

      expect(repositoryMock.findOneBy).toHaveBeenCalledWith({ idVideo: '123' });
      expect(repositoryMock.save).toHaveBeenCalledWith(
        expect.objectContaining({
          idVideoProcessed: 'VID_PROCESSED_123',
          status: 'pronto',
        }),
      );
    });

    it('should throw BusinessRuleException if video not found', async () => {
      (repositoryMock.findOneBy as jest.Mock).mockResolvedValue(null);

      const videoProcessed = new VideoProcessed();
      videoProcessed.id = '123';

      await expect(
        gateway.updateStatusVideoProcessed(videoProcessed),
      ).rejects.toThrow(new BusinessRuleException('Vídeo não localizado'));
    });
  });

  describe('convertCreateEntity', () => {
    it('should convert file and user data to video entity', () => {
      const file = {
        originalname: 'video.mp4',
        buffer: Buffer.from('filedata'),
      };
      const userName = 'John Doe';
      const userEmail = 'john@example.com';

      const result = gateway.convertCreateEntity(file, userName, userEmail);

      expect(result.file).toBe(file);
      expect(result.user).toBe(userName);
      expect(result.userEmail).toBe(userEmail);
    });
  });
});
