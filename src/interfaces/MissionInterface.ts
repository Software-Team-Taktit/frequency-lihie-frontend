export type EnvType = "mount" | "urban" | "open_space";

export const MAP_CODES = [
    "very_dense_urban",
    "dense_urban",
    "urban",
    "suburban",
    "rural_village",
    "open_space",
    "mount"
] as const;

export type MapCodetype = (typeof MAP_CODES)[number];

export interface FrequencyRequest {
    name: string;
    coordinate: Coordinate;
    enviroment_type: EnvType;
    platform_id: string;
}

export interface FrequencyResponse {
    freq_mhz: number;
    tx_power_dbm: number;
}

export interface CreateMissionRequest {
    name: string;
    coordinate: Coordinate;
    freq_mhz: number;
    tx_power_dbm: number;
    platform_id: string;
}

export interface UpdateMissionRequest {
    name?: string;
    coordinate?: Coordinate;
    freq_mhz?: number;
    tx_power_dbm?: number;
    platform_id?: string;
}

export interface Mission {
    id: string;
    name: string;
    readonly type: "mission";
    coordinate: Coordinate;
    freq_mhz: number;
    tx_power_dbm: number;
    platform_id: string;
}

export interface Coordinate {
    latitude: number;
    longitude: number;
}