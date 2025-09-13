import {useEffect, useState} from "react";
import { PlatformCard } from "./PlatformCard";
import type { Platform } from "../../interfaces/PlatformInterface";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import {PlatformsApi} from "../../services/PlatformApi";

function PlatformGallery() {
    const [items, setItems] = useState<Platform[] | null>(null);
    const [error, setError] = useState<String | null>(null);
    const [editing, setEditing] = useState<Platform | null>(null);
    
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

    useEffect(() => {load();},[]);

    async function handleDelete(p: Platform) {
        await (PlatformsApi as any).remove(p.id);
        await load();
    }

    async function submitEdit() {
        if(!editing) return;
        await (PlatformsApi as any).update(editing.id, {
            name: editing.name,
            type: editing.type,
            frequency_mhz: editing.frequency_mhz,
            bw_khz: editing.bw_khz,
            tx_power_dbm: editing.tx_power_dbm,
            antenna_height_m: editing.antenna_height_m
        });
        setEditing(null);
        await load();
    }

    return (
        <div className="bg-blue-100 rounded-xl p-8 md:p-10 w-[1800px] h-[750px] mx-auto shadow-md flex flex-col gap-8">
            <h1 className="suez-one-regular text-5xl text-center text-blue-700">פלטפורמות</h1>
            <section className="grid gap-6 grid-cols-1 w-[700px] sm:grid-cols-2 lg:grid-cols-3">
                {
                    items?.map((p:Platform) => (
                        <PlatformCard
                        key={p.id}
                        p={p}
                        onEdit={setEditing}
                        onDelete={handleDelete}/>
                    ))
                }
            </section>
            {
                !items?.length && (
                    <div className="huninn-regular">אין פלטפורמות עדיין.</div>
                )
            }

            <Dialog open={!!editing} onOpenChange={(v)=>!v && setEditing(null)}>
                <DialogContent className="sm:max-w-[425px] rounded-xl bg-blue-100 border border-black">
                    <DialogHeader>
                        <DialogTitle className="text-right huninn-regular">עריכת פלטפורמה</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-2">
                        <div className="grid grid-cols-4 items-center gap-2">
                            <Label className="huninn-regular text-lg text-gray-700">שם</Label>
                            <Input className="col-span-3" value={editing?.name ?? ""} onChange={(e)=>
                                setEditing((s) => (s ? { ...s, name: e.target.value } : s))
                            }
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-2">
                            <Label className="huninn-regular text-lg text-gray-700">תדר (MHz)</Label>
                            <Input className="col-span-3" type="number" value={editing?.frequency_mhz ?? ""} onChange={(e)=>
                                setEditing((s) => (s ? { ...s, frequency_mhz: Number(e.target.value) } : s))
                            }
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-2">
                            <Label className="huninn-regular text-lg text-gray-700">רוחב פס (kHz)</Label>
                            <Input className="col-span-3" type="number" value={editing?.bw_khz ?? ""} onChange={(e)=>
                                setEditing((s) => (s ? { ...s, bw_khz: Number(e.target.value) } : s))
                            }
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-2">
                            <Label className="huninn-regular text-lg text-gray-700">עוצמת שידור (dBm)</Label>
                            <Input className="col-span-3" type="number" value={editing?.tx_power_dbm ?? ""} onChange={(e)=>
                                setEditing((s) => (s ? { ...s, tx_power_dbm: Number(e.target.value) } : s))
                            }
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-2">
                            <Label className="huninn-regular text-lg text-gray-700">גובה אנטנה (m)</Label>
                            <Input className="col-span-3" type="number" value={editing?.antenna_height_m ?? ""} onChange={(e)=>
                                setEditing((s) => (s ? { ...s, antenna_height_m: Number(e.target.value) } : s))
                            }
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button className="hover:text-blue-900 border rounded-xl text-right huninn-regular border-black" onClick={()=> setEditing(null)}>
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