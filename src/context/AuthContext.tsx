import React, {createContext, useContext, useState} from "react";
import type {User} from "../interfaces/UserInterface";

type AuthState = {
    user: User | null;
    setUser: (u: User | null) => void;
    logout: () => void;
};

const AuthCtx = createContext<AuthState | undefined>(undefined);

export function AuthProvider({children}: {children: React.ReactNode}) {
    const [user, setUser] = useState<User | null>(null);

    const logout = () => {
        setUser(null);
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