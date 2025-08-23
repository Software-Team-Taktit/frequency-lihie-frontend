import type { CreateUserRequest, UserType} from "./UserInterface";

export interface CreateAdminRequest extends CreateUserRequest {}

export interface UpdateAdminRequest extends CreateUserRequest {}

export interface Admin {
    id: string;
    readonly type: UserType;
    personal_id: string;
    first_name: string;
    last_name: string;
    unit: string;
}

export interface AdminLogInRequest {
    personal_id: string;
}