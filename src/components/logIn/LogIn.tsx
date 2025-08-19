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
import { useState } from "react";

function LogIn() {
    const [personalId, setPersonalId] = useState("");
    let [errData, setErrData] = useState("");
    const [showDialog, setShowDialog] = useState(false);
    const navigate = useNavigate();

    const validatePersonalId = () => {
        if(personalId.length != 7){
            setErrData("מספר אישי חייב להיות 7 ספרות בדיוק.");
            return false;
        }
        setErrData("");
        return true;
    }

    const handleSubmit = () => {
        const isValid = validatePersonalId();
        if(isValid){
            setShowDialog(true);
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
                        <DialogContent className="bg-gray-600 border border-black">
                            <DialogHeader>
                                <DialogTitle>חשבון לא נמצא!</DialogTitle>
                                <DialogDescription>
                                    אין לך חשבון אצלנו במערכת.
                                    תרצה ליצור חשבון חדש?
                                </DialogDescription>
                            </DialogHeader>
                            <Button onClick={handleCreateAccount} className="hover:text-blue-900 border border-black">יצירת חשבון חדש</Button>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </main>
    );
}

export default LogIn