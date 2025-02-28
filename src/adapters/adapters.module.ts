import { Module } from '@nestjs/common';
import { VideoModule } from '../drivers/video/video.module';

@Module({
  imports: [VideoModule],
})
export class AdaptersModule {}
