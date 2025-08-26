import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from "../ui/dialog";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import { loginByPersonalId } from "../../services/UserApi";
import { HttpError } from "../../services/BaseApi";
import type { UserLogInRequest } from "../../interfaces/UserInterface";


function LogIn() {
    const [personalId, setPersonalId] = useState("");
    let [errData, setErrData] = useState("");
    const [showDialog, setShowDialog] = useState(false);
    const { setUser } = useAuth();
    const navigate = useNavigate();

    const validatePersonalId = () => {
        if(personalId.length != 7){
            setErrData("מספר אישי חייב להיות 7 ספרות בדיוק.");
            return false;
        }
        setErrData("");
        return true;
    }

    const handleSubmit = async () => {
        const isValid = validatePersonalId();
        if (!isValid) return;

        try{
            const dto: UserLogInRequest = {
                personal_id: personalId
            }
            const me = await loginByPersonalId(dto);
            setUser(me);
            navigate("/home");
        } catch(e) {
            const err = e as HttpError;
            if(err.status === 404) {
                setShowDialog(true);
            }else {
                setErrData(err.message || "שגיאה בהתחברות");
            }
        }
    };

    const handleCreateAccount = () => {
        setShowDialog(false);
        navigate("/register");
    };

    return (
        <main className="p-5">
            <div className="bg-blue-100 rounded-xl p-10 w-[1800px] h-[800px] mx-auto shadow-md flex items-center justify-center">
                <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md space-y-3">
                    <h1 className="suez-one-regular text-6xl text-center text-blue-700">
                        התחברות לחשבון שלך
                    </h1>

                    <div className="space-y-2">
                        <Label htmlFor="personalId" className="huninn-regular text-lg text-gray-700">
                            מספר אישי:
                        </Label>
                        <Input
                            className="rounded"
                            id="personalId"
                            type="text"
                            value={personalId}
                            onChange={(e) => setPersonalId(e.target.value)}
                            placeholder="הכנס מספר אישי בעל 7 ספרות"
                        />
                        {errData && (
                            <p className="text-sm text-red-500">{errData}</p>
                        )}
                    </div>

                    <Button className="w-full text-lg huninn-regular shadow-md hover:text-blue-600" onClick={handleSubmit}>
                        התחברות
                    </Button>

                    <Dialog open={showDialog} onOpenChange={setShowDialog}>
                        <DialogContent className="sm:max-w-[425px] rounded-xl bg-blue-100 border border-black">
                            <DialogHeader>
                                <DialogTitle className="text-right huninn-regular">חשבון לא נמצא!</DialogTitle>
                                <DialogDescription className="text-right huninn-regular">
                                    אין לך חשבון אצלנו במערכת.
                                    תרצה ליצור חשבון חדש?
                                </DialogDescription>
                            </DialogHeader>
                            <Button onClick={handleCreateAccount} className="hover:text-blue-900 border rounded-xl text-right huninn-regular border-black">יצירת חשבון חדש</Button>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </main>
    );
}

export default LogIn