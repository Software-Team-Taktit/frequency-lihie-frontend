import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { UserApi, loginByPersonalId } from "../../services/UserApi";
import { useAuth } from "../../context/AuthContext.tsx";
import type { CreateUserRequest, UserLogInRequest } from "../../interfaces/UserInterface";
import { HttpError } from "../../services/BaseApi.ts";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from "../ui/dialog";

function Register() {
    const [form, setForm] = useState({
        personalId: "",
        firstName: "",
        lastName: "",
        unit: ""
    });

    let [err, setErr] = useState({
        personalId: "",
        firstName: "",
        lastName: "",
        unit: ""
    });
    const [serverErr, setServerErr] = useState<string>("");
    const [showDialog, setShowDialog] = useState(false);
    const {setUser} = useAuth();
    const navigate = useNavigate();

    const validate = (): boolean => {
        let valid = true;
        const tmp = {
            personalId: "",
            firstName: "",
            lastName: "",
            unit: ""
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
        setForm((p) => ({ ...p, [key]: value }));
        if (err[key]) setErr((e) => ({ ...e, [key]: "" }));  
        if (serverErr) setServerErr("");  
    };

    const handleSubmit = async () => {
        if(!validate()) return;

        const dto: CreateUserRequest = {
            personal_id: form.personalId.trim(),
            first_name: form.firstName.trim(),
            last_name: form.lastName.trim(),
            unit: form.unit.trim()
        };

        try{
            setServerErr("");
            const created = await UserApi.create(dto);
            console.log("registered: ", created);
            const logInDto : UserLogInRequest = {
                personal_id: created.personal_id
            };
            const me = await loginByPersonalId(logInDto);
            setUser(me);
            navigate("/home");
        } catch (e:any){
            if(e.status === 409) {
                setServerErr("כבר קיים משתמש עם המספר האישי הזה!");
                setShowDialog(true);
                form.personalId = "";
                form.firstName = "";
                form.lastName = "";
                form.unit = "";
            }
            const errObj = e as HttpError;
            setServerErr(errObj?.message || "שגיאה בהרשמה");
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
            <div className="bg-blue-100 rounded-xl p-10 md:p-10 w-[1800px] h-[750px] mx-auto shadow-md flex items-center justify-center">
                <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md space-y-3">
                    <h1 className="suez-one-regular text-6xl text-center text-blue-700">
                        הרשמה למערכת
                    </h1>

                    {fields.map((field) => (
                        <div className="space-y-2" key={field.key}>
                            <Label htmlFor={field.key} className="huninn-regular text-lg text-gray-700">
                                {field.label}
                            </Label>
                            <Input
                                className="rounded"
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




                    <Dialog open={showDialog} onOpenChange={setShowDialog}>
                        <DialogContent className="sm:max-w-[425px] rounded-xl bg-blue-100 border border-black">
                            <DialogHeader>
                                <DialogTitle className="text-right huninn-regular">קיים משתמש עם מספר אישי זה!</DialogTitle>
                                <DialogDescription className="text-right huninn-regular">
                                    נסו שוב עם מספר אישי אחר, או התחברי אם כבר יש לך חשבון.
                                </DialogDescription>
                            </DialogHeader>
                            <Button onClick={() => setShowDialog(false)} className="hover:text-blue-900 border rounded-xl text-right huninn-regular border-black">נסו שוב</Button>
                            <Button onClick={() => {
                                setShowDialog(false);
                                navigate("/login");
                            }} className="hover:text-blue-900 border text-right huninn-regular rounded-xl border-black">מעבר להתחברות</Button>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </main>
    );

}

export default Register