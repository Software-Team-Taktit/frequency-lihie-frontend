import { get, makeCrud, post } from "./BaseApi";
import type {
    User,
    CreateUserRequest,
    UpdateUserRequest,
    UserLogInRequest,
} from "../interfaces/UserInterface";

export const UserApi = makeCrud<User, CreateUserRequest, UpdateUserRequest>("users");

export async function loginByPersonalId(dto: UserLogInRequest) {
    const res = await post<{user: User}>("/users/login", dto);
    return res.user;
}

export function logout(){
    return post<void>("/users/logout", {});
}

export function me() {
    return get<User>("/users/me");
}
