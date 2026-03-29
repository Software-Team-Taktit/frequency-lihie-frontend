import type { Mission } from "../interfaces/MissionInterface";
export type MissionActivityFilterValue = "all" | "active" | "inactive";

export const missionActivityFilterOptions: {
    value: MissionActivityFilterValue;
    label: string;
}[] = [
    { value: "all", label: "כל המשימות" },
    { value: "active", label: "פעילות" },
    { value: "inactive", label: "לא פעילות" }
];

export function filterMissionByActivity(
    missions: Mission[],
    filter: MissionActivityFilterValue
) : Mission[] {
    switch(filter) {
        case "active":
            return missions.filter((mission) => mission.is_active);
        
        case "inactive":
            return missions.filter((mission) => !mission.is_active);

        case "all":
        default:
            return missions;
    }
}