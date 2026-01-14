import { useAuth } from '../../context/AuthContext.tsx';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import merhavim_logo from "../../assets/merhavim_logo.png";

function NavBar() {
    const navigate = useNavigate();
    const {user, logout} = useAuth();

    const handleLogout = () =>{
        logout();
        navigate("/home");
    };

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
                        <div className="w-64 mr-6 mt-2">
                            <div className="h-2 w-full bg-gray-200 overflow-hidden">
                                <div className="h-full w-full bg-blue-500" />
                            </div>
                            <div className="flex justify-between text-[15px] text-gray-600 mt-1 huninn-regular" dir='ltr'>
                                <span>500 MHz</span>
                                <span>1600 MHz</span>
                            </div>
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
        </header>
    )
}

export default NavBar;