import { Injectable } from '@nestjs/common';
import { Service } from '../../service/service';
import { Video } from '../entites/video';
import { IVideoData } from '../interfaces/video.interface';
import { IVideoUseCase } from '../interfaces/video.usecase.interface';
import { Readable } from 'stream';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class VideoUseCase extends Service implements IVideoUseCase {
  constructor(private persist: IVideoData) {
    super();
  }

  save(video: Video): Promise<Video> {
    video.path = 'teste';
    video.user = 'user';
    video.userEmail = 'user';
    return this.persist.save(video);
  }

  async getVideosByUser(user: string): Promise<Video[]> {
    return this.persist.getVideosByUser(user);
  }

  async downloadFile(id: string): Promise<Readable> {
    const bucketName = process.env.AWS_S3_BUCKET_NAME;

    const params = {
      Bucket: bucketName,
      Key: id,
    };

    const command = new GetObjectCommand(params);
    const response = await this.getClientS3().send(command);

    return response.Body as Readable;
  }

  private getClientS3() {
    return new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }
}
