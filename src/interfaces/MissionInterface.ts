import type { UserType } from "./UserInterface";

export type EnvType = "indoor" | "urban" | "open_space";

export const MAP_CODES = [
    "very_dense_urban",
    "dense_urban",
    "urban",
    "suburban",
    "rural_village",
] as const;
export type MapCodetype = typeof MAP_CODES[number];

export interface CreateMissionRequest {
    name: string;
    coordinate: Coordinate;
    enviroment_type: string;  
    platform_id: string;
}

export interface UpdateMissionRequest extends CreateMissionRequest {}

export interface Mission {
    id: string;
    name: string;
    readonly type: UserType;
    coordinate: Coordinate;
    enviroment_type: string;
    platform_id: string;
}

export interface Coordinate {
    latitude: number;
    longitude: number;
}