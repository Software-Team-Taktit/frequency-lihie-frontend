import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { PlatformsApi } from "../../services/PlatformApi";
import type { Mission } from "../../interfaces/MissionInterface";

const ENV_LABELS: Record<string, string> = {
    very_dense_urban: "צפוף מאוד מאוד",
    dense_urban:     "צפוף עירוני",
    urban:           "עירוני",
    suburban:        "פרברי",
    rural_village:   "כפרי",
};

const envCodeToLabel = (code?: string) => (code ? (ENV_LABELS[code] ?? code) : "");

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
    return (
        <Card className="hover:shadow-lg transition-shadow h-full flex flex-col bg-white border-black">
            <CardHeader>
                <CardTitle className="text-2xl huninn-bold">{m.name || "משימה"}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2 ">
                <div><strong className="huninn-bold">סוג הסביבה: </strong> <span className="huninn-regular">{envCodeToLabel(m.enviroment_type)}</span></div>
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