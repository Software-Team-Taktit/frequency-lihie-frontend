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
        },
        credentials: "include"
    });

    if (res.status === 204) {
        return undefined as T;
    }

    const ct = res.headers.get("content-type") || "";
    const isJson = ct.includes("application/json");
    const data = isJson ? await res.json().catch(()=> null) : null;

    if(!res.ok){
        const msg = (data?.detail && String((data as any).detail)) || res.statusText || "Request failed";
        throw new HttpError(res.status, msg, data);
    }
    return data as T;
}

export const post = <T>(p: string, b: unknown) => request<T>(p, {method: "POST", body: JSON.stringify(b)});
export const put = <T>(p: string, b: unknown) => request<T>(p, {method: "PUT", body: JSON.stringify(b)});
export const get = <T>(p: string) => request<T>(p, {method: "GET"});
export const del = (p: string) => request<void>(p, {method: "DELETE"});

export function makeCrud<T, CreateDto, UpdateDto>(resource : string) {
    return {
        list:   (): Promise<T[]> => get<T[]>(`/${resource}`),
        get:    (id: string): Promise<T> => get<T>(`/${resource}/${id}`),
        create: (dto: CreateDto): Promise<T> => post<T>(`/${resource}`, dto),
        update: (id: string, dto: UpdateDto): Promise<T> => put<T>(`/${resource}/${id}`, dto),
        remove: (id: string): Promise<void> => del(`/${resource}/${id}`),
    };
}