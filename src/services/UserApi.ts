import type { CreateUserRequest, UpdateUserRequest } from "@/interfaces/UserInterface"

const BASE_URL = "http://localhost:8000";

async function post<T>(path: string, body: any): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(body)
    });
    if (!res.ok) {
        let message = res.statusText || "Request Failed";
        try {
            const data = await res.json();
            if(data?.detail){
                message = typeof data.detail === "string" ? data.detail : message;
            }
        } catch {}
        throw new Error(message);
    }
    try{
        return (await res.json()) as T;
    }catch{
        return null as unknown as T;
    }
}