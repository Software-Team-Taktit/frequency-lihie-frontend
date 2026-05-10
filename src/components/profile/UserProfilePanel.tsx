import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "@radix-ui/react-label";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "../../components/ui/dialog";

import { useAuth, type Principal } from "../../context/AuthContext";
import { type UpdateUserRequest } from "../../interfaces/UserInterface";
import { UserApi } from "../../services/UserApi";
import { AdminsApi } from "../../services/AdminApi";
import { HttpError } from "../../services/BaseApi";

type UserProfilePanelProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

function UserProfilePanel({ open, onOpenChange }: UserProfilePanelProps) {
    const navigate = useNavigate();
    const { user, setUser, deleteCurrentProfile } = useAuth();

    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [unit, setUnit] = useState("");

    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [error, setError] = useState<string | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const isAdmin = !!user && String(user.type).toLowerCase() === "admin";

    const fullName = useMemo(() => {
        if (!user) return "";
        return `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim();
    }, [user]);

    const roleText = isAdmin ? "מנהל מערכת" : "משתמש";

    useEffect(() => {
        if (!user) return;

        setFirstName(user.first_name ?? "");
        setLastName(user.last_name ?? "");
        setUnit(user.unit ?? "");
        setError(null);
    }, [user, editOpen]);

    if (!user) return null;

    async function handleSaveDetails() {
        if (!user) return;

        const dto: UpdateUserRequest = {
            personal_id: user.personal_id,
            first_name: firstName.trim() || user.first_name,
            last_name: lastName.trim() || user.last_name,
            unit: unit.trim() || user.unit,
        };

        setSaving(true);
        setError(null);

        try {
            const updatedFromServer = isAdmin
                ? await (AdminsApi as any).update(user.id, dto)
                : await (UserApi as any).update(user.id, dto);

            const updatedUser = {
                ...user,
                ...updatedFromServer,
                ...dto,
            } as Principal;

            setUser(updatedUser);
            setEditOpen(false);
        } catch (e: any) {
            setError(e?.message ?? "שגיאה בעדכון הפרטים");
        } finally {
            setSaving(false);
        }
    }

    async function handleDeleteProfile() {
        setDeleting(true);
        setDeleteError(null);

        try {
            await deleteCurrentProfile();

            setDeleteOpen(false);
            onOpenChange(false);

            navigate("/logIn", { replace: true });
        } catch (e: unknown) {
            if (e instanceof HttpError && e.status === 409) {
                setDeleteError("לא ניתן למחוק את הפרופיל כי קיימות משימות ששייכות למשתמש הזה.");
            } else {
                setDeleteError("אירעה שגיאה במחיקת הפרופיל. נסי שוב.");
            }
        } finally {
            setDeleting(false);
        }
    }

    return (
        <>
            {open && (
                <div className="fixed inset-0 z-40">
                    <button
                        type="button"
                        className="absolute inset-0 bg-black/40"
                        onClick={() => onOpenChange(false)}
                        aria-label="סגירת פרטי משתמש"
                    />

                    <aside
                        className="absolute left-0 top-0 flex h-full w-[390px] max-w-[90vw] flex-col bg-blue-100 border-r border-black shadow-2xl p-6"
                        dir="rtl"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <button
                                type="button"
                                className="text-2xl text-gray-700 hover:text-blue-700"
                                onClick={() => onOpenChange(false)}
                                aria-label="סגור"
                            >
                                ×
                            </button>

                            <div className="text-right">
                                <h2 className="text-3xl huninn-bold text-blue-700 text-right">
                                    פרטי משתמש
                                </h2>

                                <p className="huninn-regular text-gray-600 mt-1">
                                    צפייה ועדכון פרטים אישיים
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 flex flex-col items-center">
                            <div className="h-24 w-24 rounded-full bg-blue-700 text-white flex items-center justify-center text-5xl huninn-bold shadow-md">
                                {user.first_name?.charAt(0) ?? "?"}
                            </div>

                            <h3 className="mt-4 text-2xl huninn-bold text-gray-900">
                                {fullName || "משתמש"}
                            </h3>

                            <p className="huninn-regular text-gray-600">
                                {roleText}
                            </p>
                        </div>

                        <div className="mt-8 rounded-2xl bg-white border border-black shadow-sm p-5 space-y-5 text-right">
                            <div>
                                <p className="huninn-bold text-blue-700">
                                    שם:
                                </p>
                                <p className="huninn-regular text-lg text-gray-800">
                                    {user.first_name || "לא הוזן"}
                                </p>
                            </div>

                            <div>
                                <p className="huninn-bold text-blue-700">
                                    שם משפחה:
                                </p>
                                <p className="huninn-regular text-lg text-gray-800">
                                    {user.last_name || "לא הוזן"}
                                </p>
                            </div>

                            <div>
                                <p className="huninn-bold text-blue-700">
                                    מספר אישי:
                                </p>
                                <p className="huninn-regular text-lg text-gray-800">
                                    {user.personal_id || "לא הוזן"}
                                </p>
                            </div>

                            <div>
                                <p className="huninn-bold text-blue-700">
                                    יחידה:
                                </p>
                                <p className="huninn-regular text-lg text-gray-800">
                                    {user.unit || "לא הוזנה"}
                                </p>
                            </div>
                        </div>

                        <Button
                            className="mt-6 w-full rounded-xl bg-blue-600 text-white hover:bg-blue-700 huninn-regular text-lg"
                            onClick={() => setEditOpen(true)}
                        >
                            עדכון פרטים
                        </Button>

                        <div className="mt-auto pt-6">
                            {deleteError && (
                                <p className="mb-3 text-right text-sm text-red-700 huninn-regular">
                                    {deleteError}
                                </p>
                            )}

                            <Button
                                variant="outline"
                                className="w-full rounded-xl border-red-500 bg-white text-red-600 hover:bg-red-50 hover:text-red-700 huninn-regular text-lg"
                                onClick={() => {
                                    setDeleteError(null);
                                    setDeleteOpen(true);
                                }}
                            >
                                ✕ מחיקת פרופיל משתמש
                            </Button>
                        </div>
                    </aside>
                </div>
            )}

            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent
                    className="sm:max-w-[500px] rounded-2xl bg-blue-100 border border-black"
                    dir="rtl"
                >
                    <DialogHeader className="w-full text-right sm:text-right">
                        <DialogTitle className="w-full text-right sm:text-right text-2xl huninn-bold text-blue-700">
                            עדכון פרטים
                        </DialogTitle>

                        <DialogDescription className="w-full text-right huninn-regular text-gray-600">
                            ניתן לעדכן את השם הפרטי, שם המשפחה והיחידה של המשתמש.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="space-y-2 text-right">
                            <Label className="huninn-bold text-gray-700">
                                שם:
                            </Label>
                            <Input
                                className="rounded-xl bg-white text-right border-black"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                disabled={saving}
                            />
                        </div>

                        <div className="space-y-2 text-right">
                            <Label className="huninn-bold text-gray-700">
                                שם משפחה:
                            </Label>
                            <Input
                                className="rounded-xl bg-white text-right border-black"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                disabled={saving}
                            />
                        </div>

                        <div className="space-y-2 text-right">
                            <Label className="huninn-bold text-gray-700">
                                יחידה:
                            </Label>
                            <Input
                                className="rounded-xl bg-white text-right border-black"
                                value={unit}
                                onChange={(e) => setUnit(e.target.value)}
                                disabled={saving}
                            />
                        </div>

                        {error && (
                            <div className="text-right text-sm text-red-600 huninn-regular">
                                {error}
                            </div>
                        )}
                    </div>

                    <DialogFooter className="flex flex-row-reverse gap-3">
                        <Button
                            className="rounded-xl bg-blue-600 text-white hover:bg-blue-700 huninn-regular"
                            onClick={handleSaveDetails}
                            disabled={saving}
                        >
                            {saving ? "שומרת..." : "שמירה"}
                        </Button>

                        <Button
                            variant="outline"
                            className="rounded-xl border-black huninn-regular"
                            onClick={() => setEditOpen(false)}
                            disabled={saving}
                        >
                            ביטול
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent
                    className="sm:max-w-[480px] rounded-2xl bg-white border border-red-400"
                    dir="rtl"
                >
                    <DialogHeader className="w-full text-right sm:text-right">
                        <DialogTitle className="w-full text-right sm:text-right text-2xl huninn-bold text-red-600">
                            את/ה בטוח/ה?
                        </DialogTitle>

                        <DialogDescription className="w-full text-right huninn-regular text-gray-700">
                            פעולה זו תמחק את המשתמש הנוכחי לצמיתות. לא ניתן יהיה לשחזר את הפרופיל לאחר המחיקה.
                        </DialogDescription>
                    </DialogHeader>

                    {deleteError && (
                        <p className="text-right text-sm text-red-700 huninn-regular">
                            {deleteError}
                        </p>
                    )}

                    <DialogFooter className="flex flex-row-reverse gap-3">
                        <Button
                            className="rounded-xl bg-red-600 text-white hover:bg-red-700 huninn-regular"
                            onClick={handleDeleteProfile}
                            disabled={deleting}
                        >
                            {deleting ? "מוחק.." : "מחיקה לצמיתות"}
                        </Button>

                        <Button
                            variant="outline"
                            className="rounded-xl border-black huninn-regular"
                            onClick={() => setDeleteOpen(false)}
                            disabled={deleting}
                        >
                            ביטול
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default UserProfilePanel;