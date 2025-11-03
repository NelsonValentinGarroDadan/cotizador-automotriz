import { Role } from "@prisma/client";
import { UserToken } from "./userToken";

declare global {
  namespace Express {
    interface Request {
      user?: UserToken;
    }
  }
}
