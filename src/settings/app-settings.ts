// import { config } from 'dotenv';
//
// config();
//
// type EnvironmentVariable = { [key: string]: string | undefined };
//
// type EnvironmentsTypes = 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION' | 'TESTING';
// export const Environments = ['DEVELOPMENT', 'STAGING', 'PRODUCTION', 'TESTING'];
//
// export class EnvironmentSettings {
//   constructor(private env: EnvironmentsTypes) {}
//
//   getEnv() {
//     return this.env;
//   }
//
//   isProduction() {
//     return this.env === 'PRODUCTION';
//   }
//
//   isStaging() {
//     return this.env === 'STAGING';
//   }
//
//   isDevelopment() {
//     return this.env === 'DEVELOPMENT';
//   }
//
//   isTesting() {
//     return this.env === 'TESTING';
//   }
// }
//
// class AppSettings {
//   constructor(
//     public env: EnvironmentSettings,
//     public api: APISettings,
//   ) {}
// }
//
// class APISettings {
//   // Application
//   public readonly PORT: number;
//
//   // Database
//   public readonly MONGO_CONNECTION_URI: string;
//
//   //Admin login and pass
//   public readonly ADMIN_AUTH_USERNAME: string;
//   public readonly ADMIN_AUTH_PASSWORD: string;
//
//   //JWT
//   public readonly JWT_SECRET_KEY: string;
//   public readonly ACCESS_TOKEN_EXPIRED_IN: string;
//
//   //EMAIL
//   public readonly EMAIL_USER: string;
//   public readonly EMAIL_PASS: string;
//
//   //ENV
//   public readonly ENV: string;
//
//   constructor(private readonly envVariables: EnvironmentVariable) {
//     // Application
//     this.PORT = this.getNumberOrDefault(envVariables.PORT, 3004);
//
//     // Database
//     if (!envVariables.MONGO_CONNECTION_URI) {
//       throw new Error('MONGO_CONNECTION_URI is not defined');
//     }
//     this.MONGO_CONNECTION_URI = envVariables.MONGO_CONNECTION_URI;
//
//     //Auth
//     if (
//       !envVariables.ADMIN_AUTH_USERNAME ||
//       !envVariables.ADMIN_AUTH_PASSWORD
//     ) {
//       throw new Error(
//         'ADMIN_AUTH_USERNAME or ADMIN_AUTH_PASSWORD is not defined',
//       );
//     }
//     this.ADMIN_AUTH_USERNAME = envVariables.ADMIN_AUTH_USERNAME;
//     this.ADMIN_AUTH_PASSWORD = envVariables.ADMIN_AUTH_PASSWORD;
//
//     //JWT
//     if (!envVariables.JWT_SECRET_KEY || !envVariables.ACCESS_TOKEN_EXPIRED_IN) {
//       throw new Error('JWT_SECRET_KEY is not defined');
//     }
//     this.JWT_SECRET_KEY = envVariables.JWT_SECRET_KEY;
//
//     if (!envVariables.ACCESS_TOKEN_EXPIRED_IN) {
//       throw new Error('ACCESS_TOKEN_EXPIRED_IN is not defined');
//     }
//     this.ACCESS_TOKEN_EXPIRED_IN = envVariables.ACCESS_TOKEN_EXPIRED_IN;
//
//     //EMAIL
//     if (!envVariables.EMAIL_USER || !envVariables.EMAIL_PASS) {
//       throw new Error('EMAIL_USER ar EMAIL_PASS is not defined');
//     }
//     this.EMAIL_USER = envVariables.EMAIL_USER;
//     this.EMAIL_PASS = envVariables.EMAIL_PASS;
//
//     //ENV
//     if (!envVariables.ENV) {
//       throw new Error('ENV is not defined');
//     }
//     this.ENV = envVariables.ENV;
//   }
//
//   private getNumberOrDefault(
//     value: string | undefined,
//     defaultValue: number,
//   ): number {
//     const parsedValue = Number(value);
//
//     if (isNaN(parsedValue)) {
//       return defaultValue;
//     }
//
//     return parsedValue;
//   }
// }
//
// const env = new EnvironmentSettings(
//   (process.env.ENV && Environments.includes(process.env.ENV?.trim())
//     ? process.env.ENV.trim()
//     : 'DEVELOPMENT') as EnvironmentsTypes,
// );
//
// const api = new APISettings(process.env);
// const appSettings = new AppSettings(env, api);
