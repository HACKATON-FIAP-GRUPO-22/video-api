import { Video } from '../entites/video';
import { VideoProcessed } from '../entites/video.processed';

export abstract class IVideoData {
  abstract save(video: Video): Promise<Video>;
  abstract convertCreateEntity(file, userName, userEmail): Video;
  abstract getVideosByUser(user: string): Promise<Video[]>;
  abstract getVideoEntityById(id: string): Promise<Video>;
  abstract deleteVideo(idVideo: string): Promise<void>;
  abstract updateStatusVideoProcessed(
    videoProcessed: VideoProcessed,
  ): Promise<void>;
}
