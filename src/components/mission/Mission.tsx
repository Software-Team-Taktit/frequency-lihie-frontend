import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PlatformsApi } from "../../services/PlatformApi";
import { MissionsApi } from "../../services/MissionApi";
import type { CreateMissionRequest } from "../../interfaces/MissionInterface";
import type { Platform } from "@/interfaces/PlatformInterface";
 

function Mission() {
    const [mission, setMission] = useState({
        enviroment_type: "",
        platform_id: ""
    });

    type NumericKey = "lat" | "lon";

    const [raw, setRaw] = useState<Record<NumericKey, string>>({
        lat: "",
        lon: ""
    });

    const [err, setErr] = useState({
        enviroment_type: "",
        lat: "",
        lon: "",
        platform_id: ""
    });

    const [platforms, setPlatforms] = useState<Platform[]>([]);
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
            enviroment_type: "",
            lat: "",
            lon: "",
            platform_id: ""
        };

        if(!mission.enviroment_type.trim()){
            tmp.enviroment_type = "שדה חובה!";
            valid = false;
        }

        const decimalPattern = /^-?\d+(\.\d+)?$/;

        (["lat", "lon"] as NumericKey[]).forEach(key => {
            const text = raw[key]?.trim();

            if(!text){
                tmp[key] = "שדה חובה!";
                valid = false;
                return;
            }

            if(!decimalPattern.test(text)){
                tmp[key] = "חייב להיות מספר עשרוני!";
                valid = false;
                return;
            }

            const n = Number(text);
            if(!Number.isFinite(n)){
                tmp[key] = "חייב להיות מספר!";
                valid = false;
                return;
            }
            if (key === "lat" && (n < -90 || n > 90)){
                tmp.lat = "קו רוחב חייב להיות בין 90- ל-90!";
                valid = false;
                return;
            }
            if(key === "lon" && (n < -180 || n > 180)){
                tmp.lon = "קו אורך חייב להיות בין 180- ל-180!";
                valid=false;
                return;
            }
        });
        if(!mission.platform_id){
            tmp.platform_id = "בחר/י פלטפורמה מהרשימה!";
            valid= false;
        }
        setErr(tmp);
        return valid;
    };
    
    const onChangeEnv = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMission(p => ({ ...p, enviroment_type: e.target.value }));
        if (err.enviroment_type) setErr(prev => ({ ...prev, enviroment_type: "" }));
    };

    const onChangeNumber = (key: NumericKey) =>
        (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value;
        setRaw(r => ({ ...r, [key]: v }));
        if (err[key]) setErr(prev => ({ ...prev, [key]: "" }));
        };

    const onChangePlatform = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setMission(p => ({ ...p, platform_id: e.target.value }));
        if (err.platform_id) setErr(prev => ({ ...prev, platform_id: "" }));
    };

    const handleSubmit = async (e:React.FormEvent) => {
        e.preventDefault();
        
        if(!validateMission()) return;

        const dto: CreateMissionRequest = {
            coordinate: {latitude: Number(raw.lat), longitude: Number(raw.lon)},
            enviroment_type: mission.enviroment_type.trim(),
            platform_id: mission.platform_id
        };
        console.log("DTO sending: ", dto);
        try{
            const created = await MissionsApi.create(dto);
            console.log("✅ Mission created:", created);
            navigate("/home");
        } catch (e: any){
            console.error("❌ Error creating mission:", e.status, e.data);
            const next = {...err};
            console.error("422 DETAIL:", JSON.stringify(e?.data, null, 2));
            const detail = e?.data?.detail;
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
            setErr?.(e.message || "אירעה שגיאה");
        }
    };

    const fields :{
        key: "enviroment_type" | "lat" | "lon";
        label: string;
        placeholder: string;
    }[] = [
        {key: "enviroment_type", label: "סוג הסביבה:", placeholder: "הכנס את סוג הסביבה שהמשימה נמצאת בה"},
        {key: "lat", label:"קו רוחב", placeholder: "הכנס את קו רוחב ה-נ.צ. שלך"},
        {key: "lon", label:"קו אורך", placeholder:"הכנס את קו אורך ה-נ.צ. שלך"}
    ];
    return (
        <main className="p-5">
            <div className="bg-blue-100 rounded-xl p-10 w-[1800px] h-[800px] mx-auto shadow-md flex items-center justify-center">
                <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md space-y-6">
                    <h1 className="suez-one-regular text-6xl text-center text-blue-700">קליטת משימה</h1>
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div className="space-y-2">
                            <Label htmlFor="platform_id" className="huninn-regular text-lg text-gray-700">בחירת פלטפורמה</Label>
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
                        
                        {
                            fields.map((field) => (
                                <div className="space-y-2" key={field.key}>
                                    <Label htmlFor={field.key} className="huninn-regular text-lg text-gray-700">
                                        {field.label}
                                    </Label>
                                    {
                                        field.key === "enviroment_type" ? (
                                            <Input
                                            className="rounded"
                                            id="enviroment_type"
                                            type="text"
                                            value={mission.enviroment_type}
                                            placeholder={field.placeholder}
                                            onChange={onChangeEnv}/>
                                        ) : field.key === "lat" ? (
                                            <Input
                                            className="rounded"
                                            id="lat"
                                            type="text"
                                            inputMode="decimal"
                                            value={raw.lat}
                                            placeholder={field.placeholder}
                                            onChange={onChangeNumber("lat")}/>
                                        ) : (
                                            <Input
                                            className="rounded"
                                            id="lon"
                                            type="text"
                                            inputMode="decimal"
                                            value={raw.lon}
                                            placeholder={field.placeholder}
                                            onChange={onChangeNumber("lon")}/>
                                        )
                                    }
                                    {err[field.key] && <p className="text-sm text-red-600">{err[field.key]}</p>}
                                </div>
                            ))
                        }
                        <Button className="hover:text-blue-600 w-full mt-4 text-lg huninn-regular shadow-md" type="submit">
                            יצירת משימה
                        </Button>
                    </form>
                </div>
            </div>
        </main>
    )

}

export default Mission;