import { makeCrud } from "./BaseApi";
import type { Mission, CreateMissionRequest, UpdateMissionRequest } from "@/interfaces/MissionInterface";

export const MissionsApi = makeCrud<Mission, CreateMissionRequest, UpdateMissionRequest>("missions");
