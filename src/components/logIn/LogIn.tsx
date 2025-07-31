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
            setErrData("Personal Id must be exactly 7 digits.");
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
            <div className="bg-blue-100 rounded-xl p-10 w-[1800px] h-[750px] mx-auto shadow-md flex items-center justify-center">
                <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md space-y-6">
                    <h1 className="font-luckiest text-6xl text-center text-blue-700">
                        Log In
                    </h1>

                    <div className="space-y-2">
                        <Label htmlFor="personalId" className="font-dm text-lg text-gray-700">
                            Personal Id:
                        </Label>
                        <Input
                            id="personalId"
                            type="text"
                            value={personalId}
                            onChange={(e) => setPersonalId(e.target.value)}
                            placeholder="Enter your 7-digits personal Id"
                        />
                        {errData && (
                            <p className="text-sm text-red-500">{errData}</p>
                        )}
                    </div>

                    <Button className="w-full text-lg font-semibold shadow-md hover:text-blue-600" onClick={handleSubmit}>
                        Sign In
                    </Button>

                    <Dialog open={showDialog} onOpenChange={setShowDialog}>
                        <DialogContent className="bg-gray-600 border border-black">
                            <DialogHeader>
                                <DialogTitle>User not found!</DialogTitle>
                                <DialogDescription>
                                    You don't have an account.
                                </DialogDescription>
                            </DialogHeader>
                            <Button onClick={handleCreateAccount} className="hover:text-blue-900 border border-black">Create an account</Button>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </main>
    );
}

export default LogIn