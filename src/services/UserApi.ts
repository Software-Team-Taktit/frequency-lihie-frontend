import { get, makeCrud, post, setAccess, clearAccess } from "./BaseApi";
import type {
    User,
    CreateUserRequest,
    UpdateUserRequest,
    UserLogInRequest,
} from "../interfaces/UserInterface";

type LoginResponse = {
  access_token: string;
  token_type: "bearer";
  user: unknown;
};

type RefreshResponse = {
  access_token: string;
  token_type: "bearer";
};

export const UserApi = makeCrud<User, CreateUserRequest, UpdateUserRequest>("users");

export async function loginByPersonalId(dto: UserLogInRequest): Promise<User> {
    const data = await post<LoginResponse>("/users/login", dto);
    setAccess(data.access_token);
    const me = await get<User>("/users/me");
    return me;
}

export async function refresh(): Promise<string> {
    const data = await post<RefreshResponse>("/users/refresh", {}); 
    setAccess(data.access_token);
    return data.access_token;
}

export function logout(): Promise<void>{
    return post<void>("/users/logout", {});
    clearAccess();
}

export function me(): Promise<User> {
    return get<User>("/users/me");
}
