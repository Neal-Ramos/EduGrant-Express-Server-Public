import { JwtPayload } from 'jsonwebtoken';

export interface TokenPayload extends JwtPayload {
  accountId: number;
  role: string;
}
