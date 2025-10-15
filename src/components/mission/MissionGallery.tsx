import { useEffect, useState } from "react";
import MissionCard from "./MissionCard";
import type { Mission } from "../../interfaces/MissionInterface";
import MissionForm from "./MissionForm";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogHeader, DialogTitle, DialogContent } from "../../components/ui/dialog";
import { MissionsApi } from "../../services/MissionApi";

function MissionGallery() {
    const [items, setItems] = useState<Mission[] | null>(null);
    const [editing, setEditing] = useState<Mission | null>(null);
    const navigate = useNavigate();

    async function load(){
        const lst = await MissionsApi.list();
        setItems(Array.isArray(lst) ? lst : []);
    }

    useEffect(() => {load();},[]);

    async function handleDelete(m: Mission){
        await MissionsApi.remove(m.id);
        await load();
    }

    return(
        <div className="bg-blue-100 rounded-xl p-8 md:p-10 w-[1800px] h-[750px] mx-auto shadow-md flex flex-col gap-8" dir="rtl">
            <div className="flex items-center justify-between">
                <Button className="flex items-center gap-2 bg-white text-blue-600 hover:bg-blue-700 rounded-full px-4 py-2"
                onClick={()=> navigate("/missionForm")}>
                    <Plus className="w-4 h-4"/>
                </Button>
                <h1 className="suez-one-regular text-6xl text-center text-blue-700">משימות</h1>
                <div className="w-12"></div>
            </div>
            <div className="flex-1 overflow-y-auto pr-2">
                <section className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-max">
                    {items?.map((m) => (
                        <MissionCard key={m.id} m={m} onEdit={setEditing} onDelete={handleDelete}/> 
                    ))}
                </section>
            </div>
            <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
                <DialogContent className="sm:max-w-[600px] rounded-2xl bg-blue-100 border border-black">
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
                        onSaved={async () => {
                            setEditing(null);
                            await load();
                        }}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default MissionGallery