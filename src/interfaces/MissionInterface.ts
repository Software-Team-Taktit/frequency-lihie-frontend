import type { UserType } from "./UserInterface";

export interface CreateMissionRequest {
    coordinate: Coordinate;
    enviroment_type: string;  
    platform_id: string;
}

export interface UpdateMissionRequest extends CreateMissionRequest {}

export interface Mission {
    id: string;
    readonly type: UserType;
    coordinate: Coordinate;
    enviroment_type: string;
    platform_id: string;
}

export interface Coordinate {
    lat: number;
    lon: number;
}