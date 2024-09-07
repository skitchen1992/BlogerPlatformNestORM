export class UserJoined {
  id: string;
  login: string;
  password: string;
  email: string;
  created_at: Date;
  recovery_is_confirmed: boolean;
  recovery_confirmation_code: string;
  email_is_confirmed: boolean;
  email_confirmation_code: string;
  email_expiration_date: Date;
}
