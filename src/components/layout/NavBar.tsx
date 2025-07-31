import {useState} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';

function NavBar() {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const handleLogout = () =>{
        setIsLoggedIn(false);
        navigate("/home");
    };

    return (
        <header className="bg-white dark:bg-gray-900 shadow-md">
            <nav className="h-16 w-full flex justify-between items-center px-10 max-w-screen-xl mx-auto">
                <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    <Link to="/home" className="hover:text-blue-600 transition-all">Merhavim</Link>
                </div>

                <div className="flex items-center space-x-4">
                    {
                        !isLoggedIn ? (
                            <>
                                <Link to="/register"><Button className="hover:text-blue-600 font-bold text-2xl px-4 py-2 mr-4 text-gray-800">Register</Button></Link>
                                <Link to="/logIn"><Button className="hover:text-blue-600 font-bold text-2xl px-4 py-2 text-gray-800">Log In</Button></Link>
                            </>
                        ) : (
                            <Button variant="outline" onClick={handleLogout}>
                                Log Out
                            </Button>
                        )
                    }
                </div>
            </nav>
        </header>
    )
}

export default NavBar;