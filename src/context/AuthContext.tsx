import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import type { User } from "../interfaces/UserInterface";
import type { Admin } from "../interfaces/AdminInterface";

import {
    meUser,
    logout as apiLogout,
    refresh as apiRefresh,
} from "../services/AuthApi";

import { clearAccess } from "../services/BaseApi";
import { deleteCurrentUserProfile } from "../services/UserApi";
import { deleteCurrentAdminProfile } from "../services/AdminApi";

// ===== Types =====
export type Principal = User | Admin;

interface AuthContextType {
    user: Principal | null;
    setUser: (user: Principal | null) => void;
    logout: () => Promise<void>;
    deleteCurrentProfile: () => Promise<void>;
}

// ===== Context =====
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ===== Provider =====
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<Principal | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadMe = async () => {
            try {
        // /auth/me – מחזיר user או admin
                const me = await meUser();
                setUser(me as Principal);
            } catch {
        // ננסה refresh פעם אחת
                try {
                    await apiRefresh();
                    const me = await meUser();
                    setUser(me as Principal);
                } catch {
                setUser(null);
                }
            } finally {
            setLoading(false);
            }
        };
        loadMe();
    }, []);

    const logout = async () => {
        try {
            await apiLogout();
        } finally {
            setUser(null);
        }
    };

    const deleteCurrentProfile = async () => {
        try{
            if (user && String(user.type).toLowerCase() === "admin") {
                await deleteCurrentAdminProfile();
            } else {
                await deleteCurrentUserProfile();
            }
        } finally {
            clearAccess();
            setUser(null);
        }
    }

    if (loading) {
        return null; // או spinner אם בא לך
    }

    return (
        <AuthContext.Provider value={{ user, setUser, logout, deleteCurrentProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

// ===== Hook =====
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
