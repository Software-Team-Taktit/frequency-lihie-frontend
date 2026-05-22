import { useEffect, useState } from "react";
import { Marker, Popup } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";

import BaseMap from "../map/BaseMap";
import MissionCard from "./MissionCard";
import MissionForm from "./MissionForm";

import { MissionsApi } from "../../services/MissionApi";
import type { Mission } from "../../interfaces/MissionInterface";
import { useAuth } from "../../context/AuthContext";

function MissionMapPage() {
    const [missions, setMissions] = useState<Mission[]>([]);
    const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
    const [editing, setEditing] = useState<Mission | null>(null);
    const [loading, setLoading] = useState(true);

    const [accessDialogOpen, setAccessDialogOpen] = useState(false);
    const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);

    type PermissionDialogAction = "update" | "delete" | "finish";

    const permissionDialogText: Record<PermissionDialogAction, string> = {
        update: "לעדכן",
        delete: "למחוק",
        finish: "לסמן כסיום",
    };

    const [permissionDialogAction, setPermissionDialogAction] =
        useState<PermissionDialogAction>("update");

    const { user } = useAuth();
    const navigate = useNavigate();

    function closeAccessDialogAndGoHome() {
        setAccessDialogOpen(false);
        navigate("/home");
    }

    function openAccessDialog() {
        setAccessDialogOpen(true);
    }

    function openPermissionDialog(action: PermissionDialogAction) {
        setPermissionDialogAction(action);
        setPermissionDialogOpen(true);
    }

    function getCurrentUserId() {
        return (user as any)?.id ?? (user as any)?.personal_id;
    }

    function isCurrentUserAdmin() {
        const role = (user as any)?.role;
        const type = (user as any)?.type;

        return (
            String(role).toLowerCase() === "admin" ||
            String(type).toLowerCase().includes("admin")
        );
    }

    function canCurrentUserModifyMission(mission: Mission) {
        if (!user) return false;

        if (isCurrentUserAdmin()) return true;

        if (!(mission as any).owner_id) return false;

        return String((mission as any).owner_id) === String(getCurrentUserId());
    }

    async function load() {
        if (!user) {
            setMissions([]);
            setSelectedMission(null);
            setEditing(null);
            setLoading(false);
            return;
        }

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
        if (!user) {
            setMissions([]);
            setSelectedMission(null);
            setEditing(null);
            setLoading(false);
            setAccessDialogOpen(true);
            return;
        }

        load();
    }, [user]);

    function handleEditMission(mission: Mission) {
        if (!user) {
            openAccessDialog();
            return;
        }

        if (!canCurrentUserModifyMission(mission)) {
            openPermissionDialog("update");
            return;
        }

        setEditing(mission);
    }

    async function handleDelete(mission: Mission) {
        if (!user) {
            openAccessDialog();
            return;
        }

        if (!canCurrentUserModifyMission(mission)) {
            openPermissionDialog("delete");
            return;
        }

        try {
            await MissionsApi.remove(mission.id);

            if (selectedMission?.id === mission.id) {
                setSelectedMission(null);
            }

            await load();
        } catch (error: any) {
            console.error("failed to delete mission: ", error);

            if (error?.status === 403) {
                openPermissionDialog("delete");
                return;
            }
        }
    }

    async function handleFinishMission(mission: Mission) {
        if (!user) {
            openAccessDialog();
            return;
        }

        if (!canCurrentUserModifyMission(mission)) {
            openPermissionDialog("finish");
            return;
        }

        try {
            const updatedMission = await MissionsApi.complete(mission.id);

            setSelectedMission((prev) =>
                prev?.id === mission.id ? updatedMission : prev
            );

            setMissions((prev) =>
                prev.map((m) => (m.id === mission.id ? updatedMission : m))
            );
        } catch (error: any) {
            console.error("failed to finish mission: ", error);

            if (error?.status === 403) {
                openPermissionDialog("finish");
                return;
            }
        }
    }

    if (!user) {
        return (
            <div
                className="bg-blue-100 rounded-xl p-8 md:p-10 w-[1800px] h-[750px] mx-auto shadow-md flex items-center justify-center"
                dir="rtl"
            >
                <Dialog
                    open={accessDialogOpen}
                    onOpenChange={(open) => {
                        setAccessDialogOpen(open);

                        if (!open) {
                            navigate("/home");
                        }
                    }}
                >
                    <DialogContent
                        className="sm:max-w-[560px] rounded-2xl bg-blue-100 border border-black"
                        dir="rtl"
                    >
                        <DialogHeader className="w-full text-right sm:text-right" dir="rtl">
                            <DialogTitle className="w-full text-right sm:text-right text-3xl huninn-bold text-blue-700">
                                אין הרשאה לצפייה במפת המשימות
                            </DialogTitle>

                            <DialogDescription className="w-full text-lg text-right sm:text-right huninn-regular text-gray-800 leading-8">
                                מפת המשימות מכילה מידע מבצעי ולכן זמינה רק למשתמשים מחוברים.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="huninn-regular text-lg text-gray-800 text-right leading-8">
                            כדי להמשיך, יש להתחבר למערכת עם משתמש מורשה.
                        </div>

                        <DialogFooter
                            className="w-full flex !flex-row !items-center !justify-between gap-3 mt-4"
                            dir="rtl"
                        >
                            <div className="flex gap-3">
                                <Button
                                    className="rounded-xl bg-blue-400 text-white hover:bg-blue-500 huninn-regular"
                                    onClick={() => {
                                        navigate("/logIn");
                                        setAccessDialogOpen(false);
                                    }}
                                >
                                    להתחברות
                                </Button>

                                <Button
                                    className="rounded-xl bg-blue-400 text-white hover:bg-blue-500 huninn-regular"
                                    onClick={() => {
                                        navigate("/register");
                                        setAccessDialogOpen(false);
                                    }}
                                >
                                    להרשמה
                                </Button>
                            </div>

                            <Button
                                className="rounded-xl bg-blue-400 text-white hover:bg-blue-500 huninn-regular"
                                onClick={closeAccessDialogAndGoHome}
                            >
                                הבנתי
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        );
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

                <h1 className="suez-one-regular text-6xl text-center text-blue-700">
                    מפת משימות
                </h1>

                <div className="w-32" />
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
                            onEdit={handleEditMission}
                            onDelete={handleDelete}
                            onFinish={handleFinishMission}
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
                <DialogContent
                    className="sm:max-w-[600px] rounded-2xl bg-blue-100 border border-black"
                    dir="rtl"
                >
                    <DialogHeader>
                        <DialogTitle className="text-right font-bold text-2xl huninn-regular">
                            עריכת משימה
                        </DialogTitle>

                        <DialogDescription className="sr-only">
                            עדכון פרטי המשימה
                        </DialogDescription>
                    </DialogHeader>

                    {editing && (
                        <MissionForm
                            mode="edit"
                            initial={editing}
                            onCancel={() => setEditing(null)}
                            onForbidden={() => {
                                setEditing(null);
                                openPermissionDialog("update");
                            }}
                            onSaved={async (updateMission) => {
                                setEditing(null);
                                setSelectedMission(updateMission);
                                await load();
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>

            <Dialog
                open={permissionDialogOpen}
                onOpenChange={setPermissionDialogOpen}
            >
                <DialogContent
                    className="sm:max-w-[600px] rounded-2xl bg-red-100 border border-red-500"
                    dir="rtl"
                >
                    <DialogHeader className="w-full text-right sm:text-right" dir="rtl">
                        <DialogTitle className="w-full text-right sm:text-right text-3xl huninn-bold text-red-700">
                            הרשאה נדחתה!
                        </DialogTitle>

                        <DialogDescription className="w-full text-right sm:text-right huninn-regular text-gray-900 leading-8">
                            הפעולה זמינה רק למשתמש שיצר את המשימה או למנהל מערכת.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="huninn-regular text-lg text-gray-900 text-right leading-8">
                        אי אפשר {permissionDialogText[permissionDialogAction]} משימה שלא שייכת לך.
                        <br />
                        רק המשתמש שיצר את המשימה או מנהל מערכת יכולים לבצע את הפעולה הזו.
                    </div>

                    <DialogFooter className="flex flex-row-reverse gap-3 mt-4">
                        <Button
                            className="rounded-xl bg-red-500 text-white hover:bg-red-600 huninn-regular"
                            onClick={() => setPermissionDialogOpen(false)}
                        >
                            הבנתי
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default MissionMapPage;