import { useAuth } from "../../context/AuthContext.tsx";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import merhavim_logo from "../../assets/merhavim_logo.png";
import { getFrequencyRange, updateFrequencyRange } from "../../services/ConfigApi.ts";
import type { FrequencyRangeConfig } from "../../services/ConfigApi.ts";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "../ui/dialog.tsx";
import UserProfilePanel from "../profile/UserProfilePanel.tsx";
import { Label } from "@radix-ui/react-label";
import { Input } from "../ui/input.tsx";

type ProtectedTarget = "platform" | "mission" | "missionsMap";

function NavBar() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const isAdmin = !!user && String(user.type).toLowerCase() === "admin";

    const DEFAULT_RANGE: FrequencyRangeConfig = { min_mhz: 500, max_mhz: 1600 };
    const [range, setRange] = useState<FrequencyRangeConfig>(DEFAULT_RANGE);
    const [loadingRange, setLoadingRange] = useState(false);

    const [showDialog, setShowDialog] = useState(false);
    const [draftMin, setDraftMin] = useState<string>("");
    const [draftMax, setDraftMax] = useState<string>("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [profileOpen, setProfileOpen] = useState(false);

    const [accessDialogOpen, setAccessDialogOpen] = useState(false);
    const [accessTarget, setAccessTarget] = useState<ProtectedTarget>("mission");

    const accessTargetText: Record<ProtectedTarget, string> = {
        platform: "גלריית הפלטפורמות",
        mission: "גלריית המשימות",
        missionsMap: "מפת המשימות",
    };

    const handleLogout = () => {
        logout();
        navigate("/home");
    };

    function closeAccessDialogAndGoHome() {
        setAccessDialogOpen(false);
        navigate("/home");
    }

    function handleProtectedNavigation(path: string, target: ProtectedTarget) {
        if (!user) {
            setAccessTarget(target);
            setAccessDialogOpen(true);
            return;
        }

        navigate(path);
    }

    useEffect(() => {
        (async () => {
            setLoadingRange(true);
            setError(null);

            try {
                const r = await getFrequencyRange();
                setRange(r);
            } catch (e: any) {
                setError(e?.response?.data?.detail ?? "Failed to load frequency range");
            } finally {
                setLoadingRange(false);
            }
        })();
    }, []);

    const openEdit = () => {
        if (!range) return;

        setDraftMin(String(range.min_mhz));
        setDraftMax(String(range.max_mhz));
        setError(null);
        setShowDialog(true);
    };

    const onSave = async () => {
        if (!range) return;

        const min = Number(draftMin);
        const max = Number(draftMax);

        if (!Number.isFinite(min) || !Number.isFinite(max)) {
            setError("אנא להזין מספרים תקינים");
            return;
        }

        if (min <= 0 || max <= 0) {
            setError("התדרים חייבים להיות גדולים מ-0");
            return;
        }

        setSaving(true);
        setError(null);

        try {
            const updated = await updateFrequencyRange({
                min_mhz: min,
                max_mhz: max,
            });

            setRange(updated);
            setShowDialog(false);
        } catch (e: any) {
            setError(e?.response?.data?.detail ?? "Failed to save frequency range");
        } finally {
            setSaving(false);
        }
    };

    return (
        <header className="bg-white dark:bg-gray-900 shadow-md">
            <nav className="w-full flex justify-between items-center px-6">
                <div className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-6">
                    <Link to="/home" className="flex items-center">
                        <img
                            src={merhavim_logo}
                            alt="מרחבים לוגו"
                            className="h-[70px] w-[150px] object-contain"
                        />
                    </Link>

                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            className="hover:text-blue-600 transition-all huninn-regular mr-5 bg-transparent border-none p-0 text-inherit cursor-pointer"
                            onClick={() => handleProtectedNavigation("/platform", "platform")}
                        >
                            פלטפורמה
                        </button>

                        <button
                            type="button"
                            className="hover:text-blue-600 transition-all huninn-regular mr-5 bg-transparent border-none p-0 text-inherit cursor-pointer"
                            onClick={() => handleProtectedNavigation("/mission", "mission")}
                        >
                            משימה
                        </button>

                        <button
                            type="button"
                            className="hover:text-blue-600 transition-all huninn-regular mr-5 bg-transparent border-none p-0 text-inherit cursor-pointer"
                            onClick={() => handleProtectedNavigation("/missionsMap", "missionsMap")}
                        >
                            מפת משימות
                        </button>

                        <div className="w-64 mr-6 mt-2">
                            <div className="h-2 w-full bg-gray-200 overflow-hidden">
                                <div className="h-full w-full bg-blue-500" />
                            </div>

                            <div className="mt-1 flex items-center justify-between gap-2" dir="ltr">
                                <div className="flex justify-between text-[15px] text-gray-600 huninn-regular w-full">
                                    <span>
                                        {loadingRange
                                            ? "Loading..."
                                            : range
                                                ? `${range.min_mhz} MHz`
                                                : "— MHz"}
                                    </span>

                                    <span>
                                        {loadingRange
                                            ? ""
                                            : range
                                                ? `${range.max_mhz} MHz`
                                                : "— MHz"}
                                    </span>
                                </div>

                                {isAdmin && (
                                    <Button
                                        type="button"
                                        onClick={openEdit}
                                        className="text-xs huninn-regular px-2 py-1 rounded border border-gray-300 hover:bg-gray-50 text-gray-700"
                                        title="עריכת טווח תדרים"
                                    >
                                        עריכה
                                    </Button>
                                )}
                            </div>

                            {error && !showDialog && (
                                <div className="mt-1 text-xs text-red-500">
                                    {error}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-4 text-right leading-tight" dir="rtl">
                    {!user ? (
                        <>
                            <Link to="/register">
                                <Button className="huninn-regular hover:text-blue-600 font-bold text-2xl px-4 py-2 mr-4 text-gray-800">
                                    הרשמה
                                </Button>
                            </Link>

                            <Link to="/logIn">
                                <Button className="huninn-regular hover:text-blue-600 font-bold text-2xl px-4 py-2 text-gray-800">
                                    התחברות
                                </Button>
                            </Link>
                        </>
                    ) : (
                        <>
                            <Button
                                className="huninn-regular hover:text-blue-600 font-bold text-2xl px-4 py-2 ml-4 text-gray-800 m"
                                onClick={handleLogout}
                            >
                                התנתקות
                            </Button>

                            <div className="flex flex-col items-end text-right leading-tight" dir="rtl">
                                <button
                                    type="button"
                                    onClick={() => setProfileOpen(true)}
                                    className="p-0 m-0 bg-transparent border-none shadow-none text-right huninn-regular text-2xl font-semibold text-gray-800 hover:text-blue-600 transition-colors cursor-pointer"
                                    dir="rtl"
                                >
                                    {user.first_name} {user.last_name} - {user.unit}
                                </button>

                                <div
                                    className="mt-1 text-xs text-gray-500 huninn-regular flex flex-row-reverse items-center justify-start gap-1 w-full text-right"
                                    dir="rtl"
                                >
                                    <span className="whitespace-nowrap">
                                        {user.type === "admin" ? "מנהל מערכת" : "משתמש"}
                                    </span>

                                    <span>-</span>

                                    <span className="whitespace-nowrap" dir="ltr">
                                        {user.personal_id}
                                    </span>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </nav>

            {isAdmin && (
                <Dialog
                    open={showDialog}
                    onOpenChange={(open) => {
                        if (saving) return;

                        setShowDialog(open);

                        if (!open) setError(null);
                    }}
                >
                    <DialogContent className="sm:max-w-[425px] rounded-xl bg-blue-100 border border-black">
                        <DialogHeader>
                            <DialogTitle className="text-right huninn-regular">
                                שינוי טווח תדרים מאושר
                            </DialogTitle>

                            <DialogDescription className="text-right huninn-regular">
                                הערך יתעדכן וישפיע על בחירת התדרים.
                                אנא הזין/י מינימום ומקסימום MHz.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="mt-2 flex gap-3" dir="ltr">
                            <div className="flex-1">
                                <Label className="block text-xs text-gray-600 mb-1 huninn-regular">
                                    Min (MHz)
                                </Label>

                                <Input
                                    type="number"
                                    className="w-full rounded-xl border border-black px-3 py-2 text-sm bg-white"
                                    value={draftMin}
                                    onChange={(e) => setDraftMin(e.target.value)}
                                    disabled={saving}
                                />
                            </div>

                            <div className="flex-1">
                                <Label className="block text-xs text-gray-600 mb-1 huninn-regular">
                                    Max (MHz)
                                </Label>

                                <Input
                                    type="number"
                                    className="w-full rounded-xl border border-black px-3 py-2 text-sm bg-white"
                                    value={draftMax}
                                    onChange={(e) => setDraftMax(e.target.value)}
                                    disabled={saving}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="text-right text-xs text-red-600 huninn-regular">
                                {error}
                            </div>
                        )}

                        <div className="mt-2 flex justify-end gap-2">
                            <Button
                                className="hover:text-blue-900 border rounded-xl huninn-regular border-black"
                                onClick={() => setShowDialog(false)}
                                disabled={saving}
                            >
                                ביטול
                            </Button>

                            <Button
                                onClick={onSave}
                                className="hover:text-blue-900 border rounded-xl huninn-regular border-black"
                                disabled={saving}
                            >
                                {saving ? "שומר..." : "שמירה"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

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
                            אין הרשאה לצפייה במסך
                        </DialogTitle>

                        <DialogDescription className="w-full text-right sm:text-right huninn-regular text-gray-800 leading-8">
                            {accessTargetText[accessTarget]} מכילה מידע מבצעי ולכן זמינה רק למשתמשים מחוברים.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="huninn-regular text-lg text-gray-800 text-right leading-8">
                        כדי להמשיך, יש להתחבר למערכת עם משתמש מורשה.
                    </div>

                    <DialogFooter className="flex flex-row-reverse gap-3 mt-4">
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

                        <Button
                            className="rounded-xl bg-blue-400 text-white hover:bg-blue-500 huninn-regular"
                            onClick={closeAccessDialogAndGoHome}
                        >
                            הבנתי
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <UserProfilePanel
                open={profileOpen}
                onOpenChange={setProfileOpen}
            />
        </header>
    );
}

export default NavBar;