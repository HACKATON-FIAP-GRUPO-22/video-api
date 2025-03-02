import { VideoStatus } from './video.status';

export class Video {
  idVideo: string;
  idVideoProcessed: string;
  user: string;
  userEmail: string;
  createdAt: string;
  updateAt: string;
  status: VideoStatus;
  file: any;
}
