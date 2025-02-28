import { ApiProperty } from '@nestjs/swagger';

export class CreateVideoDto {
  @ApiProperty({
    description: 'Arquivo do vídeo a ser processado',
    examples: {
      exemplo: {
        summary: 'Arquivo',
        description: 'Arquivo de vídeo',
        value: 'video.mp4',
      },
    },
  })
  file: string;
}
