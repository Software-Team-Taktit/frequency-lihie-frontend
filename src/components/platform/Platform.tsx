import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Label } from "../ui/label";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { PlatformsApi } from "../../services/PlatformApi";
import type { CreatePlatformRequest } from "@/interfaces/PlatformInterface";

function Platform() {

    type NumericKey = 
        | "bw_khz"
        | "tx_gain"
        | "tx_height_m"
        | "rx_gain"
        | "rx_height_m"
        | "min_sinr_required_db"
        | "noise_figure_db";

    const [platform, setPlatform] = useState({
        name: "",
        bw_khz: NaN as number,
        tx_gain: NaN as number,
        tx_height_m: NaN as number,
        rx_gain: NaN as number,
        rx_height_m: NaN as number,
        min_sinr_required_db: NaN as number,
        noise_figure_db: NaN as number,
    });
    const [raw, setRaw] = useState<Record<NumericKey, string>>({
        bw_khz: "",
        tx_gain: "",
        tx_height_m: "",
        rx_gain: "",
        rx_height_m: "",
        min_sinr_required_db: "",
        noise_figure_db: "",
    });
    const [err, setErr] = useState({
        name: "",
        bw_khz: "",
        tx_gain: "",
        tx_height_m: "",
        rx_gain: "",
        rx_height_m: "",
        min_sinr_required_db: "",
        noise_figure_db: "",
    });

    const navigate = useNavigate();

    const validatePlatform = () :boolean => {
        let valid = true;
        const tmp = {
            name: "",
            bw_khz: "",
            tx_gain: "",
            tx_height_m: "",
            rx_gain: "",
            rx_height_m: "",
            min_sinr_required_db: "",
            noise_figure_db: "",
        };
        if(!platform.name.trim()){
            tmp.name = "שם הפלטפורמה הוא חובה!";
            valid = false;
        }

        const decimalPattern = /^\d+(\.\d+)?$/;

        ([
            "bw_khz",
            "tx_gain",
            "tx_height_m",
            "rx_gain",
            "rx_height_m",
            "min_sinr_required_db",
            "noise_figure_db",
        ] as NumericKey[]).forEach((key) => {

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
            bw_khz: Number(raw.bw_khz),
            tx_gain: Number(raw.tx_gain),
            tx_height_m: Number(raw.tx_height_m),
            rx_gain: Number(raw.rx_gain),
            rx_height_m: Number(raw.rx_height_m),
            min_sinr_required_db: Number(raw.min_sinr_required_db),
            noise_figure_db: Number(raw.noise_figure_db),
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

    const fields: {
        key: "name" | NumericKey;
        label: string;
        placeholder: string;
    }[] = [
        {
            key: "name",
            label: "שם הפלטפורמה:",
            placeholder: "הכנס את שם הפלטפורמה שלך",
        },
        {
            key: "bw_khz",
            label: "רוחב פס התדר (KHz):",
            placeholder: "הכנס את רוחב הפס של הפלטפורמה",
        },
        {
            key: "tx_gain",
            label: "רווח אנטנת שידור (dB):",
            placeholder: "הכנס את רווח אנטנת השידור",
        },
        {
            key: "tx_height_m",
            label: "גובה אנטנת שידור (m):",
            placeholder: "הכנס את גובה אנטנת השידור",
        },
        {
            key: "rx_gain",
            label: "רווח אנטנת קליטה (dB):",
            placeholder: "הכנס את רווח אנטנת הקליטה",
        },
        {
            key: "rx_height_m",
            label: "גובה אנטנת קליטה (m):",
            placeholder: "הכנס את גובה אנטנת הקליטה",
        },
        {
            key: "min_sinr_required_db",
            label: "SNR מינימלי נדרש (dB):",
            placeholder: "הכנס את ה-SNR המינימלי הנדרש",
        },
        {
            key: "noise_figure_db",
            label: "Noise figure (dB):",
            placeholder: "הכנס את רעש המקלט (Noise Figure)",
        },
    ];



    return (
        <main className="p-5">
            <div className="bg-blue-100 rounded-xl p-10 md:p-10 w-[1800px] h-[750px] mx-auto shadow-md flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                    <div className="p-10 space-y-6 max-h-[650px] overflow-y-auto">
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
            </div>
        </main>
    )
}

export default Platform