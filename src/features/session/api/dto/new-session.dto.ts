export class NewSessionDto {
  userId: string;
  ip: string;
  title: string;
  lastActiveDate: Date;
  tokenIssueDate: Date;
  tokenExpirationDate: Date;
  deviceId: string;
}
