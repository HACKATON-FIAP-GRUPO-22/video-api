/* eslint-disable @typescript-eslint/no-unused-vars */
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { PostgresConfigService } from './postgres.config.service';

describe('PostgresConfigService', () => {
  let postgresConfigService: PostgresConfigService;
  let configServiceMock: Partial<ConfigService>;

  beforeEach(() => {
    configServiceMock = {
      get: jest.fn((key: string) => {
        const config = {
          DB_HOST: 'localhost',
          DB_PORT: 5432,
          DB_USERNAME: 'test_user',
          DB_PASSWORD: 'test_password',
          DB_NAME: 'test_db',
        };
        return config[key];
      }),
    };

    postgresConfigService = new PostgresConfigService(
      configServiceMock as ConfigService,
    );
  });

  it('should be defined', () => {
    expect(postgresConfigService).toBeDefined();
  });

  describe('createTypeOrmOptions', () => {
    it('should return TypeOrmModuleOptions with the correct values', () => {
      const options: TypeOrmModuleOptions =
        postgresConfigService.createTypeOrmOptions();

      expect(configServiceMock.get).toHaveBeenCalledWith('DB_HOST');
      expect(configServiceMock.get).toHaveBeenCalledWith('DB_PORT');
      expect(configServiceMock.get).toHaveBeenCalledWith('DB_USERNAME');
      expect(configServiceMock.get).toHaveBeenCalledWith('DB_PASSWORD');
      expect(configServiceMock.get).toHaveBeenCalledWith('DB_NAME');
    });
  });
});
