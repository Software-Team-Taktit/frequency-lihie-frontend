export interface CreateUserRequest {
    personal_id: string;
    first_name: string;
    last_name: string;
    unit: string;
}
export interface UpdateUserRequest extends CreateUserRequest {}

export interface User {
    id: string;
    readonly type: "user";
    personal_id: string;
    first_name: string;
    last_name: string;
    unit: string;
}

export interface UserLogInRequest {
    personal_id: string;
}