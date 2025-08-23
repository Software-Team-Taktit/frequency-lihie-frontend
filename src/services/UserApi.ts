import { makeCrud, post } from "./BaseApi";
import type {
    User,
    CreateUserRequest,
    UpdateUserRequest,
    UserLogInRequest,
} from "../interfaces/UserInterface";

export const UserApi = makeCrud<User, CreateUserRequest, UpdateUserRequest>("users");

export function loginByPersonalId(dto: UserLogInRequest) {
    return post<User>("/users/login", dto);
}

