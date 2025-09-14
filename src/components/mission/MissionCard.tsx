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
    return (
        <Card className="hover:shadow-lg transition-shadow h-full flex flex-col bg-white border-black">
            <CardHeader>
                <CardTitle className="text-lg huninn-regular">{m.type}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2 ">
                <div>סוג הסביבה: <span className="huninn-regular">{m.enviroment_type}</span></div>
                <div>נקודת ציון: <span className="huninn-regular"> lat - {m.coordinate.latitude}, lon - {m.coordinate.longitude}</span></div>
                <div>שם הפלטפורמה המשויכת: <span className="huninn-regular">{platformName}</span></div>
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