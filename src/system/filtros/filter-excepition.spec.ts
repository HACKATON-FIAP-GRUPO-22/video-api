import { FilterExceptionGlobal } from './filter-exception-global';
import { BusinessRuleException } from './business-rule-exception';
import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

describe('FilterExceptionGlobal', () => {
  let filter: FilterExceptionGlobal;
  let httpAdapterHostMock: Partial<HttpAdapterHost>;

  beforeEach(() => {
    httpAdapterHostMock = {
      httpAdapter: {
        getRequestUrl: jest.fn().mockReturnValue('/test-path'),
        reply: jest
          .fn()
          .mockImplementation(
            (response: any, body: any, statusCode: number) => {
              response.status(statusCode).json(body);
            },
          ),
      } as any,
    };

    filter = new FilterExceptionGlobal(httpAdapterHostMock as HttpAdapterHost);
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  describe('catch', () => {
    const mockArgumentsHost = (
      responseMock: any,
      requestMock: any,
    ): ArgumentsHost =>
      ({
        switchToHttp: () => ({
          getResponse: () => responseMock,
          getRequest: () => requestMock,
        }),
      }) as ArgumentsHost;

    it('should handle BusinessRuleException and return correct response', () => {
      const exception = new BusinessRuleException(
        'Business error',
        HttpStatus.BAD_REQUEST,
      );

      const responseMock = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const requestMock = {};
      const context = mockArgumentsHost(responseMock, requestMock);

      filter.catch(exception, context);

      expect(
        httpAdapterHostMock.httpAdapter.getRequestUrl,
      ).toHaveBeenCalledWith(requestMock);
      expect(httpAdapterHostMock.httpAdapter.reply).toHaveBeenCalledWith(
        responseMock,
        {
          message: 'Business error',
          timestamp: expect.any(String),
          path: '/test-path',
        },
        HttpStatus.BAD_REQUEST,
      );
    });

    it('should handle HttpException and return correct response', () => {
      const exception = new HttpException('Http error', HttpStatus.FORBIDDEN);

      const responseMock = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const requestMock = {};
      const context = mockArgumentsHost(responseMock, requestMock);

      filter.catch(exception, context);

      expect(
        httpAdapterHostMock.httpAdapter.getRequestUrl,
      ).toHaveBeenCalledWith(requestMock);
      expect(httpAdapterHostMock.httpAdapter.reply).toHaveBeenCalledWith(
        responseMock,
        {
          message: 'Http error',
        },
        HttpStatus.FORBIDDEN,
      );
    });

    it('should handle generic exceptions and return internal server error', () => {
      const exception = new Error('Unexpected error');

      const responseMock = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const requestMock = {};
      const context = mockArgumentsHost(responseMock, requestMock);

      filter.catch(exception, context);

      expect(
        httpAdapterHostMock.httpAdapter.getRequestUrl,
      ).toHaveBeenCalledWith(requestMock);
      expect(httpAdapterHostMock.httpAdapter.reply).toHaveBeenCalledWith(
        responseMock,
        {
          timestamp: expect.any(String),
          path: '/test-path',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    });
  });
});
