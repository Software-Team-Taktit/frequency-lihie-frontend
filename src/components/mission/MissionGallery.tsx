import { useEffect, useMemo, useState } from "react";
import MissionCard from "./MissionCard";
import type { Mission } from "../../interfaces/MissionInterface";
import MissionForm from "./MissionForm";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
    Dialog,
    DialogHeader,
    DialogTitle,
    DialogContent,
    DialogFooter,
    DialogDescription
} from "../../components/ui/dialog";
import { MissionsApi } from "../../services/MissionApi";
import MissionActivityFilter from "./MissionActivityFilter";
import {
    filterMissionByActivity,
    type MissionActivityFilterValue,
} from "../../lib/missionFilters";
import { useAuth } from "../../context/AuthContext";

function MissionGallery() {
    const [items, setItems] = useState<Mission[] | null>(null);
    const [editing, setEditing] = useState<Mission | null>(null);
    const [activityFilter, setActivityFilter] =
        useState<MissionActivityFilterValue>("all");

    const [accessDialogOpen, setAccessDialogOpen] = useState(false);
    const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);

    type PermissionDialogAction = "update" | "delete" | "finish";

    const permissionDialogText: Record<PermissionDialogAction, string> = {
        update: "לערוך",
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

        if (!mission.owner_id) return false;

        return String(mission.owner_id) === String(getCurrentUserId());
    }

    async function load() {
        try {
            const lst = await MissionsApi.list();
            setItems(Array.isArray(lst) ? lst : []);
        } catch (error) {
            console.error("failed to load missions: ", error);
            setItems([]);
        }
    }

    useEffect(() => {
        if (!user) {
            setItems([]);
            setEditing(null);
            setAccessDialogOpen(true);
            return;
        }

        load();
    }, [user]);

    async function handleDelete(m: Mission) {
        if (!user) {
            openAccessDialog();
            return;
        }

        if (!canCurrentUserModifyMission(m)) {
            openPermissionDialog("delete");
            return;
        }

        try {
            await MissionsApi.remove(m.id);
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

            setItems((prev) =>
                prev
                    ? prev.map((m) =>
                        m.id === mission.id ? updatedMission : m
                    )
                    : prev
            );
        } catch (error: any) {
            console.error("failed to finish mission: ", error);

            if (error?.status === 403) {
                openPermissionDialog("finish");
                return;
            }
        }
    }

    function handleCreateMissionClick() {
        if (!user) {
            openAccessDialog();
            return;
        }

        navigate("/missionForm");
    }

    function handleUpdateMissionClick(m: Mission) {
        if (!user) {
            openAccessDialog();
            return;
        }

        if (!canCurrentUserModifyMission(m)) {
            openPermissionDialog("update");
            return;
        }

        setEditing(m);
    }

    const filteredItems = useMemo(() => {
        return filterMissionByActivity(items ?? [], activityFilter);
    }, [items, activityFilter]);

    if (!user){
        return (
            <div className="bg-blue-100 rounded-xl p-8 md:p-10 w-[1800px] h-[750px] mx-auto shadow-md flex items-center justify-center"
                dir="rtl">
                <Dialog open={accessDialogOpen} onOpenChange={
                    (open) => {
                        setAccessDialogOpen(open);
                        if (!open) {
                            navigate("/home");
                        }
                    }
                }>
                    <DialogContent className="sm:max-w-[560px] rounded-2xl bg-blue-100 border border-black"
                        dir="rtl">
                        <DialogHeader className="w-full text-right sm:text-right" dir="rtl">
                            <DialogTitle className="w-full text-right sm:text-right text-3xl huninn-bold text-blue-700">
                                אתה לא מחובר!
                            </DialogTitle>
                            <DialogDescription className="w-full text-xl text-right sm:text-right huninn-regular text-gray-800 leading-8">
                                גלריית המשימות מכילה מידע מבצעי ולכן זמינה רק למשתמשים מחוברים.
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
        )
    }

    return (
        <div
            className="bg-blue-100 rounded-xl p-8 md:p-10 w-[1800px] h-[750px] mx-auto shadow-md flex flex-col gap-8"
            dir="rtl"
        >
            <div className="flex items-center justify-between">
                <Button
                    className="flex items-center gap-2 bg-white text-blue-600 hover:bg-blue-700 rounded-full px-4 py-2"
                    onClick={handleCreateMissionClick}
                >
                    <Plus className="w-4 h-4" />
                </Button>

                <h1 className="suez-one-regular text-6xl text-center text-blue-700">
                    משימות
                </h1>

                <div className="w-12"></div>
            </div>

            <div className="flex items-center justify-between gap-4 flex-wrap">
                <MissionActivityFilter
                    value={activityFilter}
                    onChange={setActivityFilter}
                />

                <div className="huninn-regular text-blue-700">
                    מוצגות {filteredItems.length} משימות
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2">
                {filteredItems.length === 0 ? (
                    <div className="h-full flex items-center justify-center huninn-regular text-xl text-blue-700">
                        אין משימות שמתאימות לפילטור שנבחר
                    </div>
                ) : (
                    <section className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-max">
                        {filteredItems.map((m) => (
                            <MissionCard
                                key={m.id}
                                m={m}
                                onEdit={handleUpdateMissionClick}
                                onDelete={handleDelete}
                                onFinish={handleFinishMission}
                            />
                        ))}
                    </section>
                )}
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
                            onSaved={async () => {
                                setEditing(null);
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

                        <DialogDescription className="w-full text-right text-xl sm:text-right huninn-regular text-gray-900 leading-8">
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

export default MissionGallery;