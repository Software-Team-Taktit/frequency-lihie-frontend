import type { CreateUserRequest, UpdateUserRequest, User } from "@/interfaces/UserInterface";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export class HttpError extends Error {
    status: number;
    data?: unknown;
    constructor(status: number, message: string, data?: unknown){
        super(message);
        this.status = status;
        this.data = data;
    }
}