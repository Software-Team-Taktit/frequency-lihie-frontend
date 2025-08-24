import { useAuth } from '../../context/AuthContext.tsx';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';

function NavBar() {
    const navigate = useNavigate();
    const {user, logout} = useAuth();

    const handleLogout = () =>{
        logout();
        navigate("/home");
    };

    return (
        <header className="bg-white dark:bg-gray-900 shadow-md">
            <nav className="h-16 w-full flex justify-between items-center px-6">
                <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    <Link to="/home" className="hover:text-blue-600 transition-all huninn-regular">מרחבים</Link>
                    <Link to="/platform" className="hover:text-blue-600 transition-all huninn-regular mr-5">פלטפורמה</Link>
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
                                        {user.first_name} {user.last_name} 
                                    </div>
                                    <div className="text-xs text-gray-500">{user.personal_id}</div>
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