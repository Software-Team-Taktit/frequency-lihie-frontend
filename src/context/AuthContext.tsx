import React, {createContext, useContext, useEffect, useState} from "react";
import type {User} from "../interfaces/UserInterface";
import {me as getMe, logout as apiLogout, refresh as apiRefresh} from "../services/UserApi";

type AuthState = {
    user: User | null;
    setUser: (u: User | null) => void;
    logout: () => void;
};

const AuthCtx = createContext<AuthState | undefined>(undefined);

export function AuthProvider({children}: {children: React.ReactNode}) {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        (async () => {
            try { await apiRefresh(); } catch { }
            try { setUser(await getMe()); } catch { setUser(null); }
        })();
    }, []);

    const logout = () => {
        void apiLogout().finally(()=> setUser(null));
    };

    return (
        <AuthCtx.Provider value={{user, setUser, logout}}>
            {children}
        </AuthCtx.Provider>
    );
}

export function useAuth(){
    const ctx = useContext(AuthCtx);
    if(!ctx) throw new Error("useAuth must be used within <AuthProvider>");
    return ctx;
}