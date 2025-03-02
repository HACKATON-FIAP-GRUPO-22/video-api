import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from '../../../application/video/entites/video';
import { VideoEntity } from './video.entity';
import { getEnumFromString } from '../../../application/video/entites/video.status';
import { IVideoData } from '../../../application/video/interfaces/video.interface';
import { VideoProcessed } from 'src/application/video/entites/video.processed';
import { BusinessRuleException } from 'src/system/filtros/business-rule-exception';

export class VideoGateway implements IVideoData {
  constructor(
    @InjectRepository(VideoEntity)
    private readonly repository: Repository<VideoEntity>,
  ) {}

  async save(video: Video): Promise<Video> {
    let entity = this.convertEntityTodata(video);
    entity = await this.repository.save(entity);
    return this.convertDataToEntity(entity);
  }

  async getVideosByUser(user: string): Promise<Video[]> {
    const list = await this.repository.find({
      where: {
        user,
      },
    });

    const videos: Video[] = [];
    for (const item of list) {
      videos.push(this.convertDataToEntity(item));
    }
    return videos;
  }

  async getVideoById(idVideo: string): Promise<VideoEntity> {
    const entity = await this.repository.findOneBy({ idVideo });
    if (!entity) {
      throw new BusinessRuleException('Categoria não localizada');
    }

    return entity;
  }

  async getVideoEntityById(idVideo: string): Promise<Video> {
    const entity = await this.getVideoById(idVideo);
    return this.convertDataToEntity(entity);
  }

  async updateStatusVideoProcessed(videoProcessed: VideoProcessed) {
    const entity = await this.getVideoById(videoProcessed.id);
    if (!entity) {
      throw new BusinessRuleException('Categoria não localizada');
    }

    entity.status = videoProcessed.status;
    entity.idVideoProcessed = videoProcessed.idVideoProcessed;
    await this.repository.save(entity);
  }

  private convertEntityTodata(video: Video) {
    const entity = new VideoEntity();
    entity.idVideo = video.idVideo;
    entity.idVideoProcessed = video.idVideoProcessed;
    entity.user = video.user;
    entity.userEmail = video.userEmail;
    entity.status = video.status;
    return entity;
  }

  private convertDataToEntity(videoEntity: VideoEntity): Video {
    if (!videoEntity) {
      return null;
    }
    const video = new Video();
    video.idVideo = videoEntity.idVideo;
    video.idVideoProcessed = videoEntity.idVideoProcessed;
    video.user = videoEntity.user;
    video.status = getEnumFromString(videoEntity.status);
    return video;
  }

  convertCreateEntity(file: any, userName: any, userEmail: any): Video {
    const video = new Video();
    video.file = file;
    video.user = userName;
    video.userEmail = userEmail;
    return video;
  }
}
