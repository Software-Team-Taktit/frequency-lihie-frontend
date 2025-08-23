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

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
        ...init,
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...(init.headers || {})
        }
    });
    const ct = res.headers.get("content-type") || "";
    const isJson = ct.includes("application/json");
    const data = isJson ? await res.json().catch(()=> null) : null;

    if(!res.ok){
        const msg = (data?.detail && String((data as any).detail)) || res.statusText || "Request failed";
        throw new HttpError(res.status, msg, data);
    }
    return data as T;
}