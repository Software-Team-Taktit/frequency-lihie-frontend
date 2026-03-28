import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PlatformsApi } from "../../services/PlatformApi";
import { MissionsApi } from "../../services/MissionApi";
import type { Platform } from "@/interfaces/PlatformInterface";
import MapPicker from "../mapPicker/MapPicker"; 
import type {EnvPicker} from "../mapPicker/MapPicker";
import type {
    CreateMissionRequest,
    EnvType,
    MapCodetype,
    FrequencyRequest,
    FrequencyResponse,
} from "../../interfaces/MissionInterface";
import { BASE_URL } from "../../services/BaseApi";

const ENV_OPTIONS: { value: EnvType; label: string }[] = [
    { value: "mount", label: "הררי" },
    { value: "urban", label: "עירוני" },
    { value: "open_space", label: "שטח פתוח" },
];

function Mission() {
    const [mission, setMission] = useState({
        name: "",
        time: 0,
        platform_id: ""
    });

    const [envCode, setEnvCode] = useState<string>("");
    const [selectedEnvType, setSelectedEnvType] = useState<EnvType | "">("");

    type Coord = {lat: number | null, lon: number | null};
    const [coord, setCoord] = useState<Coord>({lat: null, lon: null});

    const [err, setErr] = useState({
        name: "",
        time: "",
        enviroment_type: "",
        lat: "",
        lon: "",
        platform_id: "",
        frequency: "",
    });

    const [platforms, setPlatforms] = useState<Platform[]>([]);
    const [showPicker, setShowPicker] = useState(false);

    const [freqResult, setFreqResult] = useState<FrequencyResponse | null>(null);
    const [freqLoading, setFreqLoading] = useState(false);

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

    const calculateEnvType = (mapCode: MapCodetype): EnvType => {
        if (mapCode === "mount") return "mount";
        const denseCodes: MapCodetype[] = [
            "very_dense_urban",
            "dense_urban",
            "urban",
            "suburban",
        ];
        if (denseCodes.includes(mapCode)) return "urban";
        return "open_space";
    }

    const autoEnvType = useMemo<EnvType | undefined>(() => {
        if (!envCode) return undefined;
        return calculateEnvType(envCode as MapCodetype);
    }, [envCode]);

    const finalEnvType = useMemo<EnvType | undefined>(() => {
        return selectedEnvType || autoEnvType;
    }, [selectedEnvType, autoEnvType]);

    const validateMission = () : boolean => {
        let valid = true;
        const tmp = {
            name: "",
            time: "",
            enviroment_type: "",
            lat: "",
            lon: "",
            platform_id: "",
            frequency: "",
        };

        if(!mission.name.trim()){
            tmp.name = "שם משימה הוא שדה חובה";
            valid = false;
        } else if (mission.name.trim().length < 2) {
            tmp.name = "שם משימה צריך להכיל לפחות 2 תווים";
            valid = false;
        }

        if (!finalEnvType) {
            tmp.enviroment_type = "בחר/י נקודה על המפה";
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

        if(!mission.time){
            tmp.time = "חובה להוסיף זמן משוערך למשימה!"; 
            valid = false;
        } 

        setErr(tmp);
        return valid;
    };

    const onChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMission(p => ({ ...p, name: e.target.value }));
        if (err.name) setErr(prev => ({ ...prev, name: "" }));
    };

    const onChangeTime = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = Number(e.target.value);
        if(newTime < 0) {
            setErr(prev => ({ ...prev, time: "הזמן לא יכול להיות שלילי!"}));
            return;
        }
        setMission(prev => ({ ...prev, time: newTime }));
    }
    
    const onChangeEnv = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value as EnvType | "";
        setSelectedEnvType(value);

        if (err.enviroment_type) {
            setErr((prev) => ({ ...prev, enviroment_type: "" }));
        }
    };

    const onChangePlatform = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setMission(p => ({ ...p, platform_id: e.target.value }));
        if (err.platform_id) setErr(prev => ({ ...prev, platform_id: "" }));
    };

    const handlePickFromMap = (picked: EnvPicker) => {
        const detectedEnv = calculateEnvType(picked.code as MapCodetype);
        setEnvCode(picked.code);
        setSelectedEnvType(detectedEnv);
        setCoord({ lat: picked.lat, lon: picked.lon });
        setErr((e) => ({ ...e, enviroment_type: "", lat: "", lon: "" }));
        setShowPicker(false);
    };

    const handleRequestFrequency = async () => {
        setErr((prev) => ({...prev, frequency: ""}));

        if(!validateMission()) return;

        if(!finalEnvType || coord.lat == null || coord.lon == null) return;

        const freqReq: FrequencyRequest = {
            name: mission.name.trim(),
            coordinate: { latitude: coord.lat, longitude: coord.lon },
            enviroment_type: finalEnvType,
            platform_id: mission.platform_id,
        }

        try{
            setFreqLoading(true);
            setFreqResult(null);

            const res = await fetch(`${BASE_URL}/frequency/calculate`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(freqReq),
            });

            if (!res.ok){
                throw new Error("Frequency API returned error");
            }

            const data = (await res.json()) as FrequencyResponse;
            setFreqResult(data);
        } catch (e) {
            console.error(e);
            setErr((prev) => ({
                ...prev,
                frequency: "שגיאה בקבלת התדר ועוצמת השידור",
            }));
        } finally {
            setFreqLoading(false);
        }
    }

    const handleSubmit = async (e:React.FormEvent) => {
        e.preventDefault();

        const baseValid = validateMission();
        if(!baseValid) return;

        if(!freqResult) {
            setErr((prev) => ({
                ...prev,
                frequency: "יש לקבל תדר ועוצמת שידור לפני יצירת משימה",
            }));
            return;
        }

        const dto: CreateMissionRequest = {
            name: mission.name.trim(),
            time: mission.time,
            coordinate: { latitude: coord.lat!, longitude: coord.lon! },
            freq_mhz: freqResult.freq_mhz,
            tx_power_dbm: freqResult.tx_power_dbm,
            platform_id: mission.platform_id,
        }

        try {
            const created = await MissionsApi.create(dto);
            console.log("✅ Mission created:", created);
            navigate("/mission");
        } catch (e) {
            console.error(e);
            setErr((prev) => ({
                ...prev,
                frequency: "שגיאה בשליחת המשימה לשרת",
            }));
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
                            <Label htmlFor="time" className="huninn-regular text-lg text-gray-700">זמן משימה משוערך (בדקות):</Label>
                            <Input id="time" className="rounded flex-1" type="text" placeholder="הכנס זמן משימה משוערך (בדקות)"
                            value={mission.time} onChange={onChangeTime}/>
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
                                <select
                                    id="enviroment_type"
                                    className="w-full rounded border border-gray-300 p-2"
                                    value={selectedEnvType}
                                    onChange={onChangeEnv}
                                >
                                    <option value="">בחר סוג סביבה...</option>
                                    {ENV_OPTIONS.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}

                                </select>
                                <Button className="huninn-regular" type="button" onClick={()=> setShowPicker(true)}>בחירה מהמפה</Button>
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

                        <div className="space-y-2 border-t pt-4">
                            <Button type="button" className="w-full huninn-regular shadow-md hover:text-blue-600" 
                            onClick={handleRequestFrequency} disabled={freqLoading}>
                            {
                                freqLoading ? "מבקש תדר ועוצמת שידור..." : "קבלת תדר ועוצמת שידור מתאימה"
                            }
                            </Button>
                            {
                                err.frequency && (
                                    <p className="text-sm text-red-600">{err.frequency}</p>
                                )
                            }
                            {
                                freqResult&& (
                                    <div className="mt-3 rounded border border-gray-200 bg-gray-50 p-3 space-y-1 huninn-regular text-gray-800">
                                        <div>
                                            <strong>תדר שנבחר (MHz): </strong>
                                            {freqResult.freq_mhz.toFixed(3)}
                                        </div>
                                        <div>
                                            <strong>עוצמת שידור שנבחרה (dBm):  </strong>
                                            {freqResult.tx_power_dbm.toFixed(2)}
                                        </div>
                                    </div>
                                )
                            }
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