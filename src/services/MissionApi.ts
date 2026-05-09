import { makeCrud, patch } from "./BaseApi";
import type {
    Mission,
    CreateMissionRequest,
    UpdateMissionRequest,
} from "@/interfaces/MissionInterface";

const missionCrud = makeCrud<Mission, CreateMissionRequest, UpdateMissionRequest>("missions");

export const MissionsApi = {
    ...missionCrud,

    complete: (id: string): Promise<Mission> =>
        patch<Mission>(`/missions/${id}/complete`),
};