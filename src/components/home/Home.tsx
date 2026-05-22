import { useState } from "react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";

type ProtectedTarget = "platform" | "mission" | "missionsMap";

function Home() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [accessDialogOpen, setAccessDialogOpen] = useState(false);
    const [accessTarget, setAccessTarget] = useState<ProtectedTarget>("mission");

    const accessTargetText: Record<ProtectedTarget, string> = {
        platform: "גלריית הפלטפורמות",
        mission: "גלריית המשימות",
        missionsMap: "מפת המשימות",
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

    return (
        <main className="p-5" dir="rtl">
            <div className="bg-blue-100 rounded-xl p-10 md:p-10 w-[1800px] h-[750px] mx-auto shadow-md flex items-center justify-center">
                <div className="bg-white p-10 rounded-2xl shadow-2xl text-center space-y-6 max-w-3xl w-full">
                    <h1 className="suez-one-regular text-8xl text-blue-700">
                        ברוכים הבאים למרחבים
                    </h1>

                    <p className="huninn-regular text-gray-700 text-2xl max-w-2xl mx-auto">
                        מערכת חכמה לניהול תדרים בשעת חירום המאפשרת הקצאה בזמן אמת לפי תנאים בשטח וצרכים מבצעיים.
                    </p>

                    <div className="flex justify-center gap-6 pt-6">
                        <Button
                            className="bg-blue-500 hover:bg-blue-200 text-white px-6 py-3 rounded-lg shadow-md text-lg huninn-regular transition duration-200"
                            variant="outline"
                            onClick={() => handleProtectedNavigation("/platform", "platform")}
                        >
                            פלטפורמות
                        </Button>

                        <Button
                            className="bg-blue-500 hover:bg-blue-200 text-white px-6 py-3 rounded-lg shadow-md text-lg huninn-regular transition duration-200"
                            variant="outline"
                            onClick={() => handleProtectedNavigation("/mission", "mission")}
                        >
                            משימות
                        </Button>

                        <Button
                            className="bg-blue-500 hover:bg-blue-200 text-white px-6 py-3 rounded-lg shadow-md text-lg huninn-regular transition duration-200"
                            variant="outline"
                            onClick={() => handleProtectedNavigation("/missionsMap", "missionsMap")}
                        >
                            מפת משימות
                        </Button>
                    </div>
                </div>
            </div>

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
        </main>
    );
}

export default Home;