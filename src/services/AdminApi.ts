import { makeCrud } from "./BaseApi";
import type { Admin, CreateAdminRequest, UpdateAdminRequest } from "@/interfaces/AdminInterface";

export const AdminsApi = makeCrud<Admin, CreateAdminRequest, UpdateAdminRequest>("admins");
