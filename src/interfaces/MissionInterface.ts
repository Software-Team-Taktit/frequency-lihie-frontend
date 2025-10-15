import type { UserType } from "./UserInterface";

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