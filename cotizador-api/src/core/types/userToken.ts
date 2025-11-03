import { Role } from "./role";

export type UserToken = {
    id: string;
    role: Role;
} | undefined;