import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Label } from "../ui/label";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { PlatformsApi } from "../../services/PlatformApi";
import type { CreatePlatformRequest } from "@/interfaces/PlatformInterface";

function Platform() {

    type NumericKey = "frequency_mhz" | "bw_khz" | "tx_power_dbm" | "antenna_height_m";

    const [platform, setPlatform] = useState({
        name: "",
        frequency_mhz: NaN as number,
        bw_khz: NaN as number,
        tx_power_dbm: NaN as number,
        antenna_height_m: NaN as number    
    });
    const [raw, setRaw] = useState<Record<NumericKey, string>>({
        frequency_mhz: "",
        bw_khz: "",
        tx_power_dbm: "",
        antenna_height_m: ""
    });
    const [err, setErr] = useState({
        name: "",
        frequency_mhz: "",
        bw_khz: "",
        tx_power_dbm: "",
        antenna_height_m: ""
    });

    const navigate = useNavigate();

    const validatePlatform = () :boolean => {
        let valid = true;
        const tmp = {
            name: "",
            frequency_mhz: "",
            bw_khz: "",
            tx_power_dbm: "",
            antenna_height_m: ""
        };
        if(!platform.name.trim()){
            tmp.name = "שם הפלטפורמה הוא חובה!";
            valid = false;
        }

        const decimalPattern = /^\d+(\.\d+)?$/;

        (["frequency_mhz","bw_khz","tx_power_dbm","antenna_height_m"] as NumericKey[])
        .forEach((key) => {
            const text = raw[key]?.trim();

            if(!text){
                tmp[key] = "שדה חובה!";
                valid = false;
                return;
            }

            if(!decimalPattern.test(text)){
                tmp[key] = "חייב להיות מספר עשרוני חיובי.";
                valid = false;
                return;
            }

            const n = Number(text);
            if(!Number.isFinite(n)){
                tmp[key] = "חייב להיות מספר";
                valid = false;
                return;
            }
            if (n <= 0){
                tmp[key] = "חייב להיות מספר חיובי.";
                valid = false;
                return;
            }
        });

        setErr(tmp);
        return valid;
    };

    const onChangeText = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPlatform(p => ({ ...p, name: e.target.value }));
        if (err.name) setErr(prev => ({ ...prev, name: "" }));
    };

    const onChangNumber = (key: NumericKey) => 
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const v = e.target.value;
            setRaw(r => ({...r, [key]: v}));
            if(err[key]) setErr(prev => ({ ...prev, [key]: "" }));
        };

    const handleSubmit = async (e : React.FormEvent) => {
        e.preventDefault();
        
        if (!validatePlatform()) return;

        const dto: CreatePlatformRequest = {
            name: platform.name.trim(),
            frequency_mhz: Number(raw.frequency_mhz),
            bw_khz: Number(raw.bw_khz),
            tx_power_dbm: Number(raw.tx_power_dbm),
            antenna_height_m: Number(raw.antenna_height_m)
        };

        try{
            const created = await PlatformsApi.create(dto);
            console.log("✅ Platform created:", created)
            navigate("/platform");
        } catch (err: any) {
            console.error("❌ Error creating platform:", err);
            alert("אירעה שגיאה ביצירת הפלטפורמה");
        }
    }

    const fields : {
        key: keyof typeof platform;
        label: string;
        placeholder: string;
    }[] = [
        {key: "name", label: "שם הפלטפורמה: ", placeholder: "הכנס את שם הפלטפורמה שלך"},
        {key: "frequency_mhz", label:"עוצמת התדר: (MHz)", placeholder: "הכנס את עוצמת התדר של הפלטפורמה"},
        {key: "bw_khz", label:"רוחב פס התדר: (KHz)", placeholder:"הכנס את רוכב פס התדר שלך"},
        {key: "tx_power_dbm", label:"עוצמת שידור: (dBm)", placeholder:"הכנס את עוצמת השידור של הפלטפורמה שלך"},
        {key: "antenna_height_m", label: "גובה אנטנה: (m)", placeholder: "הכנס את גובה האנטנה שלך"}
    ];


    return (
        <main className="p-5">
            <div className="bg-blue-100 rounded-xl p-10 md:p-10 w-[1800px] h-[750px] mx-auto shadow-md flex items-center justify-center">
                <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md space-y-6">
                    <h1 className="suez-one-regular text-6xl text-center text-blue-700">
                        הכנסת פלטפורמה
                    </h1>

                    <form onSubmit={handleSubmit} className="space-y-1">
                        {fields.map((field) => (
                            <div className="space-y-2" key={field.key as string}>
                                <Label htmlFor={field.key} className="huninn-regular text-lg text-gray-700">
                                    {field.label}
                                </Label>
                                {field.key === "name" ? (
                                    <Input
                                    className="rounded"
                                    id={field.key as string}
                                    type="text"
                                    value={platform.name}
                                    placeholder={field.placeholder}
                                    onChange={onChangeText}/>
                                ): (
                                    <Input
                                    className="rounded"
                                    id={field.key as string}
                                    type="text"
                                    inputMode="decimal"
                                    value={raw[field.key as NumericKey]}
                                    placeholder={field.placeholder}
                                    onChange={onChangNumber(field.key as NumericKey)}/>
                                )}
                                {err[field.key as keyof typeof err] && (
                                    <p className="text-sm text-red-600">{err[field.key as keyof typeof err]}</p>
                                )}
                            </div>
                        ))}

                        <Button className="w-full text-lg huninn-regular shadow-md  hover:text-blue-600" onClick={handleSubmit}>
                            יצירת פלטפורמה
                        </Button>
                        
                    </form>
                </div>
            </div>
        </main>
    )
}

export default Platform