import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { PlatformsApi } from "../../services/PlatformApi";
import type { Mission } from "../../interfaces/MissionInterface";

function MissionCard({m, onEdit, onDelete} : {
    m: Mission;
    onEdit: (m: Mission) => void;
    onDelete: (m: Mission) => void;
}) {
    const [platformName, setPlatformName] = useState<string>("טוען...");
    useEffect(()=>{
        (async ()=>{
            try{
                const p = await PlatformsApi.get(m.platform_id);
                setPlatformName(p.name);
            } catch (e) {
                console.error(e);
                setPlatformName("לא ידוע.");
            }
        })();
    }, [m.platform_id]);

    const statusText = m.is_active ? "פעיל" : "לא פעיל";
    const statusClass = m.is_active
        ? "bg-green-100 text-green-700 border-green-200"
        : "bg-red-100 text-red-700 border-red-200";
    
    return (
        <Card className="hover:shadow-lg transition-shadow h-full flex flex-col bg-white border-black">
            <CardHeader className="flex flex-row items-start justify-between gap-3">
                <CardTitle className="text-2xl huninn-bold">{m.name || "משימה"}</CardTitle>

                <span
                    className={`huninn-bold text-sm px-2.5 py-1 rounded-full border ${statusClass}`}
                >
                    {statusText}
                </span>
            </CardHeader>
            <CardContent className="text-sm space-y-2 ">
                <div><strong className="huninn-bold">זמן משוערך למשימה:</strong><span className="huninn-regular"> {m.time} דקות</span></div>
                <div><strong className="huninn-bold">תדר המשימה (MHz): </strong><span className="huninn-regular">{m.freq_mhz}</span></div>
                <div><strong className="huninn-bold">עוצמת שידור (dBm): </strong><span className="huninn-regular">{m.tx_power_dbm}</span></div>
                <div><strong className="huninn-bold">נקודת ציון: </strong><span className="huninn-regular"> latitude - {m.coordinate.latitude}, longitude - {m.coordinate.longitude}</span></div>
                <div><strong className="huninn-bold">שם הפלטפורמה המשויכת: </strong><span className="huninn-regular">{platformName}</span></div>
            </CardContent>
            <CardFooter className="mt-auto flex justify-end gap-2">
                <Button size="sm" variant="outline" onClick={() => onEdit(m)}>
                    <Pencil className="h-4 w-4 mr-1"/>
                </Button>
                <Button size="sm" variant="outline" onClick={() => onDelete(m)}>
                    <Trash2 className="h-4 w-4 mr-1"/>
                </Button>
            </CardFooter>
        </Card>
    )
}

export default MissionCard