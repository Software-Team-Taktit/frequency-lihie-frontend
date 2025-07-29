import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";

function Home() {
    const navigate = useNavigate();

    return (
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-white dark:from-gray-900 dark:to-gray-800 px-6">
            <div className="text-center space-y-8 bg-white dark:bg-gray-900 p-10 rounded-2xl shadow-xl max-w-xl w-full border dark:border-gray-700">
                <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">Welcome to Merhavim</h1>
                <p className="text-gray-600 dark:text-gray-300 text-lg">
                    A smart emergency spectrum management system that enables real-time frequency allocation
                    based on environmental conditions and operational needs.
                </p>
                <div className="flex justify-center gap-4 pt-4">
                    <Button onClick={() => navigate("/logIn")}>Log In</Button>
                    <Button variant="outline" onClick={() => navigate("/register")}>Register</Button>
                </div>
            </div>
        </main>
    );
}

export default Home;