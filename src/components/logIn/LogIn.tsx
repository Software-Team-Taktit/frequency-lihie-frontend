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

    return(
        <div className="max-w-md mx-auto mt-20 space-y-6 p-4 border rounded-xl shadow-lg">
            <h1 className="text-2xl font-bold text-center">Log In</h1>

            <div className="space-y-2">
                <Label htmlFor="personalId" className="block text-sm font-medium">Personal Id: </Label>
                <Input
                    id="personalId"
                    type="text"
                    value={personalId}
                    onChange={(e) => setPersonalId(e.target.value)}
                    placeholder="Enter your 7-digits personal Id"
                />
                {errData && (
                    <p className="text-sm text-red-500 mt-1">{errData}</p>
                )}
            </div> 
            <Button className="w-full" onClick={handleSubmit}>Sign In</Button>

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>User not found!</DialogTitle>
                        <DialogDescription>
                            You don't have an account.
                        </DialogDescription>
                    </DialogHeader>
                    <Button onClick={handleCreateAccount}>Create an account</Button>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default LogIn