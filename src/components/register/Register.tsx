import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";


function Register() {
    const [form, setForm] = useState({
        personalId: "",
        firstName: "",
        lastName: ""
    });

    let [err, setErr] = useState({
        personalId: "",
        firstName: "",
        lastName: ""
    });

    const navigate = useNavigate();

    const validate = (): boolean => {
        let valid = true;
        const tmp = {
            personalId: "",
            firstName: "",
            lastName: ""
        };

        if(!/^\d{7}$/.test(form.personalId)){
            tmp.personalId = "Personal Id must be exactly 7 digits.";
            valid = false;
        }
        if(form.firstName.trim().length < 2){
            tmp.firstName = "First name is required.";
            valid = false;
        }
        if(form.lastName.trim().length < 2){
            tmp.lastName = "Last name is required.";
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
        {key: "personalId", label: "Personal Id: ", placeholder: "Enter 7-digits personal Id"},
        {key: "firstName", label: "First Name: ", placeholder: "Enter first name"},
        {key: "lastName", label: "Last Name: ", placeholder: "Enter last name"}
    ];

    return (
        <div className="max-w-md mx-auto mt-20 space-y-6 p-4 border rounded-xl shadow-lg">
            <h1 className="text-2xl font-bold text-center">Create an account</h1>

            {fields.map((field) => (
                <div className="space-y-2" key={field.key}>
                    <Label htmlFor={field.key}>{field.label}</Label>
                    <Input
                        id={field.key}
                        value={form[field.key]}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        placeholder={field.placeholder}
                    />
                    {err[field.key] && (
                        <p className="text-sm text-red-500">{err[field.key]}</p>
                    )}
                </div>
            ))}

            <Button className="w-full" onClick={handleSubmit}>Register</Button>
        </div>
    );
}

export default Register