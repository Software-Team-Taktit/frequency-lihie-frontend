import { useEffect, useState } from "react";
import { Marker, Popup } from "react-leaflet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

import BaseMap from "../map/BaseMap";
import MissionCard from "./MissionCard";
import MissionForm from "./MissionForm";

import { MissionsApi } from "../../services/MissionApi";
import type { Mission } from "../../interfaces/MissionInterface";

function MissionMapPage() {
    const [missions, setMissions] = useState<Mission[]>([]);
    const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
    const [editing, setEditing] = useState<Mission | null>(null);
    const [loading, setLoading] = useState(true);

    async function load() {
        try {
            setLoading(true);
            const list = await MissionsApi.list();
            setMissions(Array.isArray(list) ? list : []);
        } catch (error) {
            console.error("Error Loading Missions: ", error);
            setMissions([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    async function handleDelete(mission: Mission) {
        await MissionsApi.remove(mission.id);

        if (selectedMission?.id === mission.id) {
            setSelectedMission(null);
        }

        await load();
    }

    return (
        <div
            className="bg-blue-100 rounded-xl p-8 md:p-10 w-[1800px] h-[750px] mx-auto shadow-md flex flex-col gap-6"
            dir="rtl"
        >
            <div className="flex items-center justify-between">
                <div className="w-32 huninn-regular text-blue-700">
                    {loading ? "טוען..." : `${missions.length} משימות`}
                </div>

                <h1 className="suez-one-regular text-6xl text-center text-blue-700">מפת משימות</h1>
                <div className="w-32"/>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6 flex-1 min-h-0">
                <div className="rounded-2xl overflow-hidden border border-black bg-white shadow-md min-h-0">
                    <BaseMap>
                        {missions.map((mission) => (
                            <Marker
                                key={mission.id}
                                position={[
                                    mission.coordinate.latitude,
                                    mission.coordinate.longitude,
                                ]}
                                eventHandlers={{
                                    click: () => setSelectedMission(mission),
                                }}
                            >
                                <Popup>
                                    <div dir="rtl" className="text-right">
                                        <strong>{mission.name}</strong>
                                        <br />
                                        {mission.is_active ? "פעיל" : "לא פעיל"}
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </BaseMap>
                </div>
                <div className="rounded-2xl border border-black bg-blue-200 shadow-md p-4 overflow-y-auto">
                    {selectedMission ? (
                        <MissionCard
                            m={selectedMission}
                            onEdit={setEditing}
                            onDelete={handleDelete}
                        />
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center text-blue-700 huninn-regular">
                            <p className="text-2xl">בחרי משימה מהמפה</p>
                            <p className="text-sm mt-2">
                                בלחיצה על נקודת ציון יוצג כאן כרטיס המשימה
                            </p>
                        </div>
                    )}
                </div>
            </div>
            <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
                <DialogContent className="sm:max-w-[600px] rounded-2xl bg-blue-100 border border-black">
                    <DialogHeader>
                        <DialogTitle className="text-right font-bold text-2xl huninn-regular">
                            עריכת משימה
                        </DialogTitle>
                    </DialogHeader>

                    {editing && (
                        <MissionForm 
                            mode="edit"
                            initial={editing}
                            onCancel={() => setEditing(null)}
                            onSaved={async (updateMission) => {
                                setEditing(null);
                                setSelectedMission(updateMission);
                                await load();
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
};

export default MissionMapPage;