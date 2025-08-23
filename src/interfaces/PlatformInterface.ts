import type { UserType } from "./UserInterface";

export interface CreatePlatformRequest{
    name: string;
    frequency_mhz: Number;
    bw_khz: Number;
    tx_power_dbm: Number;
    antenna_height_m: Number;
}
export interface UpdatePlatformRequest extends CreatePlatformRequest {}

export interface Platform {
    id: string;
    readonly type: UserType;
    name: string;
    frequency_mhz: number;
    bw_khz: number;
    tx_power_dbm: number;
    antenna_height_m: number;
}
