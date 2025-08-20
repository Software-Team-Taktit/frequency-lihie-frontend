export interface CreateUserRequest {
    personal_id: string;
    first_name: string;
    last_name: string;
    unit: string;
}
export interface UpdateUserRequest extends CreateUserRequest {}