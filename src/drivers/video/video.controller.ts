import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiInternalServerErrorResponse,
  ApiTags,
} from '@nestjs/swagger';
import { VideoAdapterController } from '../../adapters/video/controller/video.adapter.controller';
import { VideoDto } from '../../adapters/video/dto/video.dto';
import { ErrorResponseBody } from '../../system/filtros/filter-exception-global';
import { Response } from 'express';
import { AuthGuard } from '../../system/guards/authGuard';

@ApiTags('Vídeo')
@ApiBadRequestResponse({
  description: 'Detalhe do erro',
  type: ErrorResponseBody,
})
@ApiInternalServerErrorResponse({ description: 'Erro do servidor' })
@Controller('video')
// @ApiBearerAuth('access-token')
// @UseGuards(AuthGuard)
export class VideoController {
  constructor(private readonly adapter: VideoAdapterController) {}

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Arquivo para upload',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ): Promise<VideoDto> {
    try {
      return await this.adapter.save(file, req.user?.id, req.user?.email);
    } catch (error) {
      console.log(error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('status')
  async status(@Req() req: any): Promise<VideoDto[]> {
    try {
      return await this.adapter.getVideos(req.user?.id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('dowload/:id')
  async downloadFile(@Param('id') id: string, @Res() res: Response) {
    const fileStream = await this.adapter.downloadFile(id);

    res.setHeader('Content-Disposition', `attachment; filename="${id}"`);
    res.setHeader('Content-Type', 'application/octet-stream');

    fileStream.pipe(res);
  }
}
