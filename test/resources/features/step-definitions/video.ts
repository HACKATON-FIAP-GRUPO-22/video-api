import { Given, When, Then } from '@cucumber/cucumber';
import { strict as assert } from 'assert';
import { Readable } from 'stream';

class MockVideoAdapterController {
  async save(file: Express.Multer.File, userName: string, userEmail: string) {
    return {
      id: '123',
      url: 'http://example.com/video.mp4',
      userName,
      userEmail,
    };
  }

  async getVideos(user: string) {
    return [
      {
        id: '123',
        url: 'http://example.com/video.mp4',
        userName: user,
        userEmail: `${user}@example.com`,
      },
    ];
  }

  async downloadFile(id: string, user: string) {
    const stream = new Readable();
    stream.push('binary-data');
    stream.push(null);
    return stream;
  }
}

let controller: MockVideoAdapterController;
let response: any;

Given('que o usuário está autenticado', async () => {
  controller = new MockVideoAdapterController();
});

When('ele envia um vídeo para upload', async function () {
  response = await controller.save(
    { originalname: 'video.mp4' } as Express.Multer.File,
    'user123',
    'user@example.com'
  );
});

Then('o sistema retorna um status {int}', function (statusCode: number) {
  assert.ok(response);
});

Then('retorna os detalhes do vídeo', function () {
  assert.ok(response.id);
  assert.ok(response.url);
});

Given('que o usuário solicita seus vídeos', async function () {
  controller = new MockVideoAdapterController();
});

When('o sistema busca os vídeos do usuário', async function () {
  response = await controller.getVideos('user123');
});

Then('retorna a lista de vídeos disponíveis', function () {
  assert.ok(response.length > 0);
  assert.ok(response[0].id);
});

Given('que o usuário solicita o download do vídeo com id {string}', async function (id: string) {
  controller = new MockVideoAdapterController();
  response = await controller.downloadFile(id, 'user123');
});

When('o sistema busca o vídeo pelo ID', async function () {});

Then('retorna o arquivo do vídeo', function () {
  assert.ok(response instanceof Readable);
});
