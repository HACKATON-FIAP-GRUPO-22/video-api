import { Readable } from 'stream';
import { Video } from '../entites/video';

export abstract class IVideoUseCase {
  abstract save(video: Video): Promise<Video>;
  abstract getVideosByUser(user: string): Promise<Video[]>;
  abstract downloadFile(id: string): Promise<Readable>;
}
