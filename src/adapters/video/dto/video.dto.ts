import { ApiProperty } from '@nestjs/swagger';

export class VideoDto {
  @ApiProperty()
  id: number;

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
  path: string;

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
}
