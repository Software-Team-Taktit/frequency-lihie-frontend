export const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export class HttpError extends Error {
    status: number;
    data?: unknown;

    constructor(status: number, message: string, data?: unknown) {
        super(message);
        this.name = "HttpError";
        this.status = status;
        this.data = data;
    }
}

let accessToken: string | null = localStorage.getItem("access_token");

export const setAccess = (t: string | null) => {
    accessToken = t;

    if (t) {
        localStorage.setItem("access_token", t);
    } else {
        localStorage.removeItem("access_token");
    }
};

export const getAccess = () => accessToken;

export const clearAccess = () => {
    accessToken = null;
    localStorage.removeItem("access_token");
};

function buildErrorMessage(data: unknown, fallback: string): string {
    if (data && typeof data === "object") {
        const detail = (data as any).detail;
        const message = (data as any).message;

        if (typeof detail === "string") return detail;
        if (typeof message === "string") return message;

        if (detail) return JSON.stringify(detail);
        if (message) return JSON.stringify(message);
    }

    if (typeof data === "string" && data) {
        return data;
    }

    return fallback;
}

async function parseResponseData(res: Response): Promise<unknown> {
    const contentType = res.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
        return await res.json().catch(() => null);
    }

    return await res.text().catch(() => null);
}

async function refreshAccess(): Promise<string> {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
    });

    const data = await parseResponseData(res);

    if (!res.ok) {
        const message = buildErrorMessage(data, "refresh failed");
        throw new HttpError(res.status, message, data);
    }

    const newAccess = (data as any)?.access_token as string | undefined;

    if (!newAccess) {
        throw new HttpError(401, "no access token in refresh response", data);
    }

    setAccess(newAccess);
    return newAccess;
}

interface RequestInitWithRetry extends RequestInit {
    __retriedOnce?: boolean;
}

async function request<T>(
    path: string,
    init: RequestInitWithRetry = {}
): Promise<T> {
    const headers: Record<string, string> = {
        Accept: "application/json",
        ...(init.body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(init.headers as Record<string, string> | undefined),
    };

    if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
    }

    const res = await fetch(`${BASE_URL}${path}`, {
        ...init,
        headers,
        credentials: "include",
    });

    if (res.status === 204) {
        return undefined as T;
    }

    if (res.status === 401 && !init.__retriedOnce) {
        try {
            const newAccess = await refreshAccess();

            return await request<T>(path, {
                ...init,
                headers: {
                    ...(init.headers as Record<string, string> | undefined),
                    Authorization: `Bearer ${newAccess}`,
                },
                __retriedOnce: true,
            });
        } catch (error) {
            clearAccess();
            throw error;
        }
    }

    const data = await parseResponseData(res);

    if (!res.ok) {
        const message = buildErrorMessage(
            data,
            res.statusText || `Request failed with status ${res.status}`
        );

        throw new HttpError(res.status, message, data);
    }

    return data as T;
}

export const post = <T>(p: string, b: unknown) =>
    request<T>(p, {
        method: "POST",
        body: JSON.stringify(b),
    });

export const put = <T>(p: string, b: unknown) =>
    request<T>(p, {
        method: "PUT",
        body: JSON.stringify(b),
    });

export const patch = <T>(p: string, b?: unknown) =>
    request<T>(p, {
        method: "PATCH",
        ...(b !== undefined ? { body: JSON.stringify(b) } : {}),
    });

export const get = <T>(p: string) =>
    request<T>(p, {
        method: "GET",
    });

export const del = (p: string) =>
    request<void>(p, {
        method: "DELETE",
    });

export function makeCrud<T, CreateDto, UpdateDto>(resource: string) {
    return {
        list: (): Promise<T[]> => get<T[]>(`/${resource}`),

        get: (id: string): Promise<T> =>
            get<T>(`/${resource}/${id}`),

        create: (dto: CreateDto): Promise<T> =>
            post<T>(`/${resource}`, dto),

        update: (id: string, dto: UpdateDto): Promise<T> =>
            put<T>(`/${resource}/${id}`, dto),

        remove: (id: string): Promise<void> =>
            del(`/${resource}/${id}`),
    };
}