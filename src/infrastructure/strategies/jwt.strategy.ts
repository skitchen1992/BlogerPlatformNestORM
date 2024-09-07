import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersQueryRepository } from '@features/users/infrastructure/users.query-repository';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from '@settings/configuration';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    protected readonly usersQueryRepository: UsersQueryRepository,
    private readonly configService: ConfigService<ConfigurationType, true>,
  ) {
    const apiSettings = configService.get('apiSettings', { infer: true });

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: apiSettings.JWT_SECRET_KEY,
      passReqToCallback: true, // Позволяет передать объект request в метод validate
    });
  }

  async validate(request: Request, payload: any) {
    return (request.currentUser = await this.usersQueryRepository.getById(
      payload.userId,
    ));
  }
}
