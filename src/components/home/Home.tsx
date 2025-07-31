import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";

function Home() {
    const navigate = useNavigate();

    return (
        <main className="p-5">
            <div className="bg-blue-100 rounded-xl p-10 w-[1800px] h-[750px] mx-auto shadow-md flex items-center justify-center">
                <div className="bg-white p-10 rounded-2xl shadow-2xl text-center space-y-6 max-w-3xl w-full">
                    <h1 className="font-luckiest text-8xl text-blue-700">Welcome to Merhavim</h1>
                    <p className="font-dm text-gray-700 text-2xl max-w-2xl mx-auto">
                        A smart emergency spectrum management system that enables real-time frequency allocation
                        based on environmental conditions and operational needs.
                    </p>
                    <div className="flex justify-center gap-6 pt-6">
                        <Button className="bg-blue-500 hover:bg-blue-200 text-white px-6 py-3 rounded-lg shadow-md text-lg font-semibold transition duration-200" onClick={() => navigate("/logIn")}>Log In</Button>
                        <Button className="bg-blue-500 hover:bg-blue-200 text-white px-6 py-3 rounded-lg shadow-md text-lg font-semibold transition duration-200" variant="outline" onClick={() => navigate("/register")}>Register</Button>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default Home;