import { VideoStatus } from './video.status';

export class Video {
  id: number;
  path: string;
  user: string;
  userEmail: string;
  createdAt: string;
  updateAt: string;
  status: VideoStatus;
  file: any;
}
