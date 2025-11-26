export interface CreatePlatformRequest{
    name: string;
    tx_gain: number;
    rx_gain: number;

    //optional
    bw_khz? : number;
    tx_height_m? : number;
    rx_height_m? : number;
    min_sinr_required_db? : number;
    noise_figure_db? : number;
}
export interface UpdatePlatformRequest {
    // all optional because its update
    name?: string;
    bw_khz?: number;
    tx_gain?: number;
    tx_height_m?: number;
    rx_gain?: number;
    rx_height_m?: number;
    min_sinr_required_db?: number;
    noise_figure_db?: number;
}

export interface Platform {
    // an object we get from the backend
    id: string;
    readonly type: "platform";
    name: string;
    bw_khz: number;
    tx_gain: number;
    tx_height_m: number;
    rx_gain: number;
    rx_height_m: number;
    min_sinr_required_db: number;
    noise_figure_db: number;
}
