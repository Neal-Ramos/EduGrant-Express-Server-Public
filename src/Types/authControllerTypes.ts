import { JwtPayload } from "jsonwebtoken";

export interface TokenPayload extends JwtPayload {
  userID: number;
  role: string;
}