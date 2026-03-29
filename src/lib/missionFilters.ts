import type { Mission } from "../interfaces/MissionInterface";
export type MissionActivityFilter = "all" | "active" | "inactive";

export const missionActivityFilterOptions: {
    value: MissionActivityFilter;
    label: string;
}[] = [
    { value: "all", label: "כל המשימות" },
    { value: "active", label: "פעילות" },
    { value: "inactive", label: "לא פעילות" }
];

export function filterMissionByActivity(
    missions: Mission[],
    filter: MissionActivityFilter
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