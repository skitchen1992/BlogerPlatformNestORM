import { Injectable } from '@nestjs/common';
import { Response, Request, CookieOptions } from 'express';

@Injectable()
export class CookieService {
  // Метод для установки cookie
  setCookie(
    res: Response,
    name: string,
    value: string,
    options: CookieOptions = {},
  ): void {
    res.cookie(name, value, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      ...options,
    });
  }

  // Метод для получения cookie
  getCookie(req: Request, name: string): string | undefined {
    return req.cookies[name];
  }

  // Метод для удаления cookie
  clearCookie(res: Response, name: string, options?: CookieOptions): void {
    res.clearCookie(name, options);
  }
}
