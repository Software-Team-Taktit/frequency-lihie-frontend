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
            <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                <div className="text-xl font-bold text-gray-800 dark:text-white">
                    <Link to="/home">Merhavim</Link>
                </div>

                <div className="flex items-center gap-4">
                    {
                        !isLoggedIn ? (
                            <>
                                <Link to="/register"><Button variant="ghost">Register</Button></Link>
                                <Link to="/logIn"><Button>Log In</Button></Link>
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