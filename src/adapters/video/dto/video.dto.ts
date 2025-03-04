import { ApiProperty } from '@nestjs/swagger';

export class VideoDto {
  @ApiProperty()
  idVideo: string;

  @ApiProperty({
    description: 'Path do caminho do arquivo',
    examples: {
      exemplo: {
        summary: 'Path',
        description: 'Exemplo path de arquivo',
        value: '/etc/teste',
      },
    },
  })
  idVideoProcessed: string;

  @ApiProperty({
    description: 'Usuário que fez o upload do vídeo',
    examples: {
      exemplo: {
        summary: 'Exemplo de usuário do vídeo',
        description: 'Usuário que fez o upload do vídeo',
        value: 'Edson',
      },
    },
  })
  user: string;

  @ApiProperty({
    description: 'Status atual do vídeo, sendo: pendente, pronto ou erro',
    examples: {
      exemplo: {
        summary: 'Exemplo de status',
        description: 'Status do vídeo',
        value: 'pronto',
      },
    },
  })
  status: string;
}
