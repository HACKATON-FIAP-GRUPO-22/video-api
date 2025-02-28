import dataSource from './data-source-cli';

describe('DataSource Configuration', () => {
  const mockEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...mockEnv,
      DB_HOST: 'localhost',
      DB_PORT: '5432',
      DB_USERNAME: 'test_user',
      DB_PASSWORD: 'test_password',
      DB_NAME: 'test_db',
    };
  });

  afterAll(() => {
    process.env = mockEnv;
  });

  it('should create a valid DataSource instance', () => {
    expect(dataSource).toBeDefined();
    expect(dataSource.options).toBeDefined();
  });
});
