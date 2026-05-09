export const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export class HttpError extends Error {
    status: number;
    data?: unknown;
    constructor(status: number, message: string, data?: unknown){
        super(message);
        this.status = status;
        this.data = data;
    }
}

let accessToken: string | null = null;
export const setAccess = (t: string | null) => { accessToken = t; };
export const getAccess = () => accessToken;
export const clearAccess = () => { accessToken = null; };

async function refreshAccess(): Promise<string> {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",         
    });
    if (!res.ok) {
        throw new HttpError(res.status, "refresh failed");
    }
    const data = await res.json();
    const newAccess = (data as any)?.access_token as string | undefined;
    if (!newAccess) throw new Error("no access token in refresh response");
    setAccess(newAccess);
    return newAccess;
}

interface RequestInitWithRetry extends RequestInit {
    __retriedOnce?: boolean;
}

async function request<T>(path: string, init: RequestInitWithRetry = {}): Promise<T> {
    const baseHeaders: Record<string, string> = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        ...(init.headers as Record<string, string> | undefined),
    };

    if (accessToken) baseHeaders["Authorization"] = `Bearer ${accessToken}`;

    const res = await fetch(`${BASE_URL}${path}`, {
        ...init,
        headers: baseHeaders,
        credentials: "include",   
    });
    if (res.status === 204) {
        return undefined as T;
    }

    if (res.status === 401 && !init.__retriedOnce) {
        try{
            const newAccess = await refreshAccess();
            const retriedHeaders: Record<string, string> = {
                ...baseHeaders,
                Authorization: `Bearer ${newAccess}`,
            };
            const retriedInit: RequestInitWithRetry = {
                ...init,
                headers: retriedHeaders,
                credentials: "include",
                __retriedOnce: true,
            };
            const retried = await fetch(`${BASE_URL}${path}`, retriedInit);
            if (retried.status === 204) return undefined as T;
            const ct2 = retried.headers.get("content-type") || "";
            const isJson2 = ct2.includes("application/json");
            const data2 = isJson2 ? await retried.json().catch(() => null) : null;
            if (!retried.ok)
            {
                const message2 =
                    (data2 && typeof data2 === "object" && (data2 as any).detail)
                        ? JSON.stringify((data2 as any).detail)
                        : (typeof data2 === "string" && data2) || retried.statusText || "Request failed";
                throw Object.assign(new Error(message2), { status: retried.status, data: data2 }) as HttpError;
            }
            return data2 as T;
        } catch (e) {
            clearAccess();
        }
    }
    const ct = res.headers.get("content-type") || "";
    const isJson = ct.includes("application/json");
    const data = isJson ? await res.json().catch(() => null) : null;

    if (!res.ok) {
        const message =
            (data && typeof data === "object" && (data as any).detail)
                ? JSON.stringify((data as any).detail)
                : (typeof data === "string" && data) || res.statusText || "Request failed";
        const err: HttpError = Object.assign(new Error(message), { status: res.status, data });
        throw err;
    }
    return data as T;
}


export const post = <T>(p: string, b: unknown) => request<T>(p, {method: "POST", body: JSON.stringify(b)});
export const put = <T>(p: string, b: unknown) => request<T>(p, {method: "PUT", body: JSON.stringify(b)});
export const patch = <T>(p: string, b?: unknown) => request<T>(p, {method: "PATCH",...(b !== undefined ? { body: JSON.stringify(b) } : {}),});
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