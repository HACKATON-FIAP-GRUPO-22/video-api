import { Injectable } from '@nestjs/common';
import { Video } from 'src/application/video/entites/video';
import { VideoDto } from '../dto/video.dto';

@Injectable()
export class VideoPresenter {
  convertEntityToResponseDto(entity: Video): VideoDto {
    const response = new VideoDto();
    response.id = entity.id;
    response.path = entity.path;
    response.user = entity.user;
    return response;
  }

  convertArrayEntityToArrayResponseDto(videos: Video[]): VideoDto[] {
    const newArray = [];
    if (videos) {
      videos.forEach((order) => {
        newArray.push(this.convertEntityToResponseDto(order));
      });
    }

    return newArray;
  }
}
