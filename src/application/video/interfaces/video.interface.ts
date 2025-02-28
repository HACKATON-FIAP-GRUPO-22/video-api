import { Video } from '../entites/video';

export abstract class IVideoData {
  abstract save(video: Video): Promise<Video>;
  abstract convertCreateEntity(file, userName, userEmail): Video;
  abstract getVideosByUser(user: string): Promise<Video[]>;
}
