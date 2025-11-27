// src/modules/auth/service.ts
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"; 
import { LoginUser } from "./schema";
import { AppError } from "../../core/errors/appError";
import { getUserByEmail } from "../users/repository";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

export const login = async ({ email, password }: LoginUser) => {
  const user = await getUserByEmail(email);
  if (!user) throw new AppError("Email o contraseña incorrecta", 401);

  if (user.active === false) throw new AppError("Usuario inactivo", 401);

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) throw new AppError("Email o contraseña incorrecta", 401);

  const token = jwt.sign(
    { id: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: "24h" }
  );
  const { password: _, ...userWithoutPassword } = user;
  return { token , user:userWithoutPassword};
};
