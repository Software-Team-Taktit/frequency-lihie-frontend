import { makeCrud } from "./BaseApi";
import type {
    User,
    CreateUserRequest,
    UpdateUserRequest,
} from "../interfaces/UserInterface";

export const UserApi = makeCrud<User, CreateUserRequest, UpdateUserRequest>("users");
