import { Injectable } from '@nestjs/common';
import { IVideoData } from '../../../application/video/interfaces/video.interface';
import { IVideoUseCase } from '../../../application/video/interfaces/video.usecase.interface';
import { VideoPresenter } from '../presenter/video.presenter';
import { VideoDto } from '../dto/video.dto';
import { Readable } from 'stream';

@Injectable()
export class VideoAdapterController {
  constructor(
    private readonly useCase: IVideoUseCase,
    private gateway: IVideoData,
    private presenter: VideoPresenter,
  ) {}

  async save(file, userName, userEmail): Promise<VideoDto> {
    const video = this.gateway.convertCreateEntity(file, userName, userEmail);
    const entity = await this.useCase.save(video);
    return this.presenter.convertEntityToResponseDto(entity);
  }

  async getVideos(user: string): Promise<VideoDto[]> {
    const videos = await this.useCase.getVideosByUser(user);
    return this.presenter.convertArrayEntityToArrayResponseDto(videos);
  }

  async downloadFile(id: string): Promise<Readable> {
    const file = this.useCase.downloadFile(id);
    return file;
  }
}
