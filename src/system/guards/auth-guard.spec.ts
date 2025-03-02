import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import { AuthGuard } from './authGuard';

jest.mock('@aws-sdk/client-cognito-identity-provider');

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let reflector: Reflector;

  const mockRequest = (headers = {}) => ({
    headers,
    user: null,
  });

  const mockExecutionContext = (request: any): Partial<ExecutionContext> => ({
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => ({}) as any,
      getNext: () => ({}) as any,
    }),
  });

  beforeEach(() => {
    reflector = new Reflector();
    guard = new AuthGuard(reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('should throw UnauthorizedException if no token is provided', async () => {
      const request = mockRequest({});
      const context = mockExecutionContext(request);

      await expect(
        guard.canActivate(context as ExecutionContext),
      ).rejects.toThrow(new UnauthorizedException('Token não encontrado'));
    });

    it('should throw UnauthorizedException if token is invalid', async () => {
      const request = mockRequest({ authorization: 'Bearer invalid-token' });
      const context = mockExecutionContext(request);

      (
        CognitoIdentityProviderClient.prototype.send as jest.Mock
      ).mockRejectedValue(new Error('Invalid token'));

      await expect(
        guard.canActivate(context as ExecutionContext),
      ).rejects.toThrow(
        new UnauthorizedException('Token inválido ou expirado'),
      );
    });

    it('should throw UnauthorizedException if user did not accept LGPD', async () => {
      const request = mockRequest({ authorization: 'Bearer valid-token' });
      const context = mockExecutionContext(request);

      (
        CognitoIdentityProviderClient.prototype.send as jest.Mock
      ).mockResolvedValue({
        Username: 'user123',
        UserAttributes: [
          { Name: 'email', Value: 'user@example.com' },
          { Name: 'custom:lgpd', Value: 'false' },
        ],
      });

      await expect(
        guard.canActivate(context as ExecutionContext),
      ).rejects.toThrow(
        new UnauthorizedException('Usuário não aceitou os termos da LGPD'),
      );
    });

    it('should allow access if token is valid and user accepted LGPD', async () => {
      const request = mockRequest({ authorization: 'Bearer valid-token' });
      const context = mockExecutionContext(request);

      (
        CognitoIdentityProviderClient.prototype.send as jest.Mock
      ).mockResolvedValue({
        Username: 'user123',
        UserAttributes: [
          { Name: 'email', Value: 'user@example.com' },
          { Name: 'custom:lgpd', Value: 'true' },
        ],
      });

      const result = await guard.canActivate(context as ExecutionContext);

      expect(result).toBe(true);
      expect(request.user).toEqual({
        id: 'user123',
        email: 'user@example.com',
      });
    });
  });

  describe('extractToken', () => {
    it('should extract token correctly from header', () => {
      const request = mockRequest({ authorization: 'Bearer my-token' });

      const token = (guard as any).extractToken(request);

      expect(token).toBe('my-token');
    });

    it('should return null if token format is invalid', () => {
      const request = mockRequest({ authorization: 'InvalidHeader' });

      const token = (guard as any).extractToken(request);

      expect(token).toBeNull();
    });
  });

  describe('getUserAttributes', () => {
    it('should return formatted attributes', async () => {
      (
        CognitoIdentityProviderClient.prototype.send as jest.Mock
      ).mockResolvedValue({
        Username: 'user123',
        UserAttributes: [
          { Name: 'email', Value: 'user@example.com' },
          { Name: 'custom:lgpd', Value: 'true' },
        ],
      });

      const result = await (guard as any).getUserAttributes('valid-token');

      expect(result).toEqual({
        username: 'user123',
        email: 'user@example.com',
        'custom:lgpd': 'true',
      });
    });
  });
});
