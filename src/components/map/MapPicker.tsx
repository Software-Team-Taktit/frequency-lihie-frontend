import { Marker, Popup } from "react-leaflet";
import { Button } from "../ui/button";
import {
    resolveEnviromentByCoords,
    type ResolveEnvPoint
} from "../../lib/resolveEnviromentByCoords";
import BaseMap from "./BaseMap";
import type { Mission } from "../../interfaces/MissionInterface";

export type EnvPicker = ResolveEnvPoint;

type MapPickerProps = {
    onPick: (picked: EnvPicker) => void;
    onClose: () => void;
    missions?: Mission[];
};

function MapPicker({ onPick, onClose, missions = [] }: MapPickerProps) {
    const handleClick = (lat: number, lon: number) => {
        const result = resolveEnviromentByCoords(lat, lon);

        if (!result.ok) {
            alert(result.error);
            return;
        }

        onPick(result.picked);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40">
            <div className="bg-white w-[1000px] h-[640px] rounded-2xl shadow-2xl border border-gray-200 flex flex-col">
                <div className="px-4 py-3 flex items-center justify-between border-b">
                    <h3 className="text-lg font-semibold">בחר/י נקודה על המפה</h3>
                    <Button type="button" onClick={onClose}>
                        סגירה
                    </Button>
                </div>
                <div className="flex-1">
                    <BaseMap onMapClick={handleClick}>
                        {missions.map((mission) => (
                            <Marker
                                key={mission.id}
                                position={[
                                    mission.coordinate.latitude,
                                    mission.coordinate.longitude,
                                ]}
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
            </div>
        </div>
    )
}
export default MapPicker;