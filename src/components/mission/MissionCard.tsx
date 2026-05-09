import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { CheckCircle2, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { PlatformsApi } from "../../services/PlatformApi";
import { UserApi } from "../../services/UserApi";
import { AdminsApi } from "../../services/AdminApi";

import type { Mission } from "../../interfaces/MissionInterface";

function getDisplayName(person: any): string {
    if (!person) return "לא ידוע";

    if (person.full_name) return person.full_name;
    if (person.fullName) return person.fullName;

    const firstName = person.first_name ?? person.firstName ?? "";
    const lastName = person.last_name ?? person.lastName ?? "";

    const fullName = `${firstName} ${lastName}`.trim();
    if (fullName) return fullName;

    return person.name ?? person.username ?? person.personal_id ?? "לא ידוע";
}

function MissionCard({ m, onEdit, onDelete, onFinish }: {
    m: Mission;
    onEdit: (m: Mission) => void;
    onDelete: (m: Mission) => void;
    onFinish: (m: Mission) => void;
}) {
    const [platformName, setPlatformName] = useState<string>("טוען...");
    const [creatorName, setCreatorName] = useState<string>("טוען...");

    useEffect(() => {
        let alive = true;

        (async () => {
            try {
                const p = await PlatformsApi.get(m.platform_id);
                if (alive) setPlatformName(p.name);
            } catch (e) {
                console.error(e);
                if (alive) setPlatformName("לא ידוע");
            }
        })();

        return () => {
            alive = false;
        };
    }, [m.platform_id]);

    useEffect(() => {
        let alive = true;

        (async () => {
            if (!m.owner_id) {
                setCreatorName("לא ידוע");
                return;
            }

            try {
                const user = await UserApi.get(m.owner_id);
                if (alive) setCreatorName(getDisplayName(user));
                return;
            } catch {
                // אם זה לא משתמש רגיל, ננסה למצוא אותו כמנהל
            }

            try {
                const admin = await AdminsApi.get(m.owner_id);
                if (alive) setCreatorName(getDisplayName(admin));
            } catch (e) {
                console.error(e);
                if (alive) setCreatorName("לא ידוע");
            }
        })();

        return () => {
            alive = false;
        };
    }, [m.owner_id]);

    const statusText = m.is_active ? "פעיל" : "לא פעיל";
    const statusClass = m.is_active
        ? "bg-green-100 text-green-700 border-green-200"
        : "bg-red-100 text-red-700 border-red-200";

    return (
        <Card className="hover:shadow-lg transition-shadow h-full flex flex-col bg-white border-black">
            <CardHeader className="flex flex-row items-start justify-between gap-3">
                <CardTitle className="text-2xl huninn-bold">
                    {m.name || "משימה"}
                </CardTitle>

                <span
                    className={`huninn-bold text-sm px-2.5 py-1 rounded-full border ${statusClass}`}
                >
                    {statusText}
                </span>
            </CardHeader>

            <CardContent className="text-sm space-y-2">
                <div>
                    <strong className="huninn-bold">המשימה נוצרה על ידי: </strong>
                    <span className="huninn-regular">{creatorName}</span>
                </div>

                <div>
                    <strong className="huninn-bold">זמן משוערך למשימה:</strong>
                    <span className="huninn-regular"> {m.time} דקות</span>
                </div>

                <div>
                    <strong className="huninn-bold">תדר המשימה (MHz): </strong>
                    <span className="huninn-regular">{m.freq_mhz}</span>
                </div>

                <div>
                    <strong className="huninn-bold">עוצמת שידור (dBm): </strong>
                    <span className="huninn-regular">{m.tx_power_dbm}</span>
                </div>

                <div>
                    <strong className="huninn-bold">נקודת ציון: </strong>
                    <span className="huninn-regular">
                        latitude - {m.coordinate.latitude.toFixed(2)}, longitude - {m.coordinate.longitude.toFixed(2)}
                    </span>
                </div>

                <div>
                    <strong className="huninn-bold">שם הפלטפורמה המשויכת: </strong>
                    <span className="huninn-regular">{platformName}</span>
                </div>
            </CardContent>

            <CardFooter className="mt-auto flex justify-end gap-2">
                {m.is_active && (
                    <Button
                        size="sm"
                        variant="outline"
                        className="border-green-300 text-green-700 hover:bg-green-50"
                        onClick={() => onFinish(m)}
                    >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        סיים משימה
                    </Button>
                )}

                <Button size="sm" variant="outline" onClick={() => onEdit(m)}>
                    <Pencil className="h-4 w-4 mr-1" />
                </Button>

                <Button size="sm" variant="outline" onClick={() => onDelete(m)}>
                    <Trash2 className="h-4 w-4 mr-1" />
                </Button>
            </CardFooter>
        </Card>
    );
}

export default MissionCard;