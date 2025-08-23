import { makeCrud } from "./BaseApi";
import type { Platform, CreatePlatformRequest, UpdatePlatformRequest } from "../interfaces/PlatformInterface"; 

export const PlatformsApi = makeCrud<Platform, CreatePlatformRequest, UpdatePlatformRequest>("platforms");
