import {
  CognitoIdentityProviderClient,
  GetUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();

      const token = this.extractToken(request);
      if (!token) {
        throw new UnauthorizedException('Token não encontrado');
      }

      // try {
      const attributes = await this.getUserAttributes(token);

      if (attributes['custom:lgpd'] !== 'true') {
        throw new UnauthorizedException(
          'Usuário não aceitou os termos da LGPD',
        );
      }

      request.user = {
        id: attributes.username,
        email: attributes.email,
      };

      return true;
      // } catch (error) {
      //   console.log(error);
      //   throw new UnauthorizedException('Token inválido ou expirado');
      // }
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException(error.message);
    }
  }

  private extractToken(request: any): string | null {
    const authHeader = request.headers.authorization;
    return authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  }

  async getUserAttributes(accessToken: string) {
    try {
      const command = new GetUserCommand({
        AccessToken: accessToken,
      });

      const cognitoClient = new CognitoIdentityProviderClient({
        region: process.env.AWS_REGION,
      });

      const response = await cognitoClient.send(command);

      const attributes = response.UserAttributes.reduce((acc, attr) => {
        acc[attr.Name] = attr.Value;
        return acc;
      }, {});

      return {
        username: response.Username,
        email: attributes['email'],
        ...attributes,
      };
    } catch (error) {
      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }
}
