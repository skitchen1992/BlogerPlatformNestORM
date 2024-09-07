import { UserOutputDto } from '@features/users/api/dto/output/user.output.dto';

declare global {
  namespace Express {
    interface Request {
      currentUser?: UserOutputDto | null;
    }
  }
}
