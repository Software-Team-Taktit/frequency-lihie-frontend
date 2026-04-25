import { Button } from "../ui/button";
import {
    resolveEnviromentByCoords,
    type ResolveEnvPoint
} from "../../lib/resolveEnviromentByCoords";
import BaseMap from "./BaseMap";

export type EnvPicker = ResolveEnvPoint;

function MapPicker({
  onPick,
  onClose,
}: {
  onPick: (picked: EnvPicker) => void;
  onClose: () => void;
}) {
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
                    <BaseMap onMapClick={handleClick}/>
                </div>
            </div>
        </div>
    )
}
export default MapPicker;