import { forwardRef, Module, Provider } from '@nestjs/common';
import { HashBuilder } from '@utils/hash-builder';
import { NodeMailer } from '@infrastructure/servises/nodemailer/nodemailer.service';
import { BasicStrategy } from '@infrastructure/strategies/basic.strategy';
import { JwtStrategy } from '@infrastructure/strategies/jwt.strategy';
import { UsersModule } from '@features/users/users.module';
import { IsLoginExistConstrain } from '@infrastructure/decorators/validate/is-login-exist.decorator';
import { IsEmailExistConstrain } from '@infrastructure/decorators/validate/is-email-exist.decorator';
import { CookieService } from '@infrastructure/servises/cookie/cookie.service';
import { BearerTokenInterceptorGuard } from '@infrastructure/guards/bearer-token-interceptor-guard.service';
import { SharedService } from '@infrastructure/servises/shared/shared.service';

const basesProviders: Provider[] = [
  SharedService,
  HashBuilder,
  NodeMailer,
  BasicStrategy,
  JwtStrategy,
  BearerTokenInterceptorGuard,
  CookieService,
  IsLoginExistConstrain,
  IsEmailExistConstrain,
];
@Module({
  imports: [forwardRef(() => UsersModule)],
  providers: [...basesProviders],
  exports: [...basesProviders],
})
export class SharedModule {}
