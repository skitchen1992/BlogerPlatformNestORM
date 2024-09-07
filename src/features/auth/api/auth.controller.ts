import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { RegistrationUserDto } from './dto/input/registration-user.input.dto';
import { LoginDto } from '@features/auth/api/dto/input/login.input.dto';
import { PasswordRecoveryDto } from '@features/auth/api/dto/input/password-recovery.input.dto';
import { NewPasswordDto } from '@features/auth/api/dto/input/new-password.input.dto';
import { RegistrationConfirmationDto } from '@features/auth/api/dto/input/registration-confirmation.input.dto';
import { RegistrationEmailResendingDto } from '@features/auth/api/dto/input/registration-email-resending.input.dto';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '@infrastructure/guards/bearer-auth-guard.service';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { LoginCommand } from '@features/auth/application/handlers/login.handler';
import { LoginOutputDto } from '@features/auth/api/dto/output/login.output.dto';
import { PasswordRecoveryCommand } from '@features/auth/application/handlers/passport-recovery.handler';
import { NewPassportCommand } from '@features/auth/application/handlers/new-passport.handler';
import { RegistrationConfirmationCommand } from '@features/auth/application/handlers/registration-confirmation.handler';
import { RegistrationCommand } from '@features/auth/application/handlers/registration.handler';
import { RegistrationEmailResendingCommand } from '@features/auth/application/handlers/registration-email-resending.handler';
import { GetMeQuery } from '@features/auth/application/handlers/get-me.handler';
import { MeOutputDto } from '@features/auth/api/dto/output/me.output.dto';
import { RefreshTokenOutputDto } from '@features/auth/api/dto/output/refresh-token.output.dto';
import { RefreshTokenCommand } from '@features/auth/application/handlers/refresh-token.handler';
import { LogoutCommand } from '@features/auth/application/handlers/logout.handler';
import { SkipThrottle, ThrottlerGuard } from '@nestjs/throttler';

// Tag для swagger
@ApiTags('Auth')
@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() input: LoginDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    const { loginOrEmail, password } = input;

    return await this.commandBus.execute<LoginCommand, LoginOutputDto>(
      new LoginCommand(loginOrEmail, password, res, req),
    );
  }

  @SkipThrottle()
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    return await this.commandBus.execute<
      RefreshTokenCommand,
      RefreshTokenOutputDto
    >(new RefreshTokenCommand(res, req));
  }

  @Post('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  async passwordRecovery(@Body() input: PasswordRecoveryDto) {
    const { email } = input;

    await this.commandBus.execute<PasswordRecoveryCommand, void>(
      new PasswordRecoveryCommand(email),
    );
  }

  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async newPassword(@Body() input: NewPasswordDto) {
    const { newPassword, recoveryCode } = input;

    await this.commandBus.execute<NewPassportCommand, void>(
      new NewPassportCommand(newPassword, recoveryCode),
    );
  }

  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationConfirmation(@Body() input: RegistrationConfirmationDto) {
    const { code } = input;

    await this.commandBus.execute<RegistrationConfirmationCommand, void>(
      new RegistrationConfirmationCommand(code),
    );
  }

  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(@Body() input: RegistrationUserDto) {
    const { login, password, email } = input;

    await this.commandBus.execute<RegistrationCommand, void>(
      new RegistrationCommand(login, password, email),
    );
  }

  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationEmailResending(
    @Body() input: RegistrationEmailResendingDto,
  ) {
    const { email } = input;

    await this.commandBus.execute<RegistrationEmailResendingCommand, void>(
      new RegistrationEmailResendingCommand(email),
    );
  }

  @ApiSecurity('bearer')
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() request: Request) {
    const user = request.currentUser;

    return await this.queryBus.execute<GetMeQuery, MeOutputDto>(
      new GetMeQuery(user!),
    );
  }
  @SkipThrottle()
  @ApiSecurity('refreshToken')
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() request: Request) {
    await this.commandBus.execute<LogoutCommand, void>(
      new LogoutCommand(request),
    );
  }
}
