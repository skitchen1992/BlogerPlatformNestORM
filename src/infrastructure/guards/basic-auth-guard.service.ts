import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Custom guard
// https://docs.nestjs.com/guards
//@Injectable()
// export class BasicAuthGuard implements CanActivate {
//   canActivate(
//     context: ExecutionContext,
//   ): boolean | Promise<boolean> | Observable<boolean> {
//     const request = context.switchToHttp().getRequest();
//
//     const authHeader = request.headers.authorization;
//
//     if (!authHeader || authHeader.indexOf('Basic ') === -1) {
//       throw new UnauthorizedException();
//     }
//
//     const buff = Buffer.from(authHeader.slice(6), 'base64');
//     const decodedAuth = buff.toString('utf8');
//
//     const [username, password] = decodedAuth.split(':');
//
//     if (
//       username !== appSettings.api.ADMIN_AUTH_USERNAME ||
//       password !== appSettings.api.ADMIN_AUTH_PASSWORD
//     ) {
//       throw new UnauthorizedException();
//     }
//
//     return true;
//   }
// }

//passport
@Injectable()
export class BasicAuthGuard extends AuthGuard('basic') {}
