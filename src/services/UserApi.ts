import { makeCrud, del } from "./BaseApi";
import type {
    User,
    CreateUserRequest,
    UpdateUserRequest,
} from "../interfaces/UserInterface";

export const UserApi = makeCrud<User, CreateUserRequest, UpdateUserRequest>("users");

export function deleteCurrentUserProfile(): Promise<void> {
    return del("/users/profile/me");
}