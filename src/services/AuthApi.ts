import { get, post, setAccess, clearAccess } from "./BaseApi";

import type { User, UserLogInRequest } from "../interfaces/UserInterface";
import type { Admin, AdminLogInRequest } from "../interfaces/AdminInterface"

type LoginResponse = {
    access_token: string;
    token_type: "bearer";
    role: "user" | "admin";
    user: unknown;
};

type RefreshResponse = {
    access_token: string;
    token_type: "bearer";
    role?: "user" | "admin";
};

export async function loginUserByPersonalId(dto: UserLogInRequest): Promise<User> {
    const data = await post<LoginResponse>("/auth/login", dto);
    setAccess(data.access_token);
    const me = await get<User>("/auth/me");
    return me;
}

export async function loginAdminByPersonalId(dto: AdminLogInRequest): Promise<Admin> {
    const data = await post<LoginResponse>("/auth/login", dto);
    setAccess(data.access_token);
    const me = await get<Admin>("/auth/me");
    return me;
}

export async function refresh(): Promise<string> {
    const data = await post<RefreshResponse>("/auth/refresh", {});
    setAccess(data.access_token);
    return data.access_token;
}

export async function logout(): Promise<void> {
    await post<void>("/auth/logout", {});
    clearAccess();
}

export function meUser(): Promise<User> {
    return get<User>("/auth/me");
}

export function meAdmin(): Promise<Admin> {
    return get<Admin>("/auth/me");
}