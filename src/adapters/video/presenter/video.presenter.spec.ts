import { VideoPresenter } from './video.presenter';
import { Video } from '../../../application/video/entites/video';
import { VideoDto } from '../dto/video.dto';

describe('VideoPresenter', () => {
  let presenter: VideoPresenter;

  beforeEach(() => {
    presenter = new VideoPresenter();
  });

  describe('convertEntityToResponseDto', () => {
    it('should convert Video entity to VideoDto', () => {
      const entity = new Video();
      entity.idVideo = 'video123';
      entity.idVideoProcessed = 'processed123';
      entity.user = 'user123';

      const result = presenter.convertEntityToResponseDto(entity);

      expect(result).toBeInstanceOf(VideoDto);
      expect(result.idVideo).toBe('video123');
      expect(result.idVideoProcessed).toBe('processed123');
      expect(result.user).toBe('user123');
    });
  });

  describe('convertArrayEntityToArrayResponseDto', () => {
    it('should convert array of Video entities to array of VideoDto', () => {
      const entities: Video[] = [
        {
          idVideo: 'video1',
          idVideoProcessed: 'processed1',
          user: 'user1',
        } as Video,
        {
          idVideo: 'video2',
          idVideoProcessed: 'processed2',
          user: 'user2',
        } as Video,
      ];

      const result = presenter.convertArrayEntityToArrayResponseDto(entities);

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(VideoDto);
      expect(result[0].idVideo).toBe('video1');
      expect(result[1].idVideo).toBe('video2');
    });

    it('should return empty array if input is undefined', () => {
      const result = presenter.convertArrayEntityToArrayResponseDto(undefined);

      expect(result).toEqual([]);
    });

    it('should return empty array if input is empty', () => {
      const result = presenter.convertArrayEntityToArrayResponseDto([]);

      expect(result).toEqual([]);
    });
  });
});
