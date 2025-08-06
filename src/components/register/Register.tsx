import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";


function Register() {
    const [form, setForm] = useState({
        personalId: "",
        unit: "",
        firstName: "",
        lastName: ""
    });

    let [err, setErr] = useState({
        personalId: "",
        unit: "",
        firstName: "",
        lastName: ""
    });

    const navigate = useNavigate();

    const validate = (): boolean => {
        let valid = true;
        const tmp = {
            personalId: "",
            unit: "",
            firstName: "",
            lastName: ""
        };

        if(!/^\d{7}$/.test(form.personalId)){
            tmp.personalId = "מספר אישי חייב להיות בעל 7 ספרות.";
            valid = false;
        }
        if(form.unit.trim().length < 2){
            tmp.unit = "שם היחידה חייב להיות לפחות 2 תווים.";
            valid = false;
        }
        if(form.firstName.trim().length < 2){
            tmp.firstName = "שם פרטי חייב לכלול לפחות 2 תווים.";
            valid = false;
        }
        if(form.lastName.trim().length < 2){
            tmp.lastName = "שם משפחה חייב לכלול לפחות 2 תווים.";
            valid = false;
        }
        setErr(tmp);
        return valid;
    };

    const handleChange = (key: keyof typeof form, value: string) => {
        setForm({ ...form, [key]: value });
    };

    const handleSubmit = () => {
        if(validate()){
            console.log("✅ Registered: ", form);
            navigate("/home");
        }
    }

    const fields: {
        key: keyof typeof form;
        label: string;
        placeholder: string;
    }[] = [
        {key: "personalId", label: "מספר אישי: ", placeholder: "הכנס מספר אישי בעל 7 ספרות"},
        {key: "unit", label: "יחידה: ", placeholder: "הכנס את שם היחידה שלך"},
        {key: "firstName", label: "שם פרטי: ", placeholder: "הכנס שם פרטי"},
        {key: "lastName", label: "שם משפחה: ", placeholder: "הכנס שם משפחה"}
    ];

    return (
        <main className="p-5">
            <div className="bg-blue-100 rounded-xl p-10 w-[1800px] h-[750px] mx-auto shadow-md flex items-center justify-center">
                <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md space-y-6">
                    <h1 className="suez-one-regular text-6xl text-center text-blue-700">
                        הרשמה למערכת
                    </h1>

                    {fields.map((field) => (
                        <div className="space-y-2" key={field.key}>
                            <Label htmlFor={field.key} className="huninn-regular text-lg text-gray-700">
                                {field.label}
                            </Label>
                            <Input
                                id={field.key}
                                value={form[field.key]}
                                onChange={(e) => handleChange(field.key, e.target.value)}
                                placeholder={field.placeholder}
                            />
                            {err[field.key] && (
                                <p className="text-dm text-red-500">{err[field.key]}</p>
                            )}
                        </div>
                    ))}

                    <Button className="hover:text-blue-600 w-full mt-4 text-lg huninn-regular shadow-md " onClick={handleSubmit}>
                        הרשמה
                    </Button>
                </div>
            </div>
        </main>
    );

}

export default Register