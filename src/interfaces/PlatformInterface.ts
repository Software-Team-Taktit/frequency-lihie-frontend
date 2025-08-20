export interface CreatePlatformRequest{
    name: string;
    frequency_mhz: Number;
    bw_khz: Number;
    tx_power_dbm: Number;
    antenna_height_m: Number;
}
export interface UpdateAdminRequest extends CreatePlatformRequest {}