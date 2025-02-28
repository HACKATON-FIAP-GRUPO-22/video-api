import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import axios from 'axios';
import { JwtPayload, decode, verify } from 'jsonwebtoken';
import jwkToPem from 'jwk-to-pem';

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

      try {
        const decodedToken = decode(token, { complete: true }) as {
          header: { kid: string };
          payload: JwtPayload;
        };

        if (!decodedToken) {
          throw new UnauthorizedException('Token inválido');
        }

        const { kid } = decodedToken.header;

        const publicKey = await this.getPublicKey(kid);
        const payload = verify(token, publicKey, {
          algorithms: ['RS256'],
        }) as JwtPayload;

        this.validateTokenClaims(payload);

        request.user = {
          id: payload.sub,
          email: payload.email,
        };

        // Verificar se o usuário aceitou os termos da LGPD
        if (payload['custom:lgpdConsent'] !== 'true') {
          throw new UnauthorizedException(
            'Usuário não aceitou os termos da LGPD',
          );
        }

        return true;
      } catch (error) {
        console.error('Erro ao validar o token:', error);
        throw new UnauthorizedException('Token inválido ou expirado');
      }
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }

  private extractToken(request: any): string | null {
    const authHeader = request.headers.authorization;
    return authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  }

  private async getPublicKey(kid: string): Promise<string> {
    const jwksUrl = `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.AWS_COGNITO_USER_POOL_ID}/.well-known/jwks.json`;

    try {
      const { data } = await axios.get(jwksUrl);
      const key = data.keys.find((key: any) => key.kid === kid);

      if (!key) {
        throw new Error(`Chave pública não encontrada para kid: ${kid}`);
      }

      return jwkToPem(key);
    } catch (error) {
      throw new Error('Erro ao buscar o JWKS do Cognito');
    }
  }

  private validateTokenClaims(payload: JwtPayload): void {
    const { aud, iss, exp } = payload;

    const expectedIssuer = `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.AWS_COGNITO_USER_POOL_ID}`;

    if (iss !== expectedIssuer) {
      throw new UnauthorizedException('Issuer inválido');
    }

    if (aud !== process.env.AWS_COGNITO_CLIENT_ID) {
      throw new UnauthorizedException('Audience inválido');
    }

    if (exp && Date.now() >= exp * 1000) {
      throw new UnauthorizedException('Token expirado');
    }
  }
}
