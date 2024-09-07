import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { BasicStrategy as Strategy } from 'passport-http';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from '@settings/configuration';

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService<ConfigurationType, true>,
  ) {
    super();
  }

  public validate = async (
    username: string,
    password: string,
  ): Promise<boolean> => {
    const apiSettings = this.configService.get('apiSettings', { infer: true });

    if (
      apiSettings.ADMIN_AUTH_USERNAME === username &&
      apiSettings.ADMIN_AUTH_PASSWORD === password
    ) {
      return true;
    }
    throw new UnauthorizedException();
  };
}
