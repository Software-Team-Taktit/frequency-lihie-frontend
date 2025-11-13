import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PlatformsApi } from "../../services/PlatformApi";
import { MissionsApi } from "../../services/MissionApi";
import type { CreateMissionRequest } from "../../interfaces/MissionInterface";
import type { Platform } from "@/interfaces/PlatformInterface";
import MapPicker from "../mapPicker/MapPicker"; 
import type {EnvPicker} from "../mapPicker/MapPicker";
import type { MapCodetype, EnvType } from "../../interfaces/MissionInterface";

function Mission() {
    const [mission, setMission] = useState({
        name: "",
        enviroment_type: "",
        platform_id: ""
    });

    const [envLabel, setEnvLabel] = useState<string>("");
    const [envCode, setEnvCode] = useState<string>("");
    const [isIndoor, setIsIndoor] = useState(false);

    type Coord = {lat: number | null, lon: number | null};
    const [coord, setCoord] = useState<Coord>({lat: null, lon: null});

    const [err, setErr] = useState({
        name: "",
        enviroment_type: "",
        lat: "",
        lon: "",
        platform_id: ""
    });

    const [platforms, setPlatforms] = useState<Platform[]>([]);
    const [showPicker, setShowPicker] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        (async ()=> {
            try{
                const list = await PlatformsApi.list();
                setPlatforms(list);
            } catch (e) {
                console.error(e);
                setErr(p => ({...p, platform_id: "שגיאה בטעינות הפלטפורמות"}));
            }
        })();
    }, []) ;

    const validateMission = () : boolean => {
        let valid = true;
        const tmp = {
            name: "",
            enviroment_type: "",
            lat: "",
            lon: "",
            platform_id: ""
        };

        if(!mission.name.trim()){
            tmp.name = "שם משימה הוא שדה חובה";
            valid = false;
        } else if (mission.name.trim().length < 2) {
            tmp.name = "שם משימה צריך להכיל לפחות 2 תווים";
            valid = false;
        }

        if (!envLabel.trim()) {
            tmp.enviroment_type = "בחר/י סוג סביבה מהמפה";
            valid = false;
        }

        if(coord.lat == null || coord.lon == null){
            tmp.lat = "בחר/י נקודה על המפה.";
            tmp.lon = "";
            valid=false;
        } else {
            if(coord.lat < -90 || coord.lat > 90) {tmp.lat = "קו רוחב חייב להיות בין 90- ל-90."; valid=false;}
            if(coord.lon < -180 || coord.lon > 180) {tmp.lon = "קו אורך חייב להיות בין 180- ל-180."; valid=false;}
        }

        if(!mission.platform_id) {tmp.platform_id = "בחר/י פלטפורמה מהרשימה!"; valid = false;}

        setErr(tmp);
        return valid;
    };

    const calculateEnvType = (mapCode: MapCodetype, indoor: boolean): EnvType => {
        if (indoor) return "indoor";
        if (["very_dense_urban", "dense_urban", "urban"].includes(mapCode)) return "urban";
        return "open_space";
    }

    const onChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMission(p => ({ ...p, name: e.target.value }));
        if (err.name) setErr(prev => ({ ...prev, name: "" }));
    };
    
    const onChangeEnv = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEnvLabel(e.target.value);
        if (err.enviroment_type) setErr((prev) => ({ ...prev, enviroment_type: "" }));
    };

    const onChangePlatform = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setMission(p => ({ ...p, platform_id: e.target.value }));
        if (err.platform_id) setErr(prev => ({ ...prev, platform_id: "" }));
    };

    const onChangeIndoor = (e: React.ChangeEvent<HTMLInputElement>) => { 
        setIsIndoor(e.target.checked);
    };

    const handlePickFromMap = (picked: EnvPicker) => {
        setEnvLabel(picked.label);
        setEnvCode(picked.code);
        setMission((p) => ({ ...p, enviroment_type: picked.code }));
        setCoord({lat: picked.lat, lon: picked.lon});
        setErr((e) => ({ ...e, enviroment_type: "", lat: "", lon: "" }));
        setShowPicker(false);
    }

    const handleSubmit = async (e:React.FormEvent) => {
        e.preventDefault();
        
        if(!validateMission()) return;

        const finalEnvType = calculateEnvType(envCode as MapCodetype || mission.enviroment_type as MapCodetype, isIndoor)

        const dto: CreateMissionRequest = {
            name: mission.name.trim(),
            coordinate: {latitude: coord.lat!, longitude: coord.lon!},
            enviroment_type: finalEnvType,
            platform_id: mission.platform_id
        };
        console.log("DTO sending: ", dto);
        try{
            const created = await MissionsApi.create(dto);
            console.log("✅ Mission created:", created);
            navigate("/mission");
        } catch (ex: any){
            const next = {...err};
            const detail = ex?.data?.detail;
            if(Array.isArray(detail)){
                detail.forEach((d:any) => {
                    const path = Array.isArray(d.loc) ? d.loc : [];
                    const msg = d.msg || "שדה לא תקין";
                    if (path[1] === "coordinate" && path[2] === "lat") next.lat = msg;
                    else if (path[1] === "coordinate" && path[2] === "lon") next.lon = msg;
                    else if (path[1] === "enviroment_type") next.enviroment_type = msg;
                    else if (path[1] === "platform_id") next.platform_id = msg;
                });
                setErr(next);
                return;
            }
            setErr((p) => ({ ...p, enviroment_type: "שגיאה בשליחה" }));
        }
    };

    
    return (
        <main className=" p-5">
            <div className="bg-blue-100 rounded-xl p-8 md:p-10 w-[1800px] h-[750px] mx-auto shadow-md flex items-center justify-center">
                <div className="bg-white p-8 md:p-10 rounded-2xl shadow-2xl w-full max-w-md space-y-6">
                    <h1 className="suez-one-regular text-6xl text-center text-blue-700">קליטת משימה</h1>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="huninn-regular text-lg text-gray-700">שם המשימה:</Label>
                            <Input id="name" className="rounded flex-1" type="text" placeholder="הכנס שם משימה"
                            value={mission.name} onChange={onChangeName}/>
                            {err.name && <p className="text-sm text-red-600">{err.name}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="platform_id" className="huninn-regular text-lg text-gray-700">בחירת פלטפורמה:</Label>
                            <select id="platform_id" className="w-full rounded border border-gray-300 p-2" value={mission.platform_id} onChange={onChangePlatform}>
                                <option value="">בחר פלטפורמה...</option>
                                {
                                    platforms.map((p) => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))
                                }
                            </select>
                            {err.platform_id && <p className="text-sm text-red-600">{err.platform_id}</p>}
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="enviroment_type" className="huninn-regular text-lg text-gray-700">
                                סוג הסביבה:
                            </Label>
                            <div className="flex gap-2">
                                <Input
                                id="enviroment_type" 
                                className="rounded flex-1"
                                type="text"
                                placeholder="נבחר אוטומטית מהמפה (ניתן לשינוי ידני)"
                                value={envLabel} 
                                onChange={onChangeEnv}/>
                                <Button type="button" onClick={()=> setShowPicker(true)}>בחירה מהמפה</Button>
                            </div>
                            {err.enviroment_type && <p className="text-sm text-red-600">{err.enviroment_type}</p>}
                        </div>
                        <div className="space-y-1">
                            <Label className="huninn-regular text-lg text-gray-700">נקודת הציון שנבחרה:</Label>
                            <div className="text-sm text-gray-700 bg-gray-50 rounded px-3 py-2">
                                {
                                    coord.lat == null? "לא נבחרה נקודה" : `${coord.lat.toFixed(6)}, ${coord.lon!.toFixed(6)}`
                                }
                            </div>
                            {(err.lat || err.lon) && (
                                <p className="text-sm text-red-600">{err.lat || err.lon}</p>
                            )}
                        </div>

                        <Button className="hover:text-blue-600 w-full mt-4 text-lg huninn-regular shadow-md" type="submit">
                            יצירת משימה
                        </Button>
                    </form>
                </div>
            </div>
            {
                showPicker && (
                    <MapPicker onPick={handlePickFromMap} onClose={() => setShowPicker(false)}/>
                )
            }
        </main>
    )

}

export default Mission;