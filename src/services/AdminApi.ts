import { makeCrud, del } from "./BaseApi";
import type {
    Admin,
    CreateAdminRequest,
    UpdateAdminRequest,
} from "@/interfaces/AdminInterface";

export const AdminsApi = makeCrud<Admin, CreateAdminRequest, UpdateAdminRequest>("admins");

export function deleteCurrentAdminProfile(): Promise<void> {
    return del("/admins/profile/me");
}