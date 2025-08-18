import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Label } from "../ui/label";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";

function Platform() {

    const [platform, setPlatform] = useState({
        name: "",
        frequency_mhz: 0.0,
        bw_khz: 0.0,
        tx_power_dbm: 0.0,
        antenna_height_m: 0.0
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
            tmp.name = "name is required!";
            valid = false;
        }

        const checkPos = (val: number, field: keyof typeof tmp) => {
            if (!Number.isFinite(val)){
                tmp[field] = "must be a float number";
                valid = false;
            } else if(val <= 0){
                tmp[field] = "field must be > 0";
                valid = false;
            }
        };

        checkPos(platform.frequency_mhz, "frequency_mhz");
        checkPos(platform.bw_khz, "bw_khz");
        checkPos(platform.tx_power_dbm, "tx_power_dbm");
        checkPos(platform.antenna_height_m, "antenna_height_m");

        setErr(tmp);
        return valid;
    };

    const onChangeText = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPlatform(p => ({ ...p, name: e.target.value }));
        if (err.name) setErr(prev => ({ ...prev, name: "" }));
    };

    const onChangNumber = (key: "frequency_mhz" | "bw_khz" | "tx_power_dbm" | "antenna_height_m") => {
        return (e: React.ChangeEvent<HTMLInputElement>) => {
            const v = e.target.value;
            const n = v.trim() === "" ? NaN : Number(v);
            setPlatform(p => ({ ...p, [key]: n } as any));
            if (err[key]) setErr(prev => ({ ...prev, [key]: "" }));
        }
    }

    const handleSubmit = (e : React.FormEvent) => {
        e.preventDefault();
        if(validatePlatform()){
            console.log("platform created");
            navigate("/home");
        }
        return;
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
            <div className="bg-blue-100 rounded-xl p-10 w-[1800px] h-[750px] mx-auto shadow-md flex items-center justify-center">
                <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md space-y-6">
                    <h1 className="suez-one-regular text-6xl text-center text-blue-700">
                        קליטת פלטפורמה
                    </h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {fields.map((field) => (
                            <div className="space-y-2" key={field.key}>
                                <Label htmlFor={field.key} className="huninn-regular text-lg text-gray-700">
                                    {field.label}
                                </Label>
                                <Input 
                                    id={field.key}
                                    type= {field.key === "name" ? "text" : "number"}
                                    value={field.key === "name"
                                        ? platform.name :
                                        Number.isFinite(platform[field.key] as number) ?
                                        (platform[field.key] as number) : ""
                                    }
                                    placeholder={field.placeholder}
                                    onChange={
                                        field.key === "name" ?
                                        onChangeText :
                                        onChangNumber(field.key)
                                    }>   
                                </Input>
                                {err[field.key] && <p className="text-sm text-red-600">{err[field.key]}</p>}
                            </div>
                        ))}

                        <Button className="hover:text-blue-600 w-full mt-4 text-lg huninn-regular shadow-md" onClick={handleSubmit}>
                            יצירת פלטפורמה
                        </Button>
                        
                    </form>
                </div>
            </div>
        </main>
    )
}

export default Platform