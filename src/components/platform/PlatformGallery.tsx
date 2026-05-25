import { useEffect, useState } from "react";
import { PlatformCard } from "./PlatformCard";
import type { Platform } from "../../interfaces/PlatformInterface";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../../components/ui/dialog";
import { PlatformsApi } from "../../services/PlatformApi";

function PlatformGallery() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [items, setItems] = useState<Platform[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [editing, setEditing] = useState<Platform | null>(null);
    const [accessDialogOpen, setAccessDialogOpen] = useState(false);
    
    async function load() {
        try{
            setError(null);
            const lst = await PlatformsApi.list();
            setItems(Array.isArray(lst) ? lst : []);
        } catch (e:any){
            setError(e.message || "שגיאה בטעינה");
            console.log(error);
        } 
    }

    useEffect(() => {
        if(!user) {
            setItems([]);
            setEditing(null);
            setAccessDialogOpen(true);
            return;
        }
        load();
    }, [user]);

    function handleCreatePlatformClick(){
        if (!user) {
            setAccessDialogOpen(true);
            return;
        }
        navigate("/platformForm");
    }

    function handleEditPlatformClick(p: Platform){
        if (!user) {
            setAccessDialogOpen(true);
            return;
        }

        setEditing(p);
    }

    async function handleDelete(p: Platform) {
        if (!user){
            setAccessDialogOpen(true);
            return;
        }
        await (PlatformsApi as any).remove(p.id);
        await load();
    }

    async function submitEdit() {
        if(!editing) return;
        await (PlatformsApi as any).update(editing.id, {
            name: editing.name,
            bw_khz: editing.bw_khz,
            tx_gain: editing.tx_gain,
            tx_height_m: editing.tx_height_m,
            rx_gain: editing.rx_gain,
            rx_height_m: editing.rx_height_m,
            min_sinr_required_db: editing.min_sinr_required_db,
            noise_figure_db: editing.noise_figure_db,
        });
        setEditing(null);
        await load();
    }

    function closeAccessDialogAndGoHome() {
        setAccessDialogOpen(false);
        navigate("/home");
    }

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
                            <DialogDescription className="w-full text-lg text-right sm:text-right huninn-regular text-gray-800 leading-8">
                                גלריית הפלטפורמות מכילה מידע מבצעי ולכן זמינה רק למשתמשים מחוברים.
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
        <div className="bg-blue-100 rounded-xl p-8 md:p-10 w-[1800px] h-[750px] mx-auto shadow-md flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <Button className="flex items-center gap-2 bg-white text-blue-600 hover:bg-blue-700 rounded-full px-4 py-2"
                onClick={handleCreatePlatformClick}>
                    <Plus className="w-4 h-4"/>
                </Button>
                <h1 className="suez-one-regular text-6xl text-center text-blue-700">פלטפורמות</h1>
                <div className="grid grid-cols-3 items-center"></div>
            </div>
            <div className="flex-1 overflow-y-auto pr-2">
                <section className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-max">
                    {items?.map((p:Platform) => (
                        <PlatformCard
                        key={p.id} p={p} onEdit={handleEditPlatformClick} onDelete={handleDelete}/>
                    ))}
                </section>
            </div>
            {
                !items?.length && (
                    <div className="huninn-regular">אין פלטפורמות עדיין.</div>
                )
            }

            <Dialog open={!!editing} onOpenChange={(v)=>!v && setEditing(null)}>
                <DialogContent className="sm:max-w-[500px] rounded-xl bg-blue-100 border border-black">
                    <DialogHeader>
                        <DialogTitle className="text-right font-bold text-2xl huninn-regular">עריכת פלטפורמה</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-2">
                        <div className="grid grid-cols-4 items-center gap-2">
                            <Label className="huninn-regular text-lg text-gray-700">שם</Label>
                            <Input className="col-span-3 rounded" value={editing?.name ?? ""} onChange={(e)=>
                                setEditing((s) => (s ? { ...s, name: e.target.value } : s))
                            }
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-2">
                            <Label className="huninn-regular text-lg text-gray-700">רוחב פס (kHz)</Label>
                            <Input className="col-span-3 rounded" type="number" value={editing?.bw_khz ?? ""} onChange={(e)=>
                                setEditing((s) => (s ? { ...s, bw_khz: Number(e.target.value) } : s))
                            }
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-2">
                            <Label className="huninn-regular text-lg text-gray-700">
                                רווח אנטנת שידור (dB)
                            </Label>
                            <Input
                                className="col-span-3 rounded"
                                type="number"
                                value={editing?.tx_gain ?? ""}
                                onChange={(e) =>
                                    setEditing((s) =>
                                        s ? { ...s, tx_gain: Number(e.target.value) } : s
                                    )
                                }
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-2">
                            <Label className="huninn-regular text-lg text-gray-700">
                                גובה אנטנת שידור (m)
                            </Label>
                            <Input
                                className="col-span-3 rounded"
                                type="number"
                                value={editing?.tx_height_m ?? ""}
                                onChange={(e) =>
                                    setEditing((s) =>
                                        s ? { ...s, tx_height_m: Number(e.target.value) } : s
                                    )
                                }
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-2">
                            <Label className="huninn-regular text-lg text-gray-700">
                                רווח אנטנת קליטה (dB)
                            </Label>
                            <Input
                                className="col-span-3 rounded"
                                type="number"
                                value={editing?.rx_gain ?? ""}
                                onChange={(e) =>
                                    setEditing((s) =>
                                        s ? { ...s, rx_gain: Number(e.target.value) } : s
                                    )
                                }
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-2">
                            <Label className="huninn-regular text-lg text-gray-700">
                                גובה אנטנת קליטה (m)
                            </Label>
                            <Input
                                className="col-span-3 rounded"
                                type="number"
                                value={editing?.rx_height_m ?? ""}
                                onChange={(e) =>
                                    setEditing((s) =>
                                        s ? { ...s, rx_height_m: Number(e.target.value) } : s
                                    )
                                }
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-2">
                            <Label className="huninn-regular text-lg text-gray-700">
                                SNR מינימלי (dB)
                            </Label>
                            <Input
                                className="col-span-3 rounded"
                                type="number"
                                value={editing?.min_sinr_required_db ?? ""}
                                onChange={(e) =>
                                    setEditing((s) =>
                                        s
                                        ? { ...s, min_sinr_required_db: Number(e.target.value) }
                                        : s
                                    )
                                }
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-2">
                            <Label className="huninn-regular text-lg text-gray-700">
                                Noise figure (dB)
                            </Label>
                            <Input
                                className="col-span-3 rounded"
                                type="number"
                                value={editing?.noise_figure_db ?? ""}
                                onChange={(e) =>
                                    setEditing((s) =>
                                        s ? { ...s, noise_figure_db: Number(e.target.value) } : s
                                    )
                                }   
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button className="hover:text-blue-900 border rounded-xl text-right huninn-regular ml-3 border-black" onClick={()=> setEditing(null)}>
                            ביטול
                        </Button>
                        <Button className="hover:text-blue-900 border rounded-xl text-right huninn-regular border-black" onClick={submitEdit}>שליחה</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default PlatformGallery