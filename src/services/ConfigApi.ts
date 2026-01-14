import {get, put} from "./BaseApi"

export type FrequencyRangeConfig = {
    min_mhz: number;
    max_mhz: number;
}

export function getFrequencyRange(): Promise<FrequencyRangeConfig> {
    return get<FrequencyRangeConfig>("/config/frequency-range")
}

export function updateFrequencyRange(cfg: FrequencyRangeConfig): Promise<FrequencyRangeConfig> {
  return put<FrequencyRangeConfig>("/config/frequency-range", cfg);
}