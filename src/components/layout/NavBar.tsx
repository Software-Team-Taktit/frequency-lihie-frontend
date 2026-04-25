import { useAuth } from '../../context/AuthContext.tsx';
import { useEffect, useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import merhavim_logo from "../../assets/merhavim_logo.png";
import  { getFrequencyRange, updateFrequencyRange } from "../../services/ConfigApi.ts";
import type { FrequencyRangeConfig } from "../../services/ConfigApi.ts";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog.tsx';
import { Label } from '@radix-ui/react-label';
import { Input } from '../ui/input.tsx';

function NavBar() {
    const navigate = useNavigate();
    const {user, logout} = useAuth();

    const isAdmin = !!user && String(user.type).toLowerCase() === "admin";

    const DEFAULT_RANGE: FrequencyRangeConfig = { min_mhz: 500, max_mhz: 1600 };
    const [range, setRange] = useState<FrequencyRangeConfig>(DEFAULT_RANGE);
    const [loadingRange, setLoadingRange] = useState(false);

    const [showDialog, setShowDialog] = useState(false);
    const [draftMin, setDraftMin] = useState<string>("");
    const [draftMax, setDraftMax] = useState<string>("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogout = () =>{
        logout();
        navigate("/home");
    };

    useEffect(() => {
        (async () => {
            setLoadingRange(true);
            setError(null);
            try{
                const r = await getFrequencyRange();
                setRange(r);
            } catch (e: any) {
                setError(e?.response?.data?.detail ?? "Failed to load frequency range");
            } finally {
                setLoadingRange(false);
            }
        })();
    }, []);

    const openEdit = () => {
        if(!range) return;
        setDraftMin(String(range.min_mhz));
        setDraftMax(String(range.max_mhz));
        setError(null);
        setShowDialog(true);
    }

    const onSave = async () => {
        if (!range) return;

        const min = Number(draftMin);
        const max = Number(draftMax);

        if(!Number.isFinite(min) || !Number.isFinite(max)){
            setError("אנא להזין מספרים תקינים");
            return;
        }

        if(min <= 0 || max <= 0){
            setError("התדרים חייבים להיות גדולים מ-0");
            return;
        }

        setSaving(true);
        setError(null);

        try {
            const updated = await updateFrequencyRange({
                min_mhz: min,
                max_mhz: max,
            });
            setRange(updated);
            setShowDialog(false);
        } catch (e:any) {
            setError(e?.response?.data?.detail ?? "Failed to save frequency range");
        } finally {
            setSaving(false);
        }
    }   

    return (
        <header className="bg-white dark:bg-gray-900 shadow-md">
            <nav className="w-full flex justify-between items-center px-6">
                <div className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-6">
                    <Link to="/home" className="flex items-center">
                        <img src={merhavim_logo} alt='מרחבים לוגו' className='h-[70px] w-[150px] object-contain '/>
                    </Link>
                    <div className="flex items-center gap-4 ">
                        <Link to="/platform" className="hover:text-blue-600 transition-all huninn-regular mr-5">פלטפורמה</Link>
                        <Link to="/mission" className="hover:text-blue-600 transition-all huninn-regular mr-5">משימה</Link>
                        <Link to="/missionsMap" className="hover:text-blue-600 transition-all huninn-regular mr-5">
                            מפת משימות
                        </Link>
                        <div className="w-64 mr-6 mt-2">
                            <div className="h-2 w-full bg-gray-200 overflow-hidden">
                                <div className="h-full w-full bg-blue-500" />
                            </div>
                            <div className="mt-1 flex items-center justify-between gap-2" dir="ltr">
                                <div className="flex justify-between text-[15px] text-gray-600 huninn-regular w-full">
                                    <span>
                                        {
                                            loadingRange ?
                                            "Loading..." :
                                            range ?
                                            `${range.min_mhz} MHz` :
                                            "— MHz"
                                        }
                                    </span>
                                    <span>
                                        {
                                            loadingRange ?
                                            "" :
                                            range ?
                                            `${range.max_mhz} MHz` :
                                            "— MHz"
                                        }
                                    </span>
                                </div>

                                {
                                    isAdmin && (
                                        <Button type='button' onClick={openEdit}
                                        className='text-xs huninn-regular px-2 py-1 rounded border border-gray-300 hover:bg-gray-50 text-gray-700' title='עריכת טווח תדרים'>
                                            עריכה
                                        </Button>
                                    )
                                }
                            </div>
                            {error && !showDialog && (
                                <div className="mt-1 text-xs text-red-500">{error}</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    {
                        !user ? (
                            <>
                                <Link to="/register"><Button className="huninn-regular hover:text-blue-600 font-bold text-2xl px-4 py-2 mr-4 text-gray-800">הרשמה</Button></Link>
                                <Link to="/logIn"><Button className="huninn-regular hover:text-blue-600 font-bold text-2xl px-4 py-2 text-gray-800">התחברות</Button></Link>
                            </>
                        ) : (<>
                                <Button className="huninn-regular hover:text-blue-600 font-bold text-2xl px-4 py-2 ml-4 text-gray-800 m" onClick={handleLogout}>התנתקות</Button>
                                <div className="text-right leading-tight text-2xl">
                                    <div className="font-semibold text-gray-800 dark:text-gray-100 huninn-regular">
                                        {user.first_name} {user.last_name} - {user.unit}
                                    </div>
                                    <div className="text-xs text-gray-500">{user.type === "admin" ? 
                                    `${user.personal_id} - administrator` : user.personal_id}</div>
                                </div>
                            </>
                        )
                    }
                </div>
            </nav>

            {
                isAdmin && (
                    <Dialog 
                    open={showDialog}
                    onOpenChange={(open)=> {
                        if (saving) return;
                        setShowDialog(open);
                        if(!open) setError(null);
                    }}>
                        <DialogContent className='sm:max-w-[425px] rounded-xl bg-blue-100 border border-black'>
                            <DialogHeader>
                                <DialogTitle className='text-right huninn-regular'>שינוי טווח תדרים מאושר</DialogTitle>
                                <DialogDescription className='text-right huninn-regular'>
                                    הערך יתעדכן וישפיע על בחירת התדרים.
                                    אנא הזין/י מינימום ומקסימום MHz.
                                </DialogDescription>
                            </DialogHeader>
                            <div className='mt-2 flex gap-3' dir='ltr'>
                                <div className='flex-1'>
                                    <Label className='block text-xs text-gray-600 mb-1 huninn-regular'>Min (MHz)</Label>
                                    <Input type='number' className='w-full rounded-xl border border-black px-3 py-2 text-sm bg-white'
                                    value={draftMin} onChange={(e) => setDraftMin(e.target.value)}
                                    disabled={saving}/>
                                </div>
                                <div className='flex-1'>
                                    <Label className='block text-xs text-gray-600 mb-1 huninn-regular'>Max (MHz)</Label>
                                    <Input type='number' className='w-full rounded-xl border border-black px-3 py-2 text-sm bg-white'
                                    value={draftMax} onChange={(e) => setDraftMax(e.target.value)}
                                    disabled={saving}/>
                                </div>
                            </div>
                            {error && (
                                <div className='text-right text-xs text-red-600 huninn-regular'>
                                    {error}
                                </div>
                            )}
                            <div className='mt-2 flex justify-end gap-2'>
                                <Button
                                className='hover:text-blue-900 border rounded-xl huninn-regular border-black'
                                onClick={() => setShowDialog(false)}
                                disabled={saving}>
                                    ביטול
                                </Button>
                                <Button
                                onClick={onSave}
                                className='hover:text-blue-900 border rounded-xl huninn-regular border-black'
                                disabled={saving}> 
                                    {saving ? "שמירה" : "שומר..."}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                )
            }
        </header>
    )
}

export default NavBar;